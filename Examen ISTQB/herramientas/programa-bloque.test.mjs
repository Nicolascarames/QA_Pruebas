// Tests de las funciones del bloque «Ver en el programa» (cargadas con node:vm).
import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const dir = dirname(fileURLToPath(import.meta.url));
const codigo = readFileSync(join(dir, "programa-bloque.js"), "utf8");
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function cargar(PROGRAMA, extra = {}) {
  const ctx = vm.createContext({ PROGRAMA, esc, ...extra });
  vm.runInContext(codigo, ctx);
  return ctx;
}

const datos = {
  apartados: [
    { id: "9", titulo: "Ficticio", padre: null, texto: "" },
    { id: "9.1", titulo: "Uno", padre: "9", texto: "Intro de uno." },
    { id: "9.1.1", titulo: "Primero", padre: "9.1", texto: "Texto del primero.\n\n- a\n  - b\n- c\n\n[Figura: algo]\n\n> 1 Nota al pie" },
    { id: "9.1.2", titulo: "Dos", padre: "9.1", texto: "Texto del segundo." },
  ],
  glosario: [
    { es: "prueba", en: "test", definicion: "Def prueba.", fuente: "glosario ISTQB (es) · https://x.test/a" },
    { es: "prueba de regresión", en: "regression testing", definicion: "Def reg.", fuente: "traducido" },
    { es: "condición de prueba", en: "test condition", definicion: "Def cond.", fuente: "f" },
    { es: "riesgo de proyecto", en: "project risk", definicion: "Def riesgo.", fuente: "f" },
  ],
  diferencias: [
    { id: "9.1.1", tipo: "v4.0.1", importancia: "alta", es: "ES texto", en: "EN text", en_es: "EN traducido", resumen: "cambia X" },
    { id: "9.1.2", tipo: "traducción", importancia: "media", es: "ES2", en: "EN2", en_es: "EN2es", resumen: "mal Y" },
    { id: "9.1.2", tipo: "v4.0.1", importancia: "media", es: "ES3", en: "EN3", en_es: "EN3es", resumen: "segundo aviso" },
    { id: "9", tipo: "v4.0.1", importancia: "baja", es: "CAP", en: "CAP", en_es: "CAP", resumen: "de capitulo" },
  ],
};
const C = cargar(datos);

test("fuente inexistente o vacía devuelve cadena vacía", () => {
  assert.equal(C.programaHTML("9.9"), "");
  assert.equal(C.programaHTML(""), "");
  assert.equal(C.programaHTML(undefined), "");
});

test("apartado padre muestra los hijos en orden y el botón exacto", () => {
  const h = C.programaHTML("9.1");
  assert.ok(h.includes("📖 Ver en el programa (9.1)"));
  const a = h.indexOf("Primero"), b = h.indexOf("Dos");
  assert.ok(a > 0 && b > a);
  assert.ok(h.startsWith('<details class="prog"><summary>'));
});

test("estructura: ruta, texto, avisos, copyright en ese orden", () => {
  const h = C.programaHTML("9.1");
  const i = ["prog-ruta", "prog-txt", "prog-avisos", "prog-copy"].map(c => h.indexOf(c));
  assert.ok(i.every(n => n > 0) && i.every((n, k) => k === 0 || n > i[k - 1]), i.join());
  assert.ok(h.includes("© ISTQB® · Traducción oficial SSTQB del programa CTFL v4.0 · Uso personal de estudio"));
});

test("rutaDe", () => {
  assert.equal(C.rutaDe("9.1.2"), "Cap. 9 Ficticio › 9.1 Uno › 9.1.2 Dos");
  assert.equal(C.rutaDe("9"), "Cap. 9 Ficticio");
});

test("apartadoCompleto antepone ### a cada hijo", () => {
  const m = C.apartadoCompleto("9.1");
  assert.ok(m.includes("### 9.1.1 Primero") && m.includes("### 9.1.2 Dos"));
});

test("mdAHtml escapa HTML", () => {
  const h = C.mdAHtml("a <b> & </script>");
  assert.ok(!h.includes("<b>") && !h.includes("</script>"));
  assert.ok(h.includes("&lt;b&gt;") && h.includes("&amp;"));
});

test("mdAHtml: tablas, negrita, listas anidadas, figuras y notas", () => {
  const t = C.mdAHtml("| a | b |\n|---|---|\n| 1 | 2 |");
  assert.ok(t.includes("<table>") && t.includes("<td>1</td>"));
  assert.ok(C.mdAHtml("un **fuerte** dos").includes("<strong>fuerte</strong>"));
  const l = C.mdAHtml("- a\n  - b\n- c");
  assert.match(l, /<ul><li>a<ul><li>b<\/li><\/ul><\/li><li>c<\/li><\/ul>/);
  assert.ok(C.mdAHtml("[Figura: algo]").includes("fig"));
  assert.ok(C.mdAHtml("> 1 Nota").includes("nota"));
});

test("marcarTerminos: más largo primero, sin anidar, sin tocar atributos", () => {
  const h = C.marcarTerminos("<p>La prueba de regresión y la prueba</p>");
  assert.equal((h.match(/<span class="term"/g) || []).length, 2);
  assert.match(h, /<span class="term" data-t="1">prueba de regresión<\/span>/);
  assert.ok(!/<span class="term"[^>]*>[^<]*<span/.test(h));
  assert.equal(C.marcarTerminos('<a title="prueba">x</a>'), '<a title="prueba">x</a>');
});

test("marcarTerminos: solo la primera aparición por término", () => {
  const h = C.marcarTerminos("<p>prueba y otra prueba</p>");
  assert.equal((h.match(/class="term"/g) || []).length, 1);
});

test("marcarTerminos: plurales de la primera palabra", () => {
  assert.match(C.marcarTerminos("<p>las condiciones de prueba</p>"), /data-t="2">condiciones de prueba</);
  assert.match(C.marcarTerminos("<p>varios riesgos de proyecto</p>"), /data-t="3">riesgos de proyecto</);
});

test("marcarTerminos: palabra completa, acentos y mayúsculas", () => {
  assert.ok(C.marcarTerminos("<p>pruebas</p>").includes("data-t=\"0\">pruebas<"));
  assert.ok(!C.marcarTerminos("<p>comprueba</p>").includes('class="term"'));
  assert.ok(C.marcarTerminos("<p>Prueba</p>").includes('>Prueba</span>'));
  assert.ok(!C.marcarTerminos("<p>ñprueba prueba1</p>").includes('class="term"'));
});

test("marcarTerminos no marca dentro de un .term existente", () => {
  const ya = '<span class="term" data-t="1">prueba de regresión</span>';
  assert.equal(C.marcarTerminos(ya), ya);
});

test("avisos: v4.0.1, traducción, varios por id; capítulo nunca", () => {
  const h = C.programaHTML("9.1");
  assert.ok(h.includes("⚠️ Actualizado en v4.0.1: cambia X"));
  assert.ok(h.includes("⚠️ Error de traducción: mal Y"));
  assert.ok(h.includes("segundo aviso"));
  assert.ok(!h.includes("de capitulo"));
  assert.ok(h.includes("EN2es"));
});

test("avisos de un ancestro no capítulo se muestran en el hijo", () => {
  const D = { ...datos, diferencias: [{ id: "9.1", tipo: "v4.0.1", importancia: "a", es: "e", en: "n", en_es: "m", resumen: "del padre" }] };
  assert.ok(cargar(D).programaHTML("9.1.2").includes("del padre"));
});

test("el HTML de términos no contiene button ni tabindex", () => {
  const h = C.programaHTML("9.1") + C.marcarTerminos("<p>prueba</p>");
  assert.ok(!h.includes("<button") && !h.includes("tabindex"));
});

test("activarTerminos registra una sola vez", () => {
  let n = 0;
  const c = cargar(datos, { window: {}, document: { addEventListener: () => { n++; } } });
  c.activarTerminos(); c.activarTerminos();
  assert.equal(n, 1);
});

test("datos reales: las 70 fuentes generan HTML sin lanzar", () => {
  const rd = f => JSON.parse(readFileSync(join(dir, "..", "documentos", "programa-es", f), "utf8"));
  const R = cargar({ apartados: rd("apartados.json"), glosario: rd("glosario.json"), diferencias: rd("diferencias.json") });
  assert.ok(R.programaHTML("5.1.6").length > 100);
});
