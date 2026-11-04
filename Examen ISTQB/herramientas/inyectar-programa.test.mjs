// Tests de la inyección del bloque «Ver en el programa».
import test from "node:test";
import assert from "node:assert/strict";
import { inyectar } from "./inyectar-programa.mjs";

const base = "<style>a{}</style><script>function renderPractice(){\n    body+=askHTML();\n}\nconst r=`${explHTML(q)}</div></details>`;</script>";
const datos = { apartados: [], glosario: [], diferencias: [] };
const cuenta = (s, sub) => s.split(sub).length - 1;

test("una pasada: un marcador JS y dos llamadas", () => {
  const h = inyectar(base, datos, "function programaHTML(f){}", ".x{}");
  assert.equal(cuenta(h, "/*PROG-JS-INICIO*/"), 1);
  assert.equal(cuenta(h, "/*PROG-CSS-INICIO*/"), 1);
  assert.equal(cuenta(h, "programaHTML(q.fuente)"), 2);
  assert.equal(cuenta(h, "activarTerminos();"), 1);
});

test("dos pasadas: idéntico a una (idempotente)", () => {
  const a = inyectar(base, datos, "function programaHTML(f){}", ".x{}");
  assert.equal(inyectar(a, datos, "function programaHTML(f){}", ".x{}"), a);
});

test("segunda pasada con JS nuevo sustituye, no duplica", () => {
  const a = inyectar(base, datos, "function programaHTML(f){/*v1*/}", ".x{}");
  const b = inyectar(a, datos, "function programaHTML(f){/*v2*/}", ".y{}");
  assert.ok(b.includes("v2") && !b.includes("v1") && !b.includes(".x{}"));
  assert.equal(cuenta(b, "programaHTML(q.fuente)"), 2);
});

test("datos con </script> no rompen: un solo </script>", () => {
  const h = inyectar(base, { ...datos, glosario: [{ es: "x</script>y" }] }, "function programaHTML(f){}", "");
  assert.equal(cuenta(h, "</script>"), 1);
});

test("HTML sin body+=askHTML(); lanza error", () => {
  assert.throws(() => inyectar(base.replace("body+=askHTML();", ""), datos, "", ""), /askHTML/);
});

test("HTML sin ${explHTML(q)}</div></details> lanza error", () => {
  assert.throws(() => inyectar(base.replace("${explHTML(q)}</div></details>", ""), datos, "", ""), /explHTML/);
});
