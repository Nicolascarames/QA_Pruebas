# Aula ISTQB: teoría del programa oficial en cada pregunta

Fecha: 2026-11-04 · Estado: aprobado por el usuario (pendiente de plan)

## Por qué

Al corregir una pregunta del aula, el usuario:
1. no ve **de dónde cuelga** el concepto dentro del programa: su capítulo, su apartado padre y los apartados hermanos. Las preguntas a menudo citan un concepto que está dentro de otro.
2. no conoce parte del **vocabulario y la jerga** del programa.

Hará el examen **en español** y quiere los términos en **español y en inglés**, como vocabulario del sector.

## Fuentes (ya en `Examen ISTQB/documentos/`)

- `CTFL - V4.0 - ES - PROGRAMA DE ESTUDIO - V001.01.pdf`: **traducción oficial** del SSTQB de la v4.0 (2023). Es el **texto que se muestra en el aula**, porque usa el vocabulario del examen en español.
- `ISTQB_CTFL_Syllabus_v4.0.1.pdf`: el programa **vigente** en inglés (2024, revisión de erratas). Es la **referencia de contenido** cuando difiere del español.

**No se genera ningún PDF nuevo** (decisión del usuario).

## Qué se construye

### 1. Documento de diferencias

Va en `Examen ISTQB/documentos/diferencias-ES-v4.0-vs-EN-v4.0.1.md`. Recoge, por apartado:
- **Diferencias de contenido** entre el español v4.0 y el inglés v4.0.1. Hay unas 20; 3 son importantes para el examen: 5.1.6 pirámide (tiempo de ejecución), 1.1.2 depuración (diagnóstico = encontrar el defecto) y 2.2.2 ISO 25010 (*safety* y nombres nuevos).
- **Errores de traducción** claros del español. Hay unos 11, por ejemplo: en las palabras clave del cap. 2, «regression testing» aparece como «prueba no funcional».
- Para cada una: el apartado, lo que dice el español (cita), lo que dice v4.0.1 (cita y traducción), la importancia (alta/media/baja) y el tipo (`v4.0.1` o `traducción`).
- Fuente de partida: los informes de comparación del 2026-11-04. Hay que verificarlos contra los dos PDF. El apéndice C del inglés v4.0.1 lista sus propias erratas.

### 2. Bloque «Ver en el programa» en el aula

En la corrección de cada pregunta, **debajo de la explicación y debajo de la caja «Pregúntale a Claude»**:

- **Plegado por defecto**, con un botón: «📖 Ver en el programa (1.4.2)», usando el campo `fuente` de la pregunta.
- **Al desplegar:**
  - **Ruta completa:** *Cap. 1 Fundamentos del proceso de prueba › 1.4 … › 1.4.2 …*, con los títulos oficiales en español.
  - **Texto oficial en español** del apartado, literal, con sus párrafos, listas y tablas. Si `fuente` es un apartado padre (p. ej. «1.3»), se muestra entero con todos sus subapartados.
  - **Notas de diferencias:** si el apartado tiene entradas en el documento de diferencias, se muestran al final como avisos. Por ejemplo: «⚠️ Actualizado en v4.0.1: …» o «⚠️ Error de traducción: …».
  - **Términos tocables:** los términos del glosario aparecen marcados en el texto. Al tocar uno, se abre ahí mismo un recuadro con el término en español, en inglés y su definición. Se cierra al tocar fuera o en otro término.
- Aparece en todos los sitios donde el aula muestra la corrección de una pregunta: práctica, falladas y la revisión de simulacro si la hay.
- Si una pregunta no tiene `fuente` o no coincide con ningún apartado, el bloque no se muestra. Los 70 valores actuales son todos apartados reales.
- Los datos van **embebidos en el aula**, sin depender de la red.

### 3. Glosario para los términos tocables

- **Lista de términos:** las tablas de **palabras clave** de cada capítulo del PDF en español, que ya traen el par español–inglés. Se añaden las tres palabras clave nuevas de v4.0.1: *test process*, *traceability* y *test strategy*.
- **Definiciones:** del **Glosario oficial ISTQB** (glossary.istqb.org), en español si está disponible y, si no, traducidas del inglés con la terminología del PDF en español.

## Datos intermedios

En `Examen ISTQB/documentos/programa-es/`:
- Apartados: `{ "id": "1.4.2", "titulo": "...", "padre": "1.4", "texto": "<Markdown>" }`. El `texto` contiene solo lo propio del apartado; los padres se arman juntando los hijos.
  - Se extrae del PDF en español con `pdftotext -enc UTF-8 -layout`, limpiando cabeceras y pies de página y uniendo las líneas cortadas. Las tablas se pasan a Markdown y las figuras se describen entre corchetes.
- `glosario.json`: `{ "es", "en", "definicion", "fuente" }`.
- `diferencias.json`: lo mismo que el documento de diferencias, en datos, con el `id` del apartado.
- Un script en `Examen ISTQB/herramientas/` que mete los datos y el bloque en el HTML del aula. Debe poder volver a ejecutarse.

## No objetivos

- No se genera un PDF nuevo ni se traduce el programa.
- No se cambian las preguntas, las explicaciones ni la corrección por bloques.
- No hay búsqueda ni navegación libre por el programa en el aula.

## Antiobjetivos

- **Modificar el texto oficial en español.** Se muestra literal; las correcciones van solo como notas aparte.
- **Definiciones** que no salgan del glosario oficial.
- **Romper el aula** (progreso guardado, simulacros, atajos) o hacerla notablemente más lenta.

## Restricciones

- El aula vigente es el artifact `4t1hWTtaMeMzBMrwsEaRvr` y es privado. Se publica sobre la versión vigente leyéndola antes; después se actualiza la copia `aula-istqb.html`.
- Uso personal de estudio, con el aviso de copyright ISTQB/SSTQB en el bloque, en una línea.
- El formato del aula sigue siendo por bloques (ver `memory.md`).

## Decisiones

**Del usuario:**
- Bloque plegado.
- Tocar la palabra para ver la definición.
- Términos en español y en inglés.
- Usar el PDF oficial en español sin generar uno nuevo y anotar las diferencias.

**Mías (revisables):**
- Las diferencias se muestran como avisos en el bloque.
- El glosario se basa en las tablas de palabras clave.
- Los datos se guardan como JSON.

## Lo que queda al constructor

- Cómo detectar y marcar los términos en el texto.
- El estilo visual del bloque y del recuadro, siguiendo el estilo actual del aula.
- La limpieza de la extracción del PDF.
