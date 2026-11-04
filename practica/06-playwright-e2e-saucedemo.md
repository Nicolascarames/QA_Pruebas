# 06 · E2E de checkout con Playwright y POM (mi solución)

Código en [`playwright/`](playwright/). Enunciado en [`pruebas/06-playwright-e2e-saucedemo.md`](../pruebas/06-playwright-e2e-saucedemo.md).

Reto personal añadido: **locators sin `data-test`** (getByRole, getByText, regex, filtros).

## Estado

| # | Caso | Test | Estado |
|---|---|---|---|
| 1 | Login correcto | `login.spec.ts` · TC-01 | ✅ |
| 2 | Usuario bloqueado | `login.spec.ts` · TC-11 (+ TC-03 contraseña incorrecta) | ✅ |
| 3 | Ordenar por precio | `inventory.spec.ts` · TC-02 | ✅ |
| 4 | Carrito: contador y contenido | `cart.spec.ts` | ✅ |
| 5 | Checkout y total = suma + impuestos | `checkOut.spec.ts` | ✅ |

Los 6 tests pasan en Chromium, también 3 veces seguidas (`--repeat-each=3`): no hay flaky.

**Pendiente de los requisitos:**
- [x] Capturas, trazas y vídeo al fallar + informe HTML y `list`.
- [x] README del proyecto: [`playwright/README.md`](playwright/README.md).
- [x] Extra: Chromium, Firefox y WebKit (18 tests en verde).
- [x] Extra: pipeline de CI (prueba 15): [`.github/workflows/e2e.yml`](../.github/workflows/e2e.yml), en verde a la primera.
- [x] Extra: `storageState`: login una sola vez en `tests/auth.setup.ts` (19 en verde; 55 con `--repeat-each=3`).
- [x] Borrado `tests/example.spec.ts`.

## Mapa de la web (cómo la ve Playwright)

| Pantalla | Elemento | Locator usado |
|---|---|---|
| Inventario | Tarjeta de producto (`<div>` sin rol) | `locator('div').filter({has: botón "View details for X"}).filter({has: "Add to cart"}).last()` |
| Cabecera | Carrito: `button "Cart, 2 items": "2"` | `getByRole('button', {name: /^Cart/})` · texto visible = `"2"` |
| Carrito | Nombres de producto | `getByRole('button', {name: /^View details for /})` |
| Paso 1 | Cajas del formulario | `getByRole('textbox', {name: 'First Name'})`... |
| Paso 2 | `Item total: $39.98` · `Tax: $3.20` · `Total: $43.18` | `getByText(/^Item total: \$/)`... |
| Final | «Thank you for your order!» | `getByRole('heading', {name: ...})` |

## Mis fallos y correcciones

En el código, cada corrección está marcada con `// ANTES · MAL · POR QUÉ`.

### Async / await
- **Olvidar `await`** (en `goto` y `login` del `beforeEach`, dos veces). Sin él, el test no espera y sigue en la pantalla equivocada.
- **`map` con `await`** para añadir productos. `map` lanza todo a la vez y no espera → se usa **`for...of`**.
- **`await` dentro de una flecha no `async`** → error de compilación.

### TypeScript
- **Pasar el objeto en vez de la propiedad:** `addToCart(articles.backpack)` → `addToCart(articles.backpack.name)`.
- **`Array` sin tipo:** se escribe `string[]`.

### Locators
- **`getByTestId` no encontraba nada.** Busca `data-testid` y SauceDemo usa `data-test` → `testIdAttribute: 'data-test'` en la config.
- **Buscar un elemento dentro de su hermano.** «Add to cart» no está *dentro* de «View details». Encadenar = buscar dentro → sube al contenedor común y filtra.
- **`/cart` en vez de `/cart.html`.** Mejor aún: hacer clic como el usuario.
- **Copia-pega de un locator** (`totalPrice` apuntaba a «View details for»).

### Matchers
- **`toHaveText('Cart, 2 items')`.** Eso es el **nombre accesible** (`aria-label`); `toHaveText` compara el **texto visible** (`'2'`).
- **`toHaveText` con un string sobre 2 elementos** → error de *strict mode*. Para varios elementos, **un array**.
- **Total escrito a mano** (`'39.98'`, que además era el item total). El caso pide **calcularlo**.
- **Comprobar después de cambiar de pantalla.** El total se comprueba **antes** de Finish.
- **Doble clic en Continue.** `fillInfo` ya lo pulsaba.
- **Faltaba la comprobación final** del «Thank you for your order!».

### storageState
- **`test.use` vacío en los ficheros equivocados.** Lo puse en cart, inventory y checkOut (los que **sí** necesitan la sesión) y no en login. Fallaron los 3: sin sesión, SauceDemo devuelve al login. Va solo en `login.spec.ts`.

## Comparación con la solución oficial

| Punto | Yo | Solución | Comentario |
|---|---|---|---|
| Locators | sin `data-test` (reto) | `getByTestId` con `data-test` | La suya es más robusta. La mía obliga a entender roles y `aria-label`. |
| `addToCart` | lista de nombres | un *slug* por llamada | Las dos valen. |
| Suma esperada | precios de `data/articles.ts` | precios leídos de la pantalla de resumen | La mía también detecta un precio cambiado en la web. La suya no depende de mantener los datos al día. |
| Datos del formulario | en `users.standard` | objeto `CUSTOMER` aparte | Separarlos es más limpio: el comprador no es el usuario de login. |
| Página final | `toBeVisible()` del heading | `toHaveText('Thank you...')` | Equivalentes. |
| Config | igual que la solución | 3 navegadores, captura/traza/vídeo al fallar, informe HTML + list | Hecho. |

## Lecciones

**Método para cualquier comprobación (4 pasos):**
1. ¿Qué quiero comprobar, en palabras?
2. ¿Qué elemento de la página lo demuestra?
3. ¿Cómo lo ve Playwright? (Pick locator o snapshot del error)
4. ¿Qué matcher compara eso?

**Reglas:**
- **Comprobar → `expect(locator)`**: reintenta solo y no necesita esperas.
- **Calcular → sacar el dato** (`textContent`, `allTextContents`) **y luego `expect(valor)`**.
- **Un elemento concreto** → nombre exacto y subir a su contenedor. **Todos los de un tipo** → lo que tienen en común (regex).
- **Regex:** `^` empieza por, `$` acaba en, sin anclajes contiene; distingue mayúsculas salvo con `/i`. Un string en `name` = contiene y sin distinguir mayúsculas.
- **Nombre accesible:** `aria-labelledby` > `aria-label` > `<label>`/`alt` > texto visible > `title`.
- **Solo aceptan array:** `toHaveText`, `toContainText`, `toHaveClass`. El resto exige un solo elemento (*strict*), igual que las acciones (`click`, `fill`).
- **Decimales:** `29.99 + 15.99 = 45.980000000000004` → `toBeCloseTo(x, 2)`.
- **Ficheros de test:** deben acabar en `.spec.ts`. Si no, Playwright los ignora sin avisar.
- **Cada test arranca con un navegador limpio** (contexto nuevo): nada pasa de un test a otro. `storageState` solo decide con qué arranca: con una copia de la sesión guardada o vacío.
- **`test.use(...)` no es un test:** es configuración para todo el fichero (o `describe`). Se pone arriba por claridad.
- **CI:** el YAML va en `.github/workflows/` de la **raíz** del repo. `working-directory` solo afecta a los `run:`; los `uses:` (`path`, `cache-dependency-path`) llevan la ruta completa.
- **Secrets:** la contraseña va en Settings → Secrets y se pasa como `env:` del paso; en los logs sale `***`. GitHub define `CI=true`, que activa `retries: 2` de la config.
- **Pick locator con login delante:** `await page.pause()` tras el login, o `codegen --save-storage` / `--load-storage`.
