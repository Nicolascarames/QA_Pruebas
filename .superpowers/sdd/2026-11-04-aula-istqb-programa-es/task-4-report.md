# Task 4 report

Funciones (programa-bloque.js): mdAHtml, apartadoCompleto, rutaDe, marcarTerminos, programaHTML, activarTerminos (+ auxiliares mdInline, progApartado, progPlural, progPrepararTerminos, progAvisos).
Tests (17 en programa-bloque.test.mjs): fuente vacía/inexistente; padre con hijos en orden; estructura ruta/texto/avisos/copy; rutaDe; apartadoCompleto; mdAHtml escapa; mdAHtml tablas/listas/figuras/notas; marcarTerminos más largo/atributos; primera aparición; plurales (condiciones de prueba, riesgos de proyecto); palabra completa/acentos/mayúsculas; no dentro de .term; avisos; ancestro no capítulo; sin button/tabindex; activarTerminos una vez; datos reales.

Comando: node --test "Examen ISTQB/herramientas/*.test.mjs"
```
✔ textos de muestra (0.0986ms)
✔ glosario completo (0.6279ms)
✔ glosario: número de términos (0.0663ms)
✔ diferencias válidas (0.2142ms)
ℹ tests 25
ℹ suites 0
ℹ pass 25
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 89.6606
```

Smoke datos reales: 70 fuentes, 0 vacías, 8 ms en total, salida máxima 12828 bytes.

programaHTML("5.1.6") (600 chars):
```
<details class="prog"><summary>📖 Ver en el programa (5.1.6)</summary><div class="prog-in"><div class="prog-ruta">Cap. 5 Gestión de las Actividades de Prueba › 5.1 Planificación de la Prueba › 5.1.6 Pirámide de Prueba</div><div class="prog-txt"><p>La <span class="term" data-t="89">pirámide de prueba</span> es un modelo que muestra que las distintas <span class="term" data-t="24">pruebas</span> pueden tener una granularidad diferente. El modelo de pirámide de prueba apoya al equipo en la <span class="term" data-t="91">automatización de la prueba</span> y en la asignación del esfuerzo de prueba 
```
