# 03 · Reporte de bugs en SauceDemo

| Área | Nivel | Tiempo recomendado | Herramientas |
| --- | --- | --- | --- |
| QA manual / exploratorio | Básico–medio | 45–60 min | Navegador, DevTools, herramienta de capturas |

## Ejercicio

Entra en **https://www.saucedemo.com** con:

- Usuario: `problem_user`
- Contraseña: `secret_sauce`

Este usuario tiene fallos puestos a propósito. **Tarea:**
1. Haz **testing exploratorio** durante 30 minutos (login, catálogo, ordenación, detalle de producto, carrito, checkout).
2. Reporta **al menos 5 bugs** con este formato: título, entorno, precondiciones, pasos, resultado esperado, resultado obtenido, severidad, prioridad y evidencia.
3. **Extra:** compara con `standard_user` para confirmar que son bugs y no comportamiento esperado. Prueba también `performance_glitch_user`, `error_user` y `visual_user`.

## Consejos

- **Título:** qué falla + dónde + cuándo. Por ejemplo: «Checkout: el campo Last Name no conserva el texto escrito». Evita títulos como «No funciona el checkout».
- Pasos **numerados y reproducibles** por alguien que no ha visto la app.
- **Severidad** (impacto técnico) no es lo mismo que **prioridad** (urgencia de negocio). Explica la diferencia si te preguntan.
- Abre DevTools: errores en la consola, peticiones fallidas (404) e imágenes rotas son evidencias valiosas.
- Compara siempre con el usuario «sano» (`standard_user`): así demuestras que el fallo es real.
- Un bug por reporte. No mezcles.

## Solución

> Nota: SauceDemo puede cambiar con el tiempo. Estos son los fallos clásicos de `problem_user`; confírmalos tú.

### Bug 1
- **Título:** Catálogo: todas las imágenes de producto muestran la misma foto (un perro)
- **Entorno:** saucedemo.com · Chrome 1xx · Windows 11 · usuario `problem_user`
- **Pasos:** 1) Iniciar sesión con `problem_user` / `secret_sauce`. 2) Observar la página de inventario.
- **Esperado:** cada producto muestra su propia imagen (como con `standard_user`).
- **Obtenido:** los 6 productos muestran la misma imagen.
- **Severidad:** Media · **Prioridad:** Alta (afecta a la conversión y a la imagen de marca)
- **Evidencia:** captura comparando con `standard_user`.

### Bug 2
- **Título:** Ordenación: elegir «Price (low to high)» no reordena los productos
- **Pasos:** 1) Iniciar sesión con `problem_user`. 2) En el desplegable de ordenación, elegir «Price (low to high)».
- **Esperado:** productos ordenados por precio ascendente.
- **Obtenido:** el orden no cambia.
- **Severidad:** Media · **Prioridad:** Media

### Bug 3
- **Título:** Checkout: el campo «Last Name» no conserva lo escrito y el formulario no se puede completar
- **Pasos:** 1) Añadir un producto. 2) Carrito → Checkout. 3) Escribir First Name «Nico», Last Name «Carames» y Zip «15001».
- **Esperado:** cada campo guarda su valor y «Continue» avanza.
- **Obtenido:** al escribir en Last Name el texto acaba en First Name (o el campo se queda vacío) y aparece «Error: Last Name is required».
- **Severidad:** **Crítica** (bloquea la compra) · **Prioridad:** **Muy alta**

### Bug 4
- **Título:** Inventario: el botón «Add to cart» de algunos productos no añade nada o no cambia a «Remove»
- **Pasos:** 1) Iniciar sesión con `problem_user`. 2) Pulsar «Add to cart» en varios productos.
- **Esperado:** el contador del carrito sube y el botón cambia a «Remove».
- **Obtenido:** en algunos productos no pasa nada; en otros, «Remove» no elimina.
- **Severidad:** Alta · **Prioridad:** Alta

### Bug 5
- **Título:** Detalle de producto: al hacer clic en un producto se abre la ficha de otro
- **Pasos:** 1) En el inventario, hacer clic en el nombre «Sauce Labs Backpack».
- **Esperado:** se abre la ficha de Backpack.
- **Obtenido:** se abre la ficha de un producto distinto (o una ficha con error).
- **Severidad:** Alta · **Prioridad:** Alta

### Otros hallazgos posibles
- `performance_glitch_user`: el login tarda unos 5 segundos. Es un bug de rendimiento; mídelo en la pestaña Network.
- `locked_out_user`: muestra «Sorry, this user has been locked out». Es el comportamiento esperado, **no** un bug.
- `error_user` y `visual_user`: errores al ordenar o finalizar y descuadres visuales. Repórtalos igual.

### Severidad frente a prioridad (pregunta típica)
- **Alta severidad y baja prioridad:** la app se cuelga en una pantalla de configuración que casi nadie usa.
- **Baja severidad y alta prioridad:** el logo de la empresa sale mal en la home.
