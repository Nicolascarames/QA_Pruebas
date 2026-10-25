# 06 · E2E de checkout con Playwright y Page Object Model

| Área | Nivel | Tiempo recomendado | Herramientas |
| --- | --- | --- | --- |
| Automatización web | Medio | 2–4 h (take-home típico) | Node 20+, Playwright + TypeScript |

## Ejercicio

Es la prueba más habitual para un puesto de automatización.

> Automatiza en **https://www.saucedemo.com** (usuario `standard_user` / `secret_sauce`):
> 1. Login correcto.
> 2. Login con usuario bloqueado (`locked_out_user`): se muestra el error.
> 3. Ordenar productos por precio de menor a mayor y comprobar el orden.
> 4. Añadir 2 productos al carrito y comprobar el contador y el contenido del carrito.
> 5. Checkout completo hasta «Thank you for your order!» y comprobar que el total = suma de precios + impuestos.
>
> **Requisitos:** Page Object Model, datos de prueba fuera del código, sin esperas fijas, README con instrucciones, informe HTML y capturas al fallar. **Extra:** ejecución en Chromium, Firefox y WebKit, y pipeline de CI (ver prueba 15).

## Consejos

- **Estructura antes que cantidad.** Pocos tests limpios valen más que muchos desordenados.
- Selectores en este orden de preferencia: `getByRole` / `getByTestId` → CSS estable → XPath solo si no hay más remedio. SauceDemo usa el atributo `data-test`: configura `testIdAttribute: 'data-test'`.
- Playwright ya **espera solo** (auto-waiting) y sus `expect` reintentan. No uses `waitForTimeout`.
- Los asserts van en los tests (o en métodos `expect...` claros), no escondidos en los page objects.
- Usa un `storageState` para no repetir el login en cada test (extra que puntúa).
- Dedica tiempo al README: cómo instalar, cómo ejecutar, qué se ha cubierto y qué mejorarías con más tiempo.
- Antes de entregar, ejecútalo 3 veces seguidas. Si falla alguna vez, es flaky.

## Solución

### Estructura

```
saucedemo-playwright/
├── package.json
├── playwright.config.ts
├── README.md
├── data/
│   └── users.ts
├── pages/
│   ├── LoginPage.ts
│   ├── InventoryPage.ts
│   ├── CartPage.ts
│   └── CheckoutPage.ts
└── tests/
    ├── login.spec.ts
    ├── inventory.spec.ts
    └── checkout.spec.ts
```

### Instalación

```bash
npm init playwright@latest   # elige TypeScript, carpeta tests y GitHub Actions
```

### `playwright.config.ts`

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'https://www.saucedemo.com',
    testIdAttribute: 'data-test',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

### `data/users.ts`

```ts
export const USERS = {
  standard: { username: 'standard_user', password: 'secret_sauce' },
  locked: { username: 'locked_out_user', password: 'secret_sauce' },
} as const;

export const CUSTOMER = { firstName: 'Nico', lastName: 'Carames', postalCode: '15001' };
```

### `pages/LoginPage.ts`

```ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly error: Locator;

  constructor(private readonly page: Page) {
    this.username = page.getByTestId('username');
    this.password = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-button');
    this.error = page.getByTestId('error');
  }

  async goto() {
    await this.page.goto('/');
  }

  async login(user: { username: string; password: string }) {
    await this.username.fill(user.username);
    await this.password.fill(user.password);
    await this.loginButton.click();
  }
}
```

### `pages/InventoryPage.ts`

```ts
import { Page, Locator } from '@playwright/test';

export class InventoryPage {
  readonly title: Locator;
  readonly sort: Locator;
  readonly prices: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByTestId('title');
    this.sort = page.getByTestId('product-sort-container');
    this.prices = page.getByTestId('inventory-item-price');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.cartLink = page.getByTestId('shopping-cart-link');
  }

  /** slug, p. ej. 'sauce-labs-backpack' */
  async addToCart(slug: string) {
    await this.page.getByTestId(`add-to-cart-${slug}`).click();
  }

  async sortBy(value: 'az' | 'za' | 'lohi' | 'hilo') {
    await this.sort.selectOption(value);
  }

  async getPrices(): Promise<number[]> {
    const texts = await this.prices.allTextContents();
    return texts.map((t) => Number(t.replace('$', '')));
  }

  async openCart() {
    await this.cartLink.click();
  }
}
```

### `pages/CartPage.ts`

```ts
import { Page, Locator } from '@playwright/test';

export class CartPage {
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly checkoutButton: Locator;

  constructor(private readonly page: Page) {
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.checkoutButton = page.getByTestId('checkout');
  }

  async checkout() {
    await this.checkoutButton.click();
  }
}
```

### `pages/CheckoutPage.ts`

```ts
import { Page, Locator } from '@playwright/test';

export class CheckoutPage {
  readonly itemPrices: Locator;
  readonly subtotal: Locator;
  readonly tax: Locator;
  readonly total: Locator;
  readonly completeHeader: Locator;

  constructor(private readonly page: Page) {
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.subtotal = page.getByTestId('subtotal-label');
    this.tax = page.getByTestId('tax-label');
    this.total = page.getByTestId('total-label');
    this.completeHeader = page.getByTestId('complete-header');
  }

  async fillCustomer(c: { firstName: string; lastName: string; postalCode: string }) {
    await this.page.getByTestId('firstName').fill(c.firstName);
    await this.page.getByTestId('lastName').fill(c.lastName);
    await this.page.getByTestId('postalCode').fill(c.postalCode);
    await this.page.getByTestId('continue').click();
  }

  async finish() {
    await this.page.getByTestId('finish').click();
  }

  static money(text: string): number {
    // "Item total: $39.98" -> 39.98
    return Number(text.replace(/[^0-9.]/g, ''));
  }
}
```

### `tests/login.spec.ts`

```ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { USERS } from '../data/users';

test.describe('Login', () => {
  test('usuario válido accede al inventario', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(USERS.standard);
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.getByTestId('title')).toHaveText('Products');
  });

  test('usuario bloqueado ve un error', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(USERS.locked);
    await expect(login.error).toContainText('Sorry, this user has been locked out');
    await expect(page).not.toHaveURL(/inventory/);
  });
});
```

### `tests/inventory.spec.ts`

```ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { USERS } from '../data/users';

test.beforeEach(async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.login(USERS.standard);
});

test('ordenar por precio ascendente', async ({ page }) => {
  const inventory = new InventoryPage(page);
  await inventory.sortBy('lohi');
  const prices = await inventory.getPrices();
  expect(prices).toEqual([...prices].sort((a, b) => a - b));
});

test('añadir 2 productos al carrito', async ({ page }) => {
  const inventory = new InventoryPage(page);
  await inventory.addToCart('sauce-labs-backpack');
  await inventory.addToCart('sauce-labs-bike-light');
  await expect(inventory.cartBadge).toHaveText('2');

  await inventory.openCart();
  const cart = new CartPage(page);
  await expect(cart.items).toHaveCount(2);
  await expect(cart.itemNames).toHaveText(['Sauce Labs Backpack', 'Sauce Labs Bike Light']);
});
```

### `tests/checkout.spec.ts`

```ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { USERS, CUSTOMER } from '../data/users';

test('checkout completo con totales correctos', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.login(USERS.standard);

  const inventory = new InventoryPage(page);
  await inventory.addToCart('sauce-labs-backpack');
  await inventory.addToCart('sauce-labs-bolt-t-shirt');
  await inventory.openCart();

  await new CartPage(page).checkout();

  const checkout = new CheckoutPage(page);
  await checkout.fillCustomer(CUSTOMER);

  // Comprobación de totales en la pantalla de resumen
  const itemPrices = (await checkout.itemPrices.allTextContents()).map(CheckoutPage.money);
  const expectedSubtotal = itemPrices.reduce((a, b) => a + b, 0);
  const subtotal = CheckoutPage.money(await checkout.subtotal.innerText());
  const tax = CheckoutPage.money(await checkout.tax.innerText());
  const total = CheckoutPage.money(await checkout.total.innerText());

  expect(subtotal).toBeCloseTo(expectedSubtotal, 2);
  expect(total).toBeCloseTo(subtotal + tax, 2);

  await checkout.finish();
  await expect(checkout.completeHeader).toHaveText('Thank you for your order!');
});
```

### Ejecutar

```bash
npx playwright test               # todos los navegadores
npx playwright test --project=chromium --headed
npx playwright show-report        # informe HTML
npx playwright codegen saucedemo.com   # grabar y descubrir selectores
```

### README mínimo que deberías entregar
```markdown
# SauceDemo E2E – Playwright + TS
## Requisitos
Node 20+
## Instalación
npm ci && npx playwright install --with-deps
## Ejecución
npx playwright test · informe: npx playwright show-report
## Cobertura
Login (válido / bloqueado), ordenación, carrito, checkout con validación de totales.
## Decisiones
POM, data-test como testId, sin esperas fijas, capturas/trazas al fallar, 3 navegadores.
## Con más tiempo
storageState para el login, tests de API, regresión visual, Allure, ejecución en Docker.
```

> Si algún `data-test` ha cambiado en SauceDemo, compruébalo con DevTools o con `npx playwright codegen`. Contarlo en la entrevista también suma.
