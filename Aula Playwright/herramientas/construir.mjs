// Junta el banco y genera la página del aula.
// Uso: node herramientas/construir.mjs   (valida antes con validar.mjs)
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const base = join(dirname(fileURLToPath(import.meta.url)), "..");
const dirBanco = join(base, "banco");
const orden = { basico: 0, medio: 1 };
const banco = readdirSync(dirBanco)
  .filter(f => /^(basico|medio)-\d+\.json$/.test(f))
  .flatMap(f => JSON.parse(readFileSync(join(dirBanco, f), "utf8")))
  .sort((a, b) => orden[a.nivel] - orden[b.nivel] || a.id.localeCompare(b.id));

writeFileSync(join(dirBanco, "banco-playwright.json"), JSON.stringify(banco, null, 1) + "\n");

const plantilla = readFileSync(join(base, "herramientas", "plantilla.html"), "utf8");
if (!plantilla.includes("/*BANCO*/[]")) throw new Error("La plantilla no tiene el marcador /*BANCO*/[]");
// "</" se escapa para que ningún texto del banco cierre el <script>
const json = JSON.stringify(banco).replace(/<\//g, "<\\/");
writeFileSync(join(base, "aula-playwright.html"), plantilla.replace("/*BANCO*/[]", () => json));

const cuenta = banco.reduce((m, q) => ((m[q.nivel] = (m[q.nivel] || 0) + 1), m), {});
console.log(`aula-playwright.html generada · ${banco.length} preguntas`, cuenta);
