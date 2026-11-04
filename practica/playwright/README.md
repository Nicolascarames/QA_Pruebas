# SauceDemo E2E · Playwright + TypeScript

[![E2E Tests](https://github.com/Nicolascarames/QA_Pruebas/actions/workflows/e2e.yml/badge.svg)](https://github.com/Nicolascarames/QA_Pruebas/actions/workflows/e2e.yml)

Tests end-to-end de [SauceDemo](https://www.saucedemo.com) con Playwright, TypeScript y Page Object Model.
Resuelve la [prueba 06](../../pruebas/06-playwright-e2e-saucedemo.md); mis fallos y lecciones están en [06-playwright-e2e-saucedemo.md](../06-playwright-e2e-saucedemo.md).

## Requisitos

- Node 20 o superior.

## Instalación

```bash
npm ci
npx playwright install --with-deps
```

Crea un fichero `.env` en esta carpeta (está en `.gitignore`, no se sube) con la contraseña de SauceDemo:

```
SAUCE_PASSWORD=secret_sauce
```

## Ejecución

```bash
npx playwright test                            # todos los tests en Chromium, Firefox y WebKit
npx playwright test --project=chromium         # un solo navegador
npx playwright test checkOut.spec.ts --headed  # un fichero, viendo el navegador
npx playwright test --repeat-each=3            # detectar tests inestables (flaky)
npx playwright show-report                     # abrir el informe HTML
```

Si un test falla, el informe HTML incluye captura de pantalla, vídeo y traza.

## CI (GitHub Actions)

Workflow: [`.github/workflows/e2e.yml`](../../.github/workflows/e2e.yml) (prueba 15).

- **Cuándo:** push y pull request a `main` (solo si cambia esta carpeta o el workflow), cada noche de lunes a viernes a las 03:00 UTC, y a mano desde la pestaña Actions eligiendo navegador.
- **En paralelo:** 2 shards; cada uno hace su propio login de `setup`.
- **Informe:** el HTML de cada shard se sube como artefacto 14 días, también si fallan los tests.
- **Contraseña:** secret `SAUCE_PASSWORD` del repo (Settings → Secrets and variables → Actions).

## Cobertura

| Fichero | Casos |
|---|---|
| `tests/login.spec.ts` | Login correcto · contraseña incorrecta · usuario bloqueado |
| `tests/inventory.spec.ts` | Ordenar por precio de menor a mayor |
| `tests/cart.spec.ts` | Añadir 2 productos: contador del carrito y contenido |
| `tests/checkOut.spec.ts` | Checkout completo: total = suma de precios + impuestos, y pedido confirmado |

6 tests × 3 navegadores = 18 ejecuciones, más 1 de `setup` (el login).

## Estructura

```
data/    datos de prueba (usuarios, productos y precios)
pages/   Page Objects: LoginPage, InventoryPage, CartPage, CheckoutPage
tests/   especificaciones (auth.setup.ts hace el login único)
```

## Decisiones

- **Page Object Model:** los locators y las acciones viven en `pages/`; los `expect` están en los tests.
- **Locators por rol y nombre accesible** (`getByRole`, `getByText`, regex), sin depender de `data-test`. Es un reto de práctica: en un proyecto real `getByTestId` con `testIdAttribute: 'data-test'` (ya configurado) sería más robusto.
- **Sin esperas fijas:** solo el auto-waiting de Playwright y los `expect` que reintentan.
- **Datos fuera del código:** usuarios y productos en `data/`; la contraseña, en `.env`.
- **Importes con `toBeCloseTo`:** los decimales en JavaScript no son exactos (`29.99 + 15.99 = 45.980000000000004`).
- **Login una sola vez con `storageState`:** el proyecto `setup` (`tests/auth.setup.ts`) inicia sesión y la guarda en `playwright/.auth/user.json` (ignorado por git). Los navegadores dependen de él y cada test arranca con una copia de esa sesión. `login.spec.ts` la anula con un `storageState` vacío, porque prueba el propio formulario.
- **Diagnóstico al fallar:** captura, vídeo y traza solo de los tests fallidos.

## Con más tiempo

- Separar los datos del comprador (nombre, código postal) de los usuarios de login.
- Tests de API, regresión visual y accesibilidad.
