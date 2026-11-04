# Aula ISTQB: teoría del programa en cada pregunta — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Debajo de la corrección de cada pregunta del aula, un bloque plegado «📖 Ver en el programa (x.y.z)» con la ruta, el texto oficial en español, avisos de diferencias con v4.0.1 y términos tocables con definición del glosario ISTQB.

**Architecture:** Los datos (apartados, glosario, diferencias) se generan a JSON en `Examen ISTQB/documentos/programa-es/`. El código del bloque vive en `Examen ISTQB/herramientas/programa-bloque.js` + `.css` como funciones puras probadas con `node --test`. Un script re-ejecutable (`inyectar-programa.mjs`) mete datos, JS y CSS entre marcadores en `aula-istqb.html` y añade la llamada en los dos sitios de corrección.

**Tech Stack:** Node 24 (ESM, `node:test`, `node:vm`), `pdftotext -enc UTF-8 -layout` (poppler, ya en PATH), HTML/JS sin dependencias. Publicación con el MCP `claude-artifacts`.

**Spec:** `docs/superpowers/specs/2026-11-04-aula-istqb-programa-es-design.md`

## Global Constraints

- El texto del español se muestra **literal**; las correcciones van solo como notas aparte. Nada de reescribir el texto oficial.
- Definiciones **solo** del Glosario oficial ISTQB (glossary.istqb.org): en español si existe; si no, traducida del inglés con la terminología del PDF español, y `fuente` lo dice.
- Datos **embebidos** en el aula; nada se carga de la red.
- No se cambian preguntas, explicaciones ni la corrección por bloques. No se genera ningún PDF.
- Copia exacta del botón: `📖 Ver en el programa (<fuente>)`. Avisos: `⚠️ Actualizado en v4.0.1: <resumen>` y `⚠️ Error de traducción: <resumen>`.
- Línea de copyright (exacta, una línea, al pie del bloque): `© ISTQB® · Traducción oficial SSTQB del programa CTFL v4.0 · Uso personal de estudio`.
- Ruta: `Cap. 1 Fundamentos del Proceso de Prueba › 1.4 <título> › 1.4.2 <título>` con los títulos oficiales del PDF español, separador ` › `.
- Comentarios en código y mensajes en español. Explicaciones por bloques, nunca párrafos seguidos (`memory.md`).
- El aula vigente es el artifact `4t1hWTtaMeMzBMrwsEaRvr` (privado). Se lee la versión publicada antes de publicar encima.
- Al corregir algo del usuario: comentario ANTES · MAL · POR QUÉ (regla de `memory.md`).

## Review Focus

1. **Enter con un término enfocado**: el atajo global de teclado (aula-istqb.html:356-362, Enter = comprobar/siguiente) no debe dispararse al tocar un término. Los términos son `<span class="term">` sin `tabindex`, nunca `<button>`. Test en Task 4.
2. **Re-render borra el estado**: `renderPractice` reasigna `app.innerHTML`; el recuadro de definición debe estar dentro del bloque (o eliminarse al re-render) y el manejador de clics ir delegado en `document`, registrado **una sola vez**. Test en Task 5 (inyectar dos veces → un solo manejador/marcador).
3. **Marcado de términos dentro de HTML o dentro de otro término**: «prueba» no debe marcarse dentro de «prueba de regresión» ya marcado, ni dentro de atributos o etiquetas. Términos más largos primero. Test en Task 4.
4. **Texto con `<`, `&` o `</script>`**: el Markdown se escapa antes de convertirlo, y el JSON embebido usa `.replace(/<\//g,"<\\/")`. Test en Task 4 y 5.
5. **`fuente` padre o inexistente**: «1.3», «2.2», «5.4» deben mostrar todos sus hijos en orden; «9.9», `""` o `undefined` → cadena vacía, sin error. Test en Task 4.

---

## Estructura de ficheros

| Fichero | Responsabilidad |
|---|---|
| `Examen ISTQB/herramientas/extraer-programa.mjs` | PDF español → `programa-es/apartados.json` (limpieza automática). |
| `Examen ISTQB/documentos/programa-es/apartados.json` | `[{ id, titulo, padre, texto }]`, capítulos incluidos (`id:"1"`, `padre:null`). |
| `Examen ISTQB/documentos/programa-es/glosario.json` | `[{ es, en, definicion, fuente, variantes? }]`. |
| `Examen ISTQB/documentos/programa-es/diferencias.json` | `[{ id, tipo, importancia, es, en, en_es, resumen }]`. |
| `Examen ISTQB/documentos/diferencias-ES-v4.0-vs-EN-v4.0.1.md` | Lo mismo, legible, agrupado por capítulo. |
| `Examen ISTQB/herramientas/validar-datos.test.mjs` | Tests de los tres JSON. |
| `Examen ISTQB/herramientas/programa-bloque.js` | Script clásico (sin `export`) con las funciones del bloque; lee el global `PROGRAMA`. |
| `Examen ISTQB/herramientas/programa-bloque.css` | Estilo del bloque y del recuadro. |
| `Examen ISTQB/herramientas/programa-bloque.test.mjs` | Tests de las funciones (cargadas con `node:vm`). |
| `Examen ISTQB/herramientas/inyectar-programa.mjs` | Inyección re-ejecutable en `aula-istqb.html` (o en la ruta que se le pase). |
| `Examen ISTQB/herramientas/inyectar-programa.test.mjs` | Tests de la inyección. |

Verificación común: `node --test "Examen ISTQB/herramientas/"` desde la raíz del repo.

Datos de partida útiles (comprobados hoy):
- Las 70 `fuente` distintas del banco: `1.1 1.1.1 1.1.2 1.2.1 1.2.2 1.2.3 1.3 1.4.1–1.4.5 1.5.1–1.5.3 2.1.1–2.1.6 2.2 2.2.1–2.2.3 2.3 3.1 3.1.1–3.1.3 3.2.1–3.2.5 4.1 4.2.1–4.2.4 4.3.1–4.3.3 4.4.1–4.4.3 4.5 4.5.1–4.5.3 5.1.1–5.1.7 5.2 5.2.1–5.2.4 5.3 5.3.1–5.3.3 5.4 5.5 6.1 6.2`. Se obtienen con: `node -e 'const s=require("fs").readFileSync("Examen ISTQB/aula-istqb.html","utf8");const b=eval(s.match(/const BANCO = (\[.*\]);/)[1]);console.log([...new Set(b.map(q=>q.fuente))].sort().join(" "))'`.
- En el `.txt` del PDF español: los capítulos se titulan `N Título - M minutos` (no «Capítulo N»); ojo: las notas al pie también empiezan por número (`1 Las palabras clave se encuentran ordenadas…`, `3 Buscar/Confirmar traducción del término`) y no son títulos — esta última es una nota del traductor que conviene revisar en Task 3. Índice en las líneas ~100-200 (no usar como cuerpo); las secciones «Palabras Clave» empiezan en las líneas 596, 1272, 1833, 2199, 2873 y 3668; el apéndice con la tabla de objetivos (~p. 83) **no** es cuerpo. Pie de página repetido: `Versión 4.0 … Página N de 87 … 21 de abril de 2023`, `© International Software Testing Qualifications Board`, cabecera `Probador Certificado del ISTQB ® … International / Software Testing / Programa de Estudio – Nivel Básico … Qualifications Board`.

---

### Task 1: Apartados del programa en español

**Files:**
- Create: `Examen ISTQB/herramientas/extraer-programa.mjs`
- Create: `Examen ISTQB/documentos/programa-es/apartados.json`
- Create: `Examen ISTQB/herramientas/validar-datos.test.mjs` (solo la parte de apartados)

**Interfaces:**
- Produces: `apartados.json` = array ordenado por aparición, `{ id: string, titulo: string, padre: string|null, texto: string }`. Capítulos `"1"`…`"6"` con `padre:null` y título sin la duración (la línea del PDF es `1 Fundamentos del Proceso de Prueba - 180 minutos` → `Fundamentos del Proceso de Prueba`). `texto` = Markdown solo de lo propio del apartado (antes del primer hijo); excluye la línea de título, la tabla «Palabras Clave» y los objetivos de aprendizaje del inicio del capítulo.

- [ ] **Step 1: Escribir los tests en `validar-datos.test.mjs`**

```js
import { test } from "node:test"; import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const dir = new URL("../documentos/programa-es/", import.meta.url);
const ap = JSON.parse(readFileSync(new URL("apartados.json", dir), "utf8"));
const FUENTES = "1.1 1.1.1 … 6.2".split(" "); // las 70 de arriba, completas
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
```

- [ ] **Step 2: Ejecutar y ver que falla** — `node --test "Examen ISTQB/herramientas/"` → FAIL (no existe `apartados.json`).

- [ ] **Step 3: Implementar `extraer-programa.mjs`**

Uso: `node "Examen ISTQB/herramientas/extraer-programa.mjs"` → ejecuta `pdftotext -enc UTF-8 -layout` sobre `documentos/CTFL - V4.0 - ES - PROGRAMA DE ESTUDIO - V001.01.pdf` a un temporal, corta desde la línea de cuerpo `1 Fundamentos del Proceso de Prueba - 180 minutos` (≈ línea 592; la del índice lleva puntos y número de página) hasta el inicio de las referencias/apéndices, quita cabeceras y pies, detecta títulos con `/^(\d(?:\.\d+){1,2})\s+\S/` al inicio de línea (ignorando las que repiten el título del padre como cabecera de página), une líneas cortadas de un mismo párrafo, pasa viñetas `•` a `- `, tablas a Markdown (`| a | b |`) y figuras a `[Figura: <pie de figura>]`. Escribe JSON con 2 espacios.

- [ ] **Step 4: Revisión a mano contra el PDF** — leer el `texto` de 1.1.2, 1.4.2, 2.2.2, 4.2.1 y 5.1.6 (rangos del `.txt`, no el fichero entero) y corregir la limpieza en el script, no en el JSON. Si un caso concreto no compensa automatizar, se admite una tabla de parches en el script (`PARCHES = { "id": [[buscar, reemplazar]] }`) que solo arregla formato, nunca palabras.

- [ ] **Step 5: Ejecutar tests** — `node --test "Examen ISTQB/herramientas/"` → PASS.

- [ ] **Step 6: Commit** — `git add "Examen ISTQB/herramientas" "Examen ISTQB/documentos/programa-es/apartados.json"` · `Aula ISTQB: extraer apartados del programa en español`.

---

### Task 2: Glosario de términos tocables

**Files:**
- Create: `Examen ISTQB/documentos/programa-es/glosario.json`
- Modify: `Examen ISTQB/herramientas/validar-datos.test.mjs` (añadir tests del glosario)

**Interfaces:**
- Produces: `glosario.json` = `[{ es, en, definicion, fuente, variantes? }]`. `fuente` ∈ {`"glosario ISTQB (es)"`, `"glosario ISTQB (en, traducida)"`}, seguido de ` · <URL del término>` si existe. `variantes`: formas que aparecen en el texto (plural, artículo distinto) — opcional.

- [ ] **Step 1: Tests**

```js
const glo = JSON.parse(readFileSync(new URL("glosario.json", dir), "utf8"));
test("glosario completo", () => {
  for (const g of glo) { for (const k of ["es","en","definicion","fuente"]) assert.ok(g[k]?.trim(), `${g.en}.${k}`); assert.match(g.fuente, /^glosario ISTQB \((es|en, traducida)\)/); }
  for (const en of ["test process","traceability","test strategy","regression testing"]) assert.ok(glo.find(g => g.en.toLowerCase() === en), en);
  assert.equal(new Set(glo.map(g => g.en.toLowerCase())).size, glo.length);
});
```

Añadir además: `glo.length === N` donde N = número de filas de las 6 tablas «Palabras Clave» + 3 (contadas en el Step 2 y escritas como constante).

- [ ] **Step 2: Sacar la lista** — de las 6 tablas «Palabras Clave» del `.txt` español (líneas indicadas arriba): pares `es`–`en` tal cual. Contar filas. Añadir *test process*, *traceability*, *test strategy* con su término español tomado del propio PDF español (p. ej. «proceso de prueba», «trazabilidad», «estrategia de prueba»; confirmar con grep).

- [ ] **Step 3: Definiciones** — buscar cada término en glossary.istqb.org (versión española si la hay). Si la web no se deja leer por herramienta, intentar su API JSON vía `curl`; si tampoco, **parar y reportar BLOCKED** (no inventar definiciones). Al traducir del inglés, usar los términos españoles del PDF.

- [ ] **Step 4: Tests** → PASS. **Step 5: Commit** — `Aula ISTQB: glosario de palabras clave con definiciones oficiales`.

---

### Task 3: Diferencias español v4.0 ↔ inglés v4.0.1

**Files:**
- Create: `Examen ISTQB/documentos/programa-es/diferencias.json`
- Create: `Examen ISTQB/documentos/diferencias-ES-v4.0-vs-EN-v4.0.1.md`
- Modify: `Examen ISTQB/herramientas/validar-datos.test.mjs`

**Interfaces:**
- Consumes: `apartados.json` (Task 1) para validar ids.
- Produces: `diferencias.json` = `[{ id, tipo: "v4.0.1"|"traducción", importancia: "alta"|"media"|"baja", es, en, en_es, resumen }]`. `es` y `en` son citas literales; `en_es` es la traducción de la cita inglesa; `resumen` es una frase corta que el aula pone tras el `⚠️ …:`.

- [ ] **Step 1: Tests**

```js
const dif = JSON.parse(readFileSync(new URL("diferencias.json", dir), "utf8"));
test("diferencias válidas", () => {
  for (const d of dif) {
    assert.ok(ap.find(a => a.id === d.id), d.id);
    assert.ok(["v4.0.1","traducción"].includes(d.tipo)); assert.ok(["alta","media","baja"].includes(d.importancia));
    for (const k of ["es","en","en_es","resumen"]) assert.ok(d[k]?.trim(), `${d.id}.${k}`);
  }
  for (const id of ["5.1.6","1.1.2","2.2.2"]) assert.ok(dif.find(d => d.id === id && d.importancia === "alta"), id);
});
```

- [ ] **Step 2: Comparar** — extraer el inglés con `pdftotext -enc UTF-8 -layout ISTQB_CTFL_Syllabus_v4.0.1.pdf`. Leer primero el apéndice C (erratas v4.0.1) y luego comparar capítulo a capítulo, por rangos. Esperado (de la sesión anterior, **sin guardar**, hay que volver a encontrarlas): ~20 de contenido, ~11 de traducción. Las tres altas: 5.1.6 pirámide (tiempo de ejecución), 1.1.2 depuración (diagnóstico = encontrar el defecto), 2.2.2 ISO 25010 (*safety* y nombres nuevos). Ejemplo de traducción: en palabras clave del cap. 2, «regression testing» aparece como «prueba no funcional» (id `"2"`).
- [ ] **Step 3: Escribir JSON y el `.md`** (tabla por capítulo: apartado · tipo · importancia · español · v4.0.1 (cita + traducción)). Ambos con el mismo contenido.
- [ ] **Step 4: Tests** → PASS. **Step 5: Commit** — `Aula ISTQB: diferencias entre el programa español v4.0 y el inglés v4.0.1`.

---

### Task 4: Funciones del bloque (JS + CSS)

**Files:**
- Create: `Examen ISTQB/herramientas/programa-bloque.js`, `programa-bloque.css`, `programa-bloque.test.mjs`

**Interfaces:**
- Consumes: global `PROGRAMA = { apartados, glosario, diferencias }` (formas de Tasks 1-3) y la función `esc(s)` del aula (en tests, se define en el contexto).
- Produces (funciones globales):
  - `mdAHtml(md: string): string` — párrafos, listas `- ` (con anidado por sangría), tablas `|…|`, `**negrita**`; escapa HTML antes de convertir.
  - `apartadoCompleto(id: string): string` — Markdown del apartado + todos sus descendientes en orden, cada hijo precedido de `### <id> <titulo>`.
  - `rutaDe(id: string): string` — `Cap. 1 <título cap> › 1.4 <título> › 1.4.2 <título>`.
  - `marcarTerminos(html: string): string` — envuelve cada aparición (sin distinguir mayúsculas, palabra completa, más largos primero, `es` y `variantes`) en `<span class="term" data-t="<índice glosario>">…</span>`; nunca dentro de etiquetas ni dentro de otro `.term`. Marca solo la primera aparición de cada término por bloque (evita ruido).
  - `programaHTML(fuente: string): string` — `""` si no hay apartado; si no, `<details class="prog"><summary>📖 Ver en el programa (<fuente>)</summary><div class="prog-in">ruta · texto marcado · avisos · copyright</div></details>`. Avisos: los de `diferencias` con `id` igual a la fuente o a cualquier descendiente; `tipo:"v4.0.1"` → `⚠️ Actualizado en v4.0.1: <resumen>`, `"traducción"` → `⚠️ Error de traducción: <resumen>`, con `es`/`en`/`en_es` en letra pequeña debajo.
  - `activarTerminos(): void` — registra **una vez** (bandera `window.__progTerm`) un `click` en `document`: si el destino es `.term`, abre/cambia un recuadro `.term-pop` (es · en · definición · fuente) colocado bajo el término dentro de su `.prog-in`; cualquier otro clic lo cierra.

- [ ] **Step 1: Tests** (`node:vm`: `const ctx = vm.createContext({ PROGRAMA: datosDePrueba, esc: s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]) }); vm.runInContext(readFileSync(".../programa-bloque.js","utf8"), ctx);`) con un `PROGRAMA` de prueba pequeño (cap. 9 ficticio con 9.1, 9.1.1, 9.1.2):
  - `programaHTML("9.9") === ""`, `programaHTML("") === ""`, `programaHTML(undefined) === ""`.
  - `programaHTML("9.1")` contiene los títulos de 9.1.1 y 9.1.2, en ese orden, y `📖 Ver en el programa (9.1)`.
  - `rutaDe("9.1.2") === "Cap. 9 Ficticio › 9.1 Uno › 9.1.2 Dos"`.
  - `mdAHtml("a <b> & </script>")` no contiene `<b>` ni `</script>`.
  - `mdAHtml("| a | b |\n|---|---|\n| 1 | 2 |")` contiene `<table>` y `<td>1</td>`.
  - con glosario `["prueba", "prueba de regresión"]`: `marcarTerminos("<p>La prueba de regresión y la prueba</p>")` marca «prueba de regresión» como un solo `.term` y no anida otro dentro; `marcarTerminos('<a title="prueba">x</a>')` no toca el atributo.
  - aviso: con una diferencia en `9.1.1` tipo `"v4.0.1"`, `programaHTML("9.1")` contiene `⚠️ Actualizado en v4.0.1:`.
  - el HTML de términos no contiene `<button` ni `tabindex` (Review Focus 1).
- [ ] **Step 2:** `node --test "Examen ISTQB/herramientas/"` → FAIL.
- [ ] **Step 3:** Implementar. CSS con las variables del aula (`--accent`, `--line`, `--muted`, `--sheet`; tema oscuro ya cubierto si solo se usan variables). `.term` con subrayado punteado y `cursor:pointer`; `.term-pop` absoluto, ancho máx. 22rem; `.prog` con borde `var(--line)` como `.ask`.
- [ ] **Step 4:** Tests → PASS. **Step 5: Commit** — `Aula ISTQB: bloque «Ver en el programa» con términos tocables`.

---

### Task 5: Inyección re-ejecutable en el aula

**Files:**
- Create: `Examen ISTQB/herramientas/inyectar-programa.mjs`, `inyectar-programa.test.mjs`
- Modify: `Examen ISTQB/aula-istqb.html` (generado por el script)

**Interfaces:**
- Consumes: Tasks 1-4.
- Produces: `node "Examen ISTQB/herramientas/inyectar-programa.mjs" [rutaHtml]` (por defecto `Examen ISTQB/aula-istqb.html`); exporta `inyectar(html: string, datos, js: string, css: string): string` para los tests.

Reglas de `inyectar`:
- CSS entre `/*PROG-CSS-INICIO*/` y `/*PROG-CSS-FIN*/` justo antes del único `</style>`.
- `const PROGRAMA = <JSON escapado con .replace(/<\//g,"<\\/")>;` + el JS + `activarTerminos();` entre `/*PROG-JS-INICIO*/` y `/*PROG-JS-FIN*/` justo antes del único `</script>`.
- Si los marcadores ya existen, se **sustituye** su contenido (no se duplica).
- Llamadas (solo si aún no hay `programaHTML(` fuera de los marcadores):
  - en `renderPractice`: `body+=askHTML();` → `body+=askHTML();\n    body+=programaHTML(q.fuente);`
  - en `renderSimResult`: `${explHTML(q)}</div></details>` → `${explHTML(q)}${programaHTML(q.fuente)}</div></details>`
  - si alguna cadena de anclaje no aparece exactamente una vez → `throw` con el texto que falta (el aula publicada pudo cambiar).

- [ ] **Step 1: Tests** — con un HTML mínimo que contenga `</style>`, `</script>`, `body+=askHTML();` y `${explHTML(q)}</div></details>`:
  - una pasada: un `PROG-JS-INICIO`, dos `programaHTML(q.fuente)`.
  - dos pasadas: resultado idéntico a una pasada (idempotente).
  - datos con `"</script>"` en un texto: el resultado tiene exactamente un `</script>`.
  - HTML sin `body+=askHTML();` → lanza error.
- [ ] **Step 2:** FAIL. **Step 3:** Implementar. **Step 4:** Tests → PASS.
- [ ] **Step 5: Ejecutar sobre la copia local** y comprobar en navegador (MCP Playwright, `file:///C:/GitHub/QA_Pruebas/Examen%20ISTQB/aula-istqb.html`):
  - practicar una pregunta de 1.4.2, comprobar → aparece el botón plegado; desplegar → ruta, texto, términos marcados.
  - tocar un término → recuadro; tocar otro → cambia; tocar fuera → se cierra; Enter tras tocar un término → solo avanza de pregunta como antes, sin error.
  - pregunta de 5.1.6 → aviso `⚠️ Actualizado en v4.0.1`.
  - un simulacro corto → revisión con el bloque dentro de cada pregunta.
  - consola sin errores; progreso guardado (`istqb.prog`) sigue ahí tras recargar.
  - tamaño del HTML: anotar antes/después.
- [ ] **Step 6: Commit** — `Aula ISTQB: inyectar el bloque del programa en el aula`.

---

### Task 6: Publicar y documentar (hilo principal, no subagente)

- [ ] **Step 1:** `get_artifact` + `read_artifact` de `4t1hWTtaMeMzBMrwsEaRvr`; guardar el HTML publicado en el scratchpad. Comparar con `git show HEAD~N:"Examen ISTQB/aula-istqb.html"` (la copia anterior a Task 5). Si difieren en algo más que espacios, **parar y preguntar al usuario** cuál manda.
- [ ] **Step 2:** Ejecutar `inyectar-programa.mjs <copia publicada>`; publicar con `publish_files` (slug, `base_version` leída, `shared_live` si `read` ≠ owner). Volver a leer y comprobar que contiene `PROG-JS-INICIO`.
- [ ] **Step 3:** Copiar el resultado a `Examen ISTQB/aula-istqb.html`. Actualizar `Examen ISTQB/README.md` (sección del aula: el bloque, de dónde salen los datos, cómo regenerar: los tres comandos) y añadir a `memory.md` una línea: «Bloque del programa: datos en `documentos/programa-es/`, se regenera con `herramientas/inyectar-programa.mjs`; no editar a mano la zona entre marcadores PROG».
- [ ] **Step 4:** `node --test "Examen ISTQB/herramientas/"` → PASS. Commit — `Aula ISTQB: publicar bloque del programa y documentar`.

---

## Despacho sugerido

| Task | Agente | Modelo |
|---|---|---|
| 1 | brain-implementer | sonnet |
| 2 | general-purpose (necesita web) | sonnet |
| 3 | general-purpose | sonnet |
| 4, 5 | brain-implementer | sonnet |
| revisión por tarea | brain-reviewer | sonnet |
| revisión final | brain-final-reviewer | opus |
| 6 | hilo principal | — |

Tasks 2 y 3 dependen de Task 1 (ids) pero no entre sí: pueden ir en paralelo. Task 4 puede empezar con datos de prueba en paralelo a 2 y 3.
