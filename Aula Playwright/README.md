# Aula Playwright · TypeScript

Preguntas tipo test **con código** para aprender Playwright Test con TypeScript: qué función se usa, qué localizador elegir, cómo se hace algo, qué falta en un fragmento de código y por qué falla un test.

## El aula

**https://claude.ai/artifact/ERUrUtck4bbTKnPiEXhsDX** (se abre también desde la app móvil de Claude)

- **Practicar:** una pregunta cada vez, filtrando por nivel (Básico / Medio) y por tema. Contestas primero y la corrección sale por bloques: veredicto, por qué vale o no cada opción (debajo de ella), la idea en una frase, la explicación en viñetas, un truco para recordarlo y el enlace a la documentación oficial. Si te queda una duda, se la puedes preguntar a Claude desde la propia pregunta; responde por apartados (En una frase, Por qué, Ejemplo con código, Tu error, Para recordarlo).
- **Test:** 20 preguntas repartidas entre los temas del nivel elegido (Básico, Medio o Mixto) en 30 minutos; se aprueba con 14 (70 %).
- **Falladas:** las preguntas cuya última respuesta fue incorrecta, para repasarlas hasta acertarlas.
- **Progreso:** acierto por nivel y por tema, e historial de tests. Se guarda en tu cuenta.

Atajos de teclado en la práctica: `A`–`D` para elegir y `Enter` para comprobar o pasar a la siguiente.

## Temario

| Nivel | Temas |
| --- | --- |
| Básico (64) | Localizadores · Acciones · Navegación · Auto-espera · Aserciones · Estructura del test · CLI y configuración · TypeScript para tests |
| Medio (64) | Localizadores avanzados · Frames, diálogos y pestañas · Red (mocks y esperas) · Testing de API · Page Object Model · Fixtures · Autenticación y proyectos · Organización y depuración |

Las preguntas siguen la API actual de `@playwright/test` (revisadas contra los tipos de Playwright 1.64).

## Archivos

```
Aula Playwright/
├── README.md
├── aula-playwright.html       página del aula (generada; no editar a mano)
├── banco/
│   ├── basico-1.json, basico-2.json, medio-1.json, medio-2.json
│   └── banco-playwright.json  todas juntas (generado)
└── herramientas/
    ├── plantilla.html         la página sin preguntas
    ├── validar.mjs            comprueba el formato del banco
    └── construir.mjs          junta el banco y genera la página
```

Para añadir preguntas (o un nivel avanzado): crea o edita un `banco/<nivel>-N.json` y ejecuta

```
node herramientas/validar.mjs
node herramientas/construir.mjs
```

Cada pregunta tiene: `id` (`B-LOC-01`, `M-RED-03`…), `nivel`, `tema`, `tipo` (funcion, localizador, como, codigo, error, concepto), `pregunta`, `codigo` opcional (el hueco a completar se marca con `___`), cuatro `opciones` (el código en línea va entre comillas invertidas; `codigoOpciones: true` si todas son bloques de código), `correcta`, `razones` por opción, `concepto`, `explicacion` (lista de puntos cortos), `clave` y `docs` (enlace a playwright.dev).
