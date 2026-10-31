# Apuntes de Playwright

## Locators: cuál usar

Orden de preferencia (el que recomienda Playwright). Ejemplos sobre SauceDemo.

| # | Locator | Busca por | Ejemplo | Cuándo usarlo | Estabilidad |
| --- | --- | --- | --- | --- | --- |
| 1 | `getByRole` | Qué es + cómo se llama (lo que ve el usuario y el lector de pantalla) | `getByRole('button', { name: 'Login' })` | Por defecto: botones, enlaces, campos, casillas, desplegables, alertas | Alta. Solo se rompe si cambia el texto visible |
| 2 | `getByLabel` | El `<label>` asociado a un campo | `getByLabel('Email')` | Formularios con etiquetas | Alta |
| 3 | `getByPlaceholder` | El texto gris de dentro del campo | `getByPlaceholder('Username')` | Campos sin `<label>` | Media-alta |
| 4 | `getByText` | El texto visible | `getByText('Products')` | Texto sin rol: títulos sueltos, párrafos, mensajes | Media. Se rompe con cambios de texto o traducciones |
| 5 | `getByTestId` | El atributo de test (`data-testid` por defecto; se cambia con `testIdAttribute` en la config) | `getByTestId('login-button')` | Cuando lo anterior no sirve o es ambiguo, si los desarrolladores ponen el atributo | Muy alta. Existe solo para los tests |
| 6 | `locator('css')` | Cualquier cosa del HTML | `locator('[data-test="title"]')` | Último recurso | Depende del atributo (ver abajo) |
| 7 | `locator('xpath=...')` | La ruta en el árbol HTML | `locator('xpath=//div[2]/input')` | Casi nunca | Baja |

## ¿Por qué "el CSS falla mucho"?

No falla por ser CSS, sino por **a qué te ates**:

| Selector CSS | ¿Estable? | Por qué |
| --- | --- | --- |
| `[data-test="login-button"]` | ✅ Sí | Atributo solo para tests (es lo mismo que `getByTestId`) |
| `#login-button` | 🟡 Regular | El `id` lo pueden cambiar los desarrolladores |
| `.submit-button` | ❌ No | Las clases son de estilos y cambian en cada rediseño |
| `.css-1x9f2k` | ❌ Nunca | Clases autogeneradas: cambian en cada build |
| `div > form > div:nth-child(3) > input` | ❌ Nunca | Depende de la estructura: un `div` más y se rompe |

Regla: apunta a lo que **ve el usuario** (rol, etiqueta, texto) o a lo que existe **solo para tests** (`data-test`). Nunca a estilos ni a posiciones.

## Cómo pensar un locator

**Regla:** describe el elemento como se lo dirías a alguien **por teléfono** que ve la pantalla, no como un desarrollador que lee el código.

| ❌ Descripción de desarrollador | ✅ Descripción de usuario | Locator |
| --- | --- | --- |
| "El input dentro del div con clase `form_group`" | "El campo Username" | `getByRole('textbox', { name: 'Username' })` |
| "El `<span class="title">`" | "El texto Products" | `getByText('Products')` |
| "El 1.er botón del 3.er `div`" | "El botón Add to cart **del Backpack**" | ver abajo |

**Los 4 pasos:**
1. **¿Qué es?** Botón, campo, enlace, casilla... → el rol.
2. **¿Qué dice?** El texto o la etiqueta → el `name`.
3. **¿Es único?** Si hay varios iguales, ¿qué lo distingue *para el usuario*? → acotar por contexto.
4. **Prueba del rediseño:** si mañana cambian colores, clases y maquetación pero la pantalla dice lo mismo, ¿sigue funcionando? Si no, el locator está mal.

**Acotar por contexto (paso 3).** En el catálogo hay 6 botones "Add to cart". "Dentro de" está bien si el contenedor es algo con sentido (la tarjeta del producto), no una clase de estilos:

```ts
page.getByTestId('inventory-item')                          // las 6 tarjetas de producto
  .filter({ hasText: 'Sauce Labs Backpack' })               // la del Backpack
  .getByRole('button', { name: 'Add to cart' });            // su botón
```

**Cómo practicar:**
- Para cada elemento que necesites, escribe 2-3 locators distintos y quédate con el que pase la prueba del rediseño.
- Compáralo con lo que propone Pick locator; si propone otro, pregúntate por qué.
- Si un locator encuentra varios elementos, Playwright da error de *strict mode* ("resolved to 6 elements"): es la señal para acotar.

## Sin `data-test`: localizar por texto con regex

Cuando un elemento no tiene rol ni atributo de test, se localiza por **la forma de su texto**:

```ts
page.getByText('Products', { exact: true })   // texto exacto (1 elemento)
page.getByText(/^\$\d+\.\d{2}$/)              // todo lo que sea un precio: $29.99, $7.99... (6 elementos)
```

Regex del precio, por partes: `^` empieza · `\$` un `$` literal · `\d+` uno o más dígitos · `\.` un punto literal · `\d{2}` dos dígitos · `$` termina. Los `^` y `$` evitan que coincida con un texto más largo que *contenga* un precio (p. ej. la descripción de un producto).

Las regex van entre `/ /`, sin comillas (en Python serían `re.compile(r"...")`).

## Comprobaciones (`expect`): cómo recordarlas

**Léelas como una frase:** `expect(X).toBe...` = "espero que X **esté / sea**..." · `expect(X).toHave...` = "espero que X **tenga**...".

- **`toBe...` → ESTADO** (cómo está: sí/no, sin argumento)
- **`toHave...` → DATO** (qué tiene: siempre lleva el valor esperado entre paréntesis)
- **`toContain...` → "contiene"** (una parte, no todo)
- **`.not.`** → "no" (va antes: `expect(x).not.toBeVisible()`)

### Sobre la página (locator o `page`) → reintentan → **siempre con `await`**

| Comprobación | Se lee | Ejemplo |
| --- | --- | --- |
| `toBeVisible()` | esté visible | `await expect(loginPage.msgError).toBeVisible()` |
| `toBeHidden()` | esté oculto / no exista | |
| `toBeEnabled()` / `toBeDisabled()` | esté activado / desactivado | botón de enviar |
| `toBeChecked()` | esté marcado | casilla Recordarme |
| `toBeEditable()` | se pueda escribir | |
| `toBeFocused()` | tenga el foco | accesibilidad con teclado |
| `toHaveText('x')` | tenga **exactamente** el texto x | |
| `toContainText('x')` | contenga el texto x | mensajes largos |
| `toHaveValue('x')` | tenga el valor x (lo escrito en un campo) | `toHaveValue('standard_user')` |
| `toHaveCount(n)` | tenga n elementos | `not.toHaveCount(0)` = "no esté vacío" |
| `toHaveAttribute('a', 'v')` | tenga el atributo a con valor v | `toHaveAttribute('type', 'password')` |
| `toHaveURL(...)` | (la página) tenga esa URL | `await expect(page).toHaveURL('/inventory.html')` |
| `toHaveTitle(...)` | (la página) tenga ese título de pestaña | |

### Sobre valores (número, texto, array) → miran una vez → **sin `await`**

| Comprobación | Se lee | Ejemplo |
| --- | --- | --- |
| `toBe(v)` | sea **el mismo** valor (`===`) | `expect(total).toBe(32.39)` |
| `toEqual(v)` | sea **igual en contenido** (arrays, objetos) | `expect(prices).toEqual(sorted)` |
| `toContain(v)` | contenga ese elemento / trozo | `expect(names).toContain('Sauce Labs Backpack')` |
| `toBeGreaterThan(n)` / `toBeLessThan(n)` | sea mayor / menor que n | `expect(prices.length).toBeGreaterThan(1)` |
| `toBeCloseTo(n, d)` | sea casi n (d decimales) | sumas con decimales: `0.1 + 0.2` |
| `toBeTruthy()` / `toBeFalsy()` | sea verdadero / falso "en general" | |

`toBe` vs `toEqual`: `[1,2]` **no** `toBe` `[1,2]` (son dos listas distintas), pero **sí** `toEqual`. Para arrays y objetos, siempre `toEqual`.

## ¿De dónde sale el rol?

Dos orígenes:

| Origen | ¿Se ve en el DOM? | Ejemplo |
| --- | --- | --- |
| **Explícito:** atributo `role` | ✅ Sí | `<h3 role="alert">` → `alert` (el error de SauceDemo) |
| **Implícito:** lo calcula el navegador por la etiqueta | ❌ No | `<button>` → `button`; `<a href>` → `link`; `<h1>` → `heading`; `<input type="text">` → `textbox` |

- El `role` explícito **manda** sobre el implícito: el error es un `<h3>` (sería `heading`), pero con `role="alert"` pasa a ser `alert`.
- El **nombre** también puede venir de un atributo: `aria-label="Dismiss error"` da nombre al botón de la X del error.

**De dónde sale el nombre** (gana el primero que exista):

| Prioridad | Origen | Ejemplo |
| --- | --- | --- |
| 1 | `aria-labelledby` (id de otro elemento cuyo texto es el nombre) | `<select aria-labelledby="lbl">` |
| 2 | `aria-label` | `<select aria-label="Sort products">` (desplegable de SauceDemo) |
| 3 | `<label>` asociado | `<label for="sort">Ordenar</label><select id="sort">` |
| 4 | Texto de dentro (botones, enlaces...) | `<button>Login</button>` |
| 5 | `title` / `placeholder` (último recurso) | `<input placeholder="Username">` (campos del login de SauceDemo) |

El nombre de un `combobox` sirve para **encontrarlo**; la opción se elige luego con `.selectOption(...)` (por `value` o por texto visible).

**Cómo averiguar rol y nombre de un elemento:**
1. **Chrome DevTools:** Inspeccionar → pestaña **Accessibility** (junto a Styles) → *Computed Properties* muestra `Role` y `Name`.
2. **Pick locator** de la extensión: te propone el `getByRole` directamente.
3. **Árbol de accesibilidad** desde código: `await page.locator('body').ariaSnapshot()`.
4. Lista de roles: la especificación WAI-ARIA (MDN: "WAI-ARIA Roles").

## Notas

- `count()` **no espera**: devuelve lo que hay en ese instante (puede dar 0 si la página aún carga). Los `expect(...)` y las acciones (`click`, `fill`) sí esperan solas.

- `getByTestId` **no** busca el `id`: busca `data-testid`, o el atributo que pongas en `use: { testIdAttribute: '...' }`. Es uno por proyecto.
- `getByRole` comprueba accesibilidad gratis: si no encuentra el botón por su nombre, un lector de pantalla tampoco.
- No todo tiene rol: en SauceDemo el título "Products" es texto suelto (no `heading`), así que hay que usar `getByText` o `getByTestId`.
- Ver cómo ve Playwright una página: Pick locator en la extensión de VS Code, o `npx playwright codegen <url>`.
- Elige un estilo y úsalo de forma coherente en todo el proyecto.

## Errores típicos

- **`waiting for locator(...)` + timeout:** el selector no coincide con nada. Revísalo (¿faltan los corchetes `[ ]`?) o pruébalo en la consola del navegador con `document.querySelector('...')`.
- **`Expected` vs `Received`:** `Expected` es lo que esperabas y `Received` lo que había de verdad. Si `Received` trae media página, el locator apunta a un contenedor demasiado grande.
- **El mensaje esperado no aparece:** ¿has hecho la acción que lo provoca (el `click`)?
- **`toBeVisible(algo)`:** no recibe un locator; solo comprueba que se ve el elemento del `expect(...)`.
