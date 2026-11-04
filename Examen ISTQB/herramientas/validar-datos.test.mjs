import { test } from "node:test"; import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const dir = new URL("../documentos/programa-es/", import.meta.url);
const ap = JSON.parse(readFileSync(new URL("apartados.json", dir), "utf8"));
const FUENTES = "1.1 1.1.1 1.1.2 1.2.1 1.2.2 1.2.3 1.3 1.4.1 1.4.2 1.4.3 1.4.4 1.4.5 1.5.1 1.5.2 1.5.3 2.1.1 2.1.2 2.1.3 2.1.4 2.1.5 2.1.6 2.2 2.2.1 2.2.2 2.2.3 2.3 3.1 3.1.1 3.1.2 3.1.3 3.2.1 3.2.2 3.2.3 3.2.4 3.2.5 4.1 4.2.1 4.2.2 4.2.3 4.2.4 4.3.1 4.3.2 4.3.3 4.4.1 4.4.2 4.4.3 4.5 4.5.1 4.5.2 4.5.3 5.1.1 5.1.2 5.1.3 5.1.4 5.1.5 5.1.6 5.1.7 5.2 5.2.1 5.2.2 5.2.3 5.2.4 5.3 5.3.1 5.3.2 5.3.3 5.4 5.5 6.1 6.2".split(" "); // las 70 fuentes distintas del banco
test("cada fuente del banco existe", () => { for (const f of FUENTES) assert.ok(ap.find(a => a.id === f), f); });
test("ids únicos y padre coherente", () => {
  const ids = new Set(ap.map(a => a.id)); assert.equal(ids.size, ap.length);
  for (const a of ap) assert.equal(a.padre, a.id.includes(".") ? a.id.replace(/\.\d+$/, "") : null, a.id);
});
test("sin cabeceras ni pies", () => { for (const a of ap) assert.doesNotMatch(a.texto, /Página \d+ de 87|Qualifications Board|Probador Certificado|21 de abril de 2023/, a.id); });
test("sin líneas de índice", () => { for (const a of ap) assert.doesNotMatch(a.texto, /\.{6,}\s*\d+/, a.id); });
test("textos de muestra", () => {
  assert.equal(ap.find(a => a.id === "1.4.2").titulo, "El Proceso de Prueba en Contexto");
  assert.ok(ap.filter(a => a.padre === "1.4").length === 5);
  assert.ok(ap.find(a => a.id === "5.1.6").texto.length > 200);
});
