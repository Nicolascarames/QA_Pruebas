# TypeScript para quien viene de Python

## 1. Variables

| Python | TypeScript | Nota |
| --- | --- | --- |
| `nombre = "Ana"` | `const nombre = 'Ana';` | `const`: no se puede reasignar (úsalo por defecto) |
| `edad = 30` (y luego `edad = 31`) | `let edad = 30;` | `let`: sí se puede reasignar |
| `None` | `null` / `undefined` | |
| `True` / `False` | `true` / `false` | |
| `f"Hola {nombre}"` | `` `Hola ${nombre}` `` | Comillas invertidas |

Bloques con `{ }` en vez de sangría. El `;` al final es opcional, pero se suele poner.

## 2. Tipos

Como los *type hints* de Python, pero **los comprueba el editor** (subraya en rojo antes de ejecutar).

```python
def saludar(nombre: str, veces: int) -> str:
    return f"Hola {nombre}" * veces
```
```ts
function saludar(nombre: string, veces: number): string {
  return `Hola ${nombre}`.repeat(veces);
}
```

| Python | TypeScript |
| --- | --- |
| `str` | `string` |
| `int`, `float` | `number` (uno solo para los dos) |
| `bool` | `boolean` |
| `list[str]` | `string[]` |
| `dict[str, int]` | `Record<string, number>` |
| `-> None` | `: void` |

## 3. Funciones: tres formas de escribir lo mismo

```ts
// 1) Clásica
function sumar(a: number, b: number): number {
  return a + b;
}

// 2) Flecha (arrow function) guardada en una constante
const sumar = (a: number, b: number): number => {
  return a + b;
};

// 3) Flecha corta: si solo hay una expresión, sin llaves ni return
const sumar = (a: number, b: number) => a + b;
```

La **flecha** es como `lambda` de Python, pero puede tener varias líneas. Es la que ves en los tests:

```ts
test('nombre', async ({ page }) => { ... });
//             ↑ una función flecha que se pasa como argumento a test()
```

## 4. `async` / `await`

Igual que en Python con `asyncio`:

```python
async def login(page):
    await page.fill("#user", "ana")
```
```ts
async function login(page: Page) {
  await page.fill('#user', 'ana');
}
```

- Una función que usa `await` **tiene que ser `async`**.
- Al **llamar** a una función `async`, pon `await` delante. Si lo olvidas, el test sigue sin esperar y falla de forma rara (error típico).
- Devuelve una promesa: el tipo de retorno es `Promise<void>` (lo puedes omitir; TS lo deduce).

## 5. `{ page }`: desestructuración

```ts
async ({ page }) => { ... }
```

Playwright llama a tu función con un **objeto** que tiene muchas cosas (`page`, `context`, `browser`, `request`...). `{ page }` significa "de ese objeto, sácame solo `page`". Equivale en Python a:

```python
def test(fixtures):
    page = fixtures["page"]
```

Lo mismo con opciones: `getByRole('button', { name: 'Login' })` → el segundo argumento es un objeto, como pasar `name="Login"` como *kwarg* en Python.

## 6. Imports

| Python | TypeScript |
| --- | --- |
| `from playwright.sync_api import Page, expect` | `import { Page, expect } from '@playwright/test';` |
| `from .pages.login import LoginPage` | `import { LoginPage } from '../pages/LoginPage';` |
| (todo es importable) | Hay que **exportar**: `export class LoginPage { ... }` |

Si solo importas un tipo: `import type { Page } from '@playwright/test';` (opcional, más limpio).

## 7. Clases (para el Page Object Model)

```python
class LoginPage:
    def __init__(self, page):
        self.page = page
        self.boton = page.get_by_role("button", name="Login")

    async def pulsar(self):
        await self.boton.click()
```
```ts
export class LoginPage {
  readonly page: Page;
  readonly boton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.boton = page.getByRole('button', { name: 'Login' });
  }

  async pulsar() {
    await this.boton.click();
  }
}
```

| Python | TypeScript |
| --- | --- |
| `__init__` | `constructor` |
| `self` (parámetro explícito) | `this` (implícito, no se escribe en los parámetros) |
| atributos se crean en `__init__` | se **declaran** arriba con su tipo |
| — | `readonly`: no se puede reasignar después |
| `LoginPage(page)` | `new LoginPage(page)` |

## 8. Errores típicos viniendo de Python

- Olvidar `await` → el test no espera y falla raro.
- Olvidar `this.` dentro de la clase (en Python `self.`).
- `==` vs `===`: en TS usa siempre `===` (compara sin convertir tipos).
- Olvidar `export` → "has no exported member".
- `snake_case` → en TS se usa `camelCase` (`getByRole`, `loginButton`).
