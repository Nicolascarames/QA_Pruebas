# Examen ISTQB · CTFL v4.0.1

Preparación para la certificación **ISTQB Certified Tester Foundation Level (CTFL) v4.0**, practicando pregunta a pregunta.

## El aula

**https://claude.ai/artifact/4t1hWTtaMeMzBMrwsEaRvr** (fijada en la barra lateral de claude.ai; se abre también desde la app móvil de Claude)

- **Practicar:** una pregunta cada vez. Contestas primero y la corrección sale por bloques: veredicto, por qué vale o no cada opción (debajo de ella), la teoría en una frase, la explicación en viñetas y un truco para el examen. Si te queda una duda, se la puedes preguntar a Claude desde la propia pregunta; responde por apartados (En una frase, Por qué, Ejemplo, Tu error, Para el examen).
- **Simulacro:** 40 preguntas al azar con el mismo reparto por capítulo y nivel K que el examen oficial; 60 minutos (o 75 si el examen no es en tu idioma nativo); se aprueba con 26.
- **Falladas:** las preguntas cuya última respuesta fue incorrecta, para repasarlas hasta acertarlas.
- **Progreso:** acierto por capítulo y por nivel K, e historial de simulacros. Se guarda en tu cuenta.

Atajos de teclado en la práctica: `A`–`D` para elegir y `Enter` para comprobar o pasar a la siguiente.

## El examen (CTFL v4.0)

| Dato | Valor |
| --- | --- |
| Preguntas | 40 (1 punto cada una) |
| Aprobado | 26 puntos (65 %) |
| Duración | 60 min (75 min con el tiempo extra del 25 %) |
| Niveles | K1: 8 · K2: 24 · K3: 8 |

| Capítulo | Preguntas | K1 | K2 | K3 |
| --- | --- | --- | --- | --- |
| 1. Fundamentos de la prueba | 8 | 2 | 6 | 0 |
| 2. La prueba a lo largo del ciclo de vida | 6 | 2 | 4 | 0 |
| 3. Prueba estática | 4 | 2 | 2 | 0 |
| 4. Análisis y diseño de la prueba | 11 | 0 | 6 | 5 |
| 5. Gestión de las actividades de prueba | 9 | 1 | 5 | 3 |
| 6. Herramientas de prueba | 2 | 1 | 1 | 0 |

Fuente: [ISTQB Exam Structure and Rules Tables v1.18](https://istqb.org/wp-content/uploads/2026/05/ISTQB_Exam-Structure-and-Rules-Tables_v1.18.pdf).

## Sobre las preguntas

Las preguntas reales del examen son confidenciales. Las del banco son **originales**, escritas con el estilo, la dificultad y el reparto del examen oficial, y **basadas únicamente en el programa oficial CTFL v4.0.1** (`documentos/ISTQB_CTFL_Syllabus_v4.0.1.pdf`). Cada pregunta indica la sección del programa de la que sale (`fuente`).

Qué entra en el examen (apartados 0.5 y 0.6 del programa): todo el contenido de los capítulos 1–6, los objetivos de aprendizaje con su nivel K y las *keywords* de cada capítulo (a nivel K1). No entran la introducción, los apéndices ni el contenido de las normas y libros de referencia del capítulo 7. Para el último repaso, haz también los exámenes de muestra oficiales que publica ISTQB (Sample Exam A, B, C y D) en [istqb.org](https://www.istqb.org).

## Archivos

```
Examen ISTQB/
├── README.md
├── aula-istqb.html          copia de la página del aula
├── documentos/              programa oficial CTFL v4.0.1 (PDF)
└── banco/
    ├── banco-ctfl4.json     las 172 preguntas juntas
    └── cap1.json … cap6.json  las mismas, por capítulo
```

Cada pregunta tiene: capítulo, objetivo de aprendizaje (FL-x.y.z), nivel K, `fuente` (sección del programa), tema, enunciado, opciones, respuesta correcta, `concepto` (la teoría en una frase), `explicacion` (lista de puntos cortos), por qué cada opción es correcta o no, y un truco para el examen.

Reparto actual: cap. 1: 38 · cap. 2: 28 · cap. 3: 20 · cap. 4: 39 · cap. 5: 37 · cap. 6: 10. Cubren todos los objetivos de aprendizaje del programa y sus keywords principales. Revisadas una a una contra el texto del programa v4.0.1 el 27-10-2026.
