# Aula ISTQB: programa oficial traducido y teoría en cada pregunta

Fecha: 2026-11-04 · Estado: revisado, pendiente de aprobación

## Por qué

Al corregir una pregunta del aula, el usuario:
1. No ve **de dónde cuelga** el concepto dentro del programa: su capítulo, su apartado padre y los apartados hermanos. Las preguntas a menudo citan un concepto que está dentro de otro.
2. No conoce parte del **vocabulario y la jerga** del programa. La explicación del aula está bien, pero usa términos que el usuario no domina.

Hará el examen **en español**. Quiere los términos en **español y en inglés**, como vocabulario del sector.

## Qué se construye

Hay dos entregables. El primero alimenta al segundo.

### 1. Traducción completa del programa oficial a PDF

- Fuente: `Examen ISTQB/documentos/ISTQB_CTFL_Syllabus_v4.0.1.pdf`. Son unas 28 000 palabras y 70 páginas aprox.
- Salida: `Examen ISTQB/documentos/ISTQB_CTFL_Syllabus_v4.0.1_ES.pdf`, en **español de España**.
- **Documento entero**: portada, aviso de copyright, historial, índice, agradecimientos, introducción (cap. 0), capítulos 1–6, referencias (cap. 7), apéndices y el índice alfabético si lo hay. Mantiene los mismos números de apartado y el mismo orden.
- **Terminología:**
  - El español es el **castellano oficial de ISTQB**, el de sus glosarios y exámenes en español. No vale una traducción libre.
  - Debe coincidir con la que ya usa el banco del aula: «probador», «objeto de prueba», «base de prueba», «compleción de la prueba», «juego de prueba», «carta de prueba», «productos de prueba (*testware*)»...
  - **La primera vez que aparece un término en cada apartado**, el inglés va entre paréntesis y en cursiva: «base de prueba (*test basis*)».
- **Al final, un anexo nuevo:** «Glosario bilingüe». Recoge todos los términos del programa (las *Keywords* de cada capítulo y los demás términos técnicos que se marquen) con tres columnas: español · inglés · definición en español.
  - Las definiciones salen del **Glosario oficial ISTQB** (glossary.istqb.org). Si tiene versión en español, se usa; si no, se traduce la inglesa.
  - El anexo indica que es un añadido de la traducción y no forma parte del programa original.
- Tablas, listas y ejemplos se conservan. Las tablas de objetivos de aprendizaje (FL-x.y.z con su nivel K) también se traducen.
- Se respeta el aviso de copyright del original y se indica que es una traducción no oficial para estudio personal.

**Fuente intermedia (para que el PDF y el aula salgan del mismo texto):** la traducción se guarda también como datos estructurados en `Examen ISTQB/documentos/programa-es/`. Un fichero por capítulo con este formato por apartado:

```json
{ "id": "1.4.2", "titulo": "Actividades de prueba en contexto", "padre": "1.4", "texto": "..." }
```

El glosario va en `glosario-es.json`, con una entrada por término: `{ "es", "en", "definicion", "fuente" }`. El PDF se genera desde estos datos con un script del repo, que puede renderizar HTML con Playwright (`page.pdf()`), ya instalado en `practica/playwright`.

### 2. Bloque «Ver en el programa» en el aula

En la corrección de cada pregunta, **debajo de la explicación y debajo de la caja «Pregúntale a Claude»**:

- **Plegado por defecto**, con un botón: «📖 Ver en el programa (1.4.2)», usando el campo `fuente` de la pregunta.
- **Al desplegar:**
  - **Ruta completa** del apartado: *Cap. 1 Fundamentos de la prueba › 1.4 Actividades, productos de prueba y roles › 1.4.2 Actividades de prueba en contexto*.
  - **Texto completo** del apartado. Si `fuente` es un apartado padre (p. ej. «1.3», «1.1»), se muestra entero con todos sus subapartados.
  - **Términos tocables:** los términos del glosario aparecen marcados en el texto. Al tocar uno, se abre ahí mismo un recuadro con español · inglés · definición. Al tocar fuera o en otro término, se cierra.
- Aparece en todos los sitios donde el aula muestra la corrección de una pregunta: práctica, falladas y revisión de simulacro, si existe.
- El texto y el glosario van **dentro del aula** (embebidos), sin depender de la red. El aula pasa de unos 290 KB a unos 450 KB, lo cual es aceptable.

## Objetivos

- Ver el contexto completo y la jerarquía de cualquier concepto sin salir de la pregunta.
- Aprender el vocabulario oficial en los dos idiomas.
- Tener el programa entero en español para estudiarlo aparte.

## No objetivos

- No se cambian las preguntas, las explicaciones ni la corrección por bloques del aula.
- No se traducen los exámenes de muestra (`descarga_examenes/`).
- No se añade búsqueda en el programa ni navegación libre por él dentro del aula. Solo se muestra el apartado de cada pregunta.

## Antiobjetivos (sería un fracaso aunque funcione)

- **Terminología distinta** de la del examen en español o de la del banco del aula: enseñaría palabras equivocadas.
- **Contenido inventado** o resumido: la traducción debe ser fiel y completa, sin añadir ni quitar nada. El glosario bilingüe es el único añadido y va marcado como tal.
- **Definiciones que no salgan del glosario oficial.**
- **Romper el aula** (progreso guardado, simulacros, atajos de teclado) o hacerla más lenta de forma apreciable.

## Restricciones

- El banco se basa solo en el programa oficial v4.0.1 (ver `memory.md`).
- El aula vigente es el artifact `4t1hWTtaMeMzBMrwsEaRvr`. `Examen ISTQB/aula-istqb.html` es una copia local. Se publica una versión nueva **sobre la vigente**, leyéndola antes porque puede diferir de la copia. Después se actualiza la copia local.
- Formato de las explicaciones del aula: por bloques y nunca un párrafo seguido (ver `memory.md`). El texto del programa es la excepción: se muestra con sus párrafos y listas originales.
- No se suben secretos. El contenido es material ISTQB, que permite su uso citando la fuente.

## Decisiones tomadas por el usuario

- Bloque **plegado** por defecto.
- Vocabulario: **tocar la palabra** y ver su definición ahí mismo.
- Traducción del **documento entero**, en un **PDF aparte**.
- Términos en **español (oficial del examen) + inglés**.

## Decisiones mías (revisables)

- La traducción vive también como JSON por apartado, para que el PDF y el aula salgan del mismo texto.
- Definiciones del Glosario oficial ISTQB y anexo de glosario bilingüe en el PDF.
- El inglés va entre paréntesis solo la primera vez que aparece el término en cada apartado, para que el texto no se vuelva ilegible.
- El bloque se muestra en todos los sitios donde haya corrección.

## Respuestas a la revisión del constructor

- **Autoridad terminológica.** No se encuentra un programa CTFL v4.0 oficial en español accesible: se buscó en la web el 2026-11-04 y la traducción la publicaría el SSTQB. Por eso la autoridad es, por orden:
  1. Los términos que ya usa el banco del aula. Primero se extrae de `banco-ctfl4.json` una tabla de términos es↔en.
  2. La versión en español del Glosario ISTQB (glossary.istqb.org), si está disponible.
  3. Para lo que falte, traducción coherente con los dos anteriores.

  Los subagentes de traducción reciben esa tabla fija. Después, una pasada de coherencia revisa todos los capítulos. *(Decisión mía.)*
- **Fidelidad.** La traducción la hace Claude, sin revisión humana, a petición del usuario. Se verifica así *(decisión mía)*:
  - Están todos los apartados y todos los objetivos FL-x.y.z del original.
  - La proporción de palabras por apartado es razonable (es/en ≈ 1,1–1,3).
  - Revisión por muestreo de un apartado por capítulo.
- **Licencia.** El PDF y el aula son de **uso personal de estudio**. El artifact es privado (solo el propietario) y no se comparte. El PDF lleva el aviso de copyright original y la nota de «traducción no oficial». *(Decisión mía.)*
- **Formato de `texto`.** Es **Markdown** (párrafos, listas y tablas) y contiene **solo el texto propio** del apartado, sin sus hijos. El aula y el PDF arman los apartados padre juntando los hijos mediante `padre`.
  - La portada, la introducción, las referencias y los apéndices también son entradas, con ids `0`, `0.1`... `7` y `A`, `B`...
  - Las tablas de objetivos van como tablas Markdown. Las figuras se describen con un texto breve entre corchetes, porque no se pueden reproducir. *(Decisión mía.)*
- **Inglés entre paréntesis.** Va escrito **en el propio `texto`** («base de prueba (*test basis*)»), para que el aula y el PDF muestren lo mismo. Los términos tocables se detectan **al pintar** el texto, comparándolo con el glosario (en `es`). El paréntesis en inglés que haya detrás no se marca. *(Decisión mía.)*
- **Valores de `fuente`.** Los 70 valores distintos del banco son ids de apartado reales, del 1.1 al 6.2. Si alguna pregunta no tiene `fuente` o no coincide con nada, el bloque no se muestra.
- **Publicación.** No hay script: el HTML del aula se editó a mano. El constructor crea un script (`Examen ISTQB/herramientas/`) que mete los datos y el bloque nuevo en el HTML de la versión vigente. Debe poder volver a ejecutarse.
  - Se comprueba si existe una revisión de simulacro con corrección. Si existe, también lleva el bloque.

## Lo que queda al constructor

- Cómo marcar los términos en el texto (detección automática contra el glosario o marcas en el JSON) y el estilo visual del recuadro de definición, siguiendo el estilo actual del aula.
- Cómo partir la traducción (por capítulo, con subagentes) y cómo revisar la coherencia terminológica entre capítulos.
- La maquetación del PDF.
