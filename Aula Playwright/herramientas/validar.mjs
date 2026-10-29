// Valida los ficheros del banco. Uso: node validar.mjs [fichero.json ...]
// Sin argumentos valida todos los banco/*.json salvo banco-playwright.json.
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..", "banco");
const ficheros = process.argv.slice(2).length
  ? process.argv.slice(2)
  : readdirSync(raiz).filter(f => f.endsWith(".json") && f !== "banco-playwright.json").map(f => join(raiz, f));

const NIVELES = ["basico", "medio"];
const TIPOS = ["funcion", "localizador", "como", "codigo", "error", "concepto"];
const errores = [];
const ids = new Set(), enunciados = new Map();
let total = 0;

for (const f of ficheros) {
  let banco;
  try { banco = JSON.parse(readFileSync(f, "utf8")); } catch (e) { errores.push(`${f}: JSON inválido (${e.message})`); continue; }
  if (!Array.isArray(banco)) { errores.push(`${f}: debe ser un array`); continue; }
  for (const q of banco) {
    total++;
    const e = m => errores.push(`${f} · ${q.id || "(sin id)"}: ${m}`);
    for (const k of ["id", "nivel", "tema", "tipo", "pregunta", "opciones", "correcta", "concepto", "explicacion", "razones", "clave", "docs"])
      if (q[k] === undefined || q[k] === "") e(`falta "${k}"`);
    if (ids.has(q.id)) e("id repetido"); ids.add(q.id);
    if (!/^[BM]-[A-Z]{2,4}-\d{2}$/.test(q.id || "")) e('id con formato distinto de "B-LOC-01" / "M-RED-03"');
    if (!NIVELES.includes(q.nivel)) e(`nivel "${q.nivel}" no válido`);
    if (q.id && q.nivel && q.id[0] !== (q.nivel === "basico" ? "B" : "M")) e("la letra del id no coincide con el nivel");
    if (!TIPOS.includes(q.tipo)) e(`tipo "${q.tipo}" no válido (${TIPOS.join(", ")})`);
    const keys = Object.keys(q.opciones || {});
    if (keys.join() !== "a,b,c,d") e("opciones deben ser exactamente a, b, c, d");
    if (!Array.isArray(q.correcta) || q.correcta.length !== 1 || !keys.includes(q.correcta[0])) e("correcta debe ser un array con una clave de opciones");
    if (Object.keys(q.razones || {}).join() !== keys.join()) e("razones debe tener las mismas claves que opciones");
    if (q.correcta && q.razones && !/^Correcta\./.test(q.razones[q.correcta[0]] || "")) e('la razón de la correcta debe empezar por "Correcta."');
    if (!Array.isArray(q.explicacion) || q.explicacion.length < 2 || q.explicacion.length > 6) e("explicacion: lista de 2 a 6 puntos");
    else q.explicacion.forEach((p, i) => { if (typeof p !== "string" || p.length > 170) e(`explicacion[${i}] demasiado larga (máx. 170)`); });
    if (q.codigo !== undefined && (typeof q.codigo !== "string" || !q.codigo.trim())) e("codigo vacío");
    if (q.codigoOpciones !== undefined && typeof q.codigoOpciones !== "boolean") e("codigoOpciones debe ser true/false");
    if (!/^https:\/\/(playwright\.dev|www\.typescriptlang\.org)\//.test(q.docs || "")) e("docs debe enlazar a playwright.dev o typescriptlang.org");
    for (const t of Object.values(q.opciones || {}))
      if (/todas las anteriores|ninguna de las anteriores/i.test(t)) e('no se permiten opciones "todas/ninguna de las anteriores" (se barajan)');
    const norm = String(q.pregunta || "").toLowerCase().replace(/\s+/g, " ").trim() + "|" + (q.codigo || "").replace(/\s+/g, "");
    if (enunciados.has(norm)) e(`enunciado duplicado de ${enunciados.get(norm)}`); else enunciados.set(norm, q.id);
  }
}

if (errores.length) { console.error(errores.join("\n")); console.error(`\n${errores.length} errores en ${total} preguntas`); process.exit(1); }
console.log(`OK · ${total} preguntas válidas en ${ficheros.length} fichero(s)`);
