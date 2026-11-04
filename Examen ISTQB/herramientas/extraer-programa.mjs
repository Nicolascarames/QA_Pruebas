// Extrae los apartados del programa CTFL v4.0 en español (PDF oficial SSTQB) a apartados.json.
// Uso: node "Examen ISTQB/herramientas/extraer-programa.mjs"
// Solo limpia el diseño (cabeceras, pies, saltos de línea, viñetas); nunca cambia palabras.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const raiz = new URL("../", import.meta.url);
const pdf = new URL("documentos/CTFL - V4.0 - ES - PROGRAMA DE ESTUDIO - V001.01.pdf", raiz);
const salida = new URL("documentos/programa-es/apartados.json", raiz);

// Parches de formato (solo formato, nunca palabras): id -> [[buscar, reemplazar]]
const PARCHES = {
  // 4.5.1: las dos tablas salen del PDF como líneas sueltas; se pasan a tabla Markdown
  "4.5.1": [
    ["Inglés          Español\n\nCard →          Cuartilla", "| Inglés | Español |\n|---|---|\n| Card → | Cuartilla"],
    [" tablón electrónico)\n\nConversation →  Conversación", " tablón electrónico) |\n| Conversation → | Conversación"],
    ["(puede ser documentada o verbal)\n\nConfirmation →  Confirmación", "(puede ser documentada o verbal) |\n| Confirmation → | Confirmación"],
    ["(véase la sección 4.5.2)\n\nEl formato", "(véase la sección 4.5.2) |\n\nEl formato"],
    ["Español  Inglés\n\nIndependiente I Independent\n\nNegociable N Negotiable\n\nValioso/a V Valuable\n\nEstimable E Estimable\n\nPequeño/a S Small\n\nCapacidad de Prueba T Testable",
     "| Español | Inglés |\n|---|---|\n| Independiente | I Independent |\n| Negociable | N Negotiable |\n| Valioso/a | V Valuable |\n| Estimable | E Estimable |\n| Pequeño/a | S Small |\n| Capacidad de Prueba | T Testable |"],
  ],
};

const tmp = join(mkdtempSync(join(tmpdir(), "ctfl-")), "programa.txt");
execFileSync("pdftotext", ["-enc", "UTF-8", "-layout", decodeURIComponent(pdf.pathname.replace(/^\//, "")), tmp]);
const bruto = readFileSync(tmp, "utf8").replace(/\f/g, "").split(/\r?\n/);

// --- 1. Recorte del cuerpo: del capítulo 1 (sin puntos de índice) hasta «7 Referencias»
const CAP = /^([1-6]) (Fundamentos del Proceso|Prueba a lo Largo|Prueba Estática|Análisis y Diseño|Gestión de las Actividades|Herramientas de Prueba)/;
let ini = bruto.findIndex(l => CAP.test(l) && !/\.{4,}/.test(l));
let fin = bruto.findIndex((l, i) => i > ini && /^7 Referencias\s*$/.test(l));
let lineas = bruto.slice(ini, fin);

// --- 2. Cabeceras y pies de página: se sustituyen por un marcador de salto de página
const PB = "\u0001";
const esCab = l =>
  /^Versión 4\.0\s+Página \d+ de 87/.test(l) ||
  /^© International Software Testing Qualifications Board/.test(l) ||
  /^Probador Certificado del ISTQB/.test(l) ||
  /^\s+Software Testing\s*$/.test(l) ||
  /^Programa de Estudio – Nivel Básico\s+Qualifications Board/.test(l);
const l2 = [];
for (const l of lineas) {
  if (esCab(l)) { if (l2[l2.length - 1] !== PB) l2.push(PB); }
  else l2.push(l.replace(/\s+$/, ""));
}
lineas = l2;

// --- 3. Detección de títulos y reparto de líneas por apartado
const TIT = /^(\d(?:\.\d+){1,2})\s+(\S.*)$/;
const apartados = [];
const porId = new Map();
let actual = null;
let capNum = null, esperaObj = false, vistoPrimero = false, enCuerpo = false;
const nueva = (id, titulo, padre) => {
  if (porId.has(id)) return null;
  const a = { id, titulo, padre, lineas: [] };
  apartados.push(a); porId.set(id, a); return a;
};
// Título que se prolonga en la línea siguiente (sin línea en blanco entre medias)
const prolonga = (i, t) => {
  while (lineas[i + 1] && lineas[i + 1].trim() && lineas[i + 1] !== PB && !TIT.test(lineas[i + 1]) && !CAP.test(lineas[i + 1])) { t += " " + lineas[++i].trim(); }
  return [i, t];
};
for (let i = 0; i < lineas.length; i++) {
  const l = lineas[i];
  const cm = CAP.exec(l);
  if (cm) {
    let [j, t] = prolonga(i, l.slice(2).trim()); i = j;
    t = t.replace(/\s*-\s*\d+ minutos\s*$/, "");
    capNum = cm[1]; actual = nueva(capNum, t, null);
    esperaObj = false; vistoPrimero = false; enCuerpo = false; actual = null;
    // el capítulo se registra pero su texto solo es lo que haya antes de 1.1 (nada: ver front matter)
    actual = porId.get(capNum);
    continue;
  }
  if (!enCuerpo) {
    // Portada del capítulo: palabras clave y objetivos de aprendizaje, no son texto del apartado
    if (/^Objetivos de Aprendizaje para/.test(l)) { esperaObj = true; continue; }
    if (esperaObj) {
      const t = TIT.exec(l);
      if (t && t[1] === capNum + ".1") {
        if (!vistoPrimero) { vistoPrimero = true; continue; }
        enCuerpo = true; actual = null;
      } else continue;
    } else continue;
  }
  const t = TIT.exec(l);
  if (t && t[1].split(".")[0] === capNum && !/^\d+\.\d+\.\s/.test(l)) {
    let [j, tit] = prolonga(i, t[2].trim()); i = j;
    const padre = t[1].includes(".") ? t[1].replace(/\.\d+$/, "") : null;
    const a = nueva(t[1], tit, padre);
    if (a) { actual = a; continue; }
  }
  if (actual) actual.lineas.push(l);
}

// --- 4. Limpieza del texto de cada apartado
const VINETA = /^(\s*)([•o])\s+(\S.*)$/;
const sangria = s => s.length;
function aMarkdown(ls) {
  // bloques separados por líneas en blanco; PB marca salto de página
  const bloques = []; let b = [], pb = false;
  const cierra = () => { if (b.length) bloques.push({ l: b, pb }); b = []; pb = false; };
  for (const l of ls) {
    if (l === PB) { cierra(); pb = true; }
    else if (!l.trim()) { const p = pb; cierra(); pb = p; }
    else { if (!b.length && pb === undefined) pb = false; b.push(l); }
  }
  cierra();
  // Cada bloque -> párrafos/elementos de lista; un salto de página une bloques cortados
  const salida = [];
  const elementos = [];
  for (const bl of bloques) {
    const el = [];
    bl.l.forEach((l, n) => {
      const m = VINETA.exec(l);
      // «o» solo es viñeta de 2.º nivel si abre bloque (si no, es una «o» de la frase)
      if (m && (m[2] === "•" || (n === 0 && sangria(m[1]) > 0))) {
        el.push({ tipo: "v", nivel: m[2] === "o" ? 1 : 0, t: m[3] });
      } else if (el.length) { const u = el[el.length - 1]; u.t += (/[a-záéíóúñ]-$/.test(u.t) ? "" : " ") + l.trim(); }
      else el.push({ tipo: "p", nivel: 0, t: l.trim() });
    });
    elementos.push({ el, pb: bl.pb });
  }
  const flat = [];
  for (const { el, pb: salto } of elementos) {
    el.forEach((e, k) => {
      const prev = flat[flat.length - 1];
      if (k === 0 && salto && prev && e.tipo === "p" && !/^\d+\.\s/.test(e.t) && !/^\d+ [A-ZÁÉ“"]/.test(e.t) &&
          (!/[.:;?!”")]$/.test(prev.t) || /^[a-zñáéíóú]/.test(e.t))) {
        prev.t += " " + e.t;
      } else if (k === 0 && salto && prev && e.tipo === "p" && /^[a-zñáéíóú(]/.test(e.t)) {
        prev.t += " " + e.t;
      } else flat.push({ ...e });
    });
  }
  for (const e of flat) if (e.tipo === "p" && /^\d{1,2} [A-ZÁÉÍÓÚ¿“"]/.test(e.t)) e.t = "> " + e.t; // nota al pie
  return flat.map(e => e.tipo === "v" ? "  ".repeat(e.nivel) + "- " + e.t : e.t).reduce((acc, s, i) => {
    const prev = flat[i - 1];
    const lista = flat[i].tipo === "v" && prev && prev.tipo === "v";
    return acc + (i === 0 ? "" : lista ? "\n" : "\n\n") + s;
  }, "");
}

const out = apartados.map(a => {
  let texto = aMarkdown(a.lineas);
  for (const [b, r] of PARCHES[a.id] || []) {
    if (!texto.includes(b)) throw new Error(`Parche sin efecto en ${a.id}: ${b}`);
    texto = texto.replace(b, r);
  }
  return { id: a.id, titulo: a.titulo, padre: a.padre, texto };
});
writeFileSync(salida, JSON.stringify(out, null, 2) + "\n");
console.log(`${out.length} apartados escritos`);
