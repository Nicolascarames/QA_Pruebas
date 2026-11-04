// Inyecta (o refresca) el bloque «Ver en el programa» en aula-istqb.html. Re-ejecutable: sustituye entre marcadores.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const IC = "/*PROG-CSS-INICIO*/", FC = "/*PROG-CSS-FIN*/";
const IJ = "/*PROG-JS-INICIO*/", FJ = "/*PROG-JS-FIN*/";
const ANCLA_PRACTICA = "body+=askHTML();";
const ANCLA_SIM = "${explHTML(q)}</div></details>";

const veces = (s, sub) => s.split(sub).length - 1;

// Coloca `bloque` (con marcadores) justo antes de `cierre`, o sustituye el bloque ya existente.
function poner(html, ini, fin, bloque, cierre) {
  const a = html.indexOf(ini), b = html.indexOf(fin);
  if (a >= 0 && b > a) return html.slice(0, a) + bloque + html.slice(b + fin.length);
  if (veces(html, cierre) !== 1) throw new Error(`Falta (o no es único) el anclaje ${cierre}`);
  return html.replace(cierre, () => bloque + String.fromCharCode(10) + cierre);
}

// Anclaje de llamada: exactamente una vez, salvo que ya esté inyectada.
function llamada(html, ancla, nueva) {
  const sinBloque = quitarJs(html);
  if (sinBloque.includes("programaHTML(")) return html;
  if (veces(html, ancla) !== 1) throw new Error(`Falta (o no es único) el anclaje ${ancla}`);
  return html.replace(ancla, () => nueva);
}

function quitarJs(html) {
  const a = html.indexOf(IJ), b = html.indexOf(FJ);
  return a >= 0 && b > a ? html.slice(0, a) + html.slice(b + FJ.length) : html;
}

export function inyectar(html, datos, js, css) {
  const json = JSON.stringify(datos).replace(/<\//g, "<\\/");
  let h = poner(html, IC, FC, `${IC}\n${css}\n${FC}`, "</style>");
  h = poner(h, IJ, FJ, `${IJ}\nconst PROGRAMA = ${json};\n${js}\nactivarTerminos();\n${FJ}`, "</script>");
  h = llamada(h, ANCLA_PRACTICA, `${ANCLA_PRACTICA}\n    body+=programaHTML(q.fuente);`);
  // Segunda llamada: tras la primera, programaHTML( ya existe fuera de marcadores; se comprueba aparte
  if (!h.includes("${programaHTML(q.fuente)}</div></details>")) {
    if (veces(h, ANCLA_SIM) !== 1) throw new Error(`Falta (o no es único) el anclaje ${ANCLA_SIM}`);
    h = h.replace(ANCLA_SIM, () => "${explHTML(q)}${programaHTML(q.fuente)}</div></details>");
  }
  return h;
}

// Ejecución directa
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dir = dirname(fileURLToPath(import.meta.url));
  const raiz = join(dir, "..");
  const ruta = process.argv[2] || join(raiz, "aula-istqb.html");
  const leer = f => JSON.parse(readFileSync(join(raiz, "documentos", "programa-es", f), "utf8"));
  const datos = { apartados: leer("apartados.json"), glosario: leer("glosario.json"), diferencias: leer("diferencias.json") };
  const js = readFileSync(join(dir, "programa-bloque.js"), "utf8");
  const css = readFileSync(join(dir, "programa-bloque.css"), "utf8");
  const antes = readFileSync(ruta, "utf8");
  const despues = inyectar(antes, datos, js, css);
  writeFileSync(ruta, despues);
  console.log(`${ruta}: ${Buffer.byteLength(antes)} -> ${Buffer.byteLength(despues)} bytes`);
}
