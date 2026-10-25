# 17 · Rendimiento (k6) y accesibilidad (axe)

| Área | Nivel | Tiempo recomendado | Herramientas |
| --- | --- | --- | --- |
| No funcional (extra que diferencia) | Medio | 1–1,5 h | k6, Playwright + `@axe-core/playwright` |

## Ejercicio

**Parte A: rendimiento con k6**
Sobre la API pública `https://test-api.k6.io` (la API de pruebas de Grafana k6) o sobre Restful-Booker:
1. Una prueba de **carga**: subir a 20 usuarios virtuales en 30 s, mantenerlos 1 min y bajar a 0 en 15 s.
2. **Umbrales (thresholds):** p95 < 800 ms y menos del 1 % de errores.
3. **Checks:** status 200 y body no vacío.
4. Interpretar el resultado: ¿pasa o no? ¿qué métrica mirarías primero?

**Parte B: accesibilidad con axe**
En `https://www.saucedemo.com`:
1. Ejecuta axe en el login y en el inventario.
2. Haz fallar el test si hay violaciones **serious** o **critical** de WCAG 2.1 AA.
3. Lista lo que encuentres y cómo lo reportarías.

## Consejos

- En rendimiento, el **percentil 95/99** importa más que la media: la media oculta a los usuarios lentos.
- Define **umbrales** antes de ejecutar: sin un criterio no hay un «pasa o no pasa».
- No lances pruebas de carga contra webs de terceros sin permiso. Usa entornos de prueba pensados para ello.
- axe encuentra alrededor de un tercio de los problemas de accesibilidad. Di que lo complementarías con teclado y lector de pantalla.
- Filtra por `tags` (`wcag2a`, `wcag2aa`, `wcag21aa`) para medir contra el estándar que pida el negocio.

## Solución

### Parte A: `load-test.js`

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 20 },
    { duration: '15s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<800'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
  },
};

export default function () {
  const res = http.get('https://test-api.k6.io/public/crocodiles/');
  check(res, {
    'status 200': (r) => r.status === 200,
    'body no vacío': (r) => r.body && r.body.length > 0,
  });
  sleep(1); // think time: simula a un usuario real
}
```

```bash
# Instalar: https://grafana.com/docs/k6/latest/set-up/install-k6/  (winget install k6 en Windows)
k6 run load-test.js
```

**Cómo leer la salida**
- `http_req_duration ... p(95)=xxxms` → ✓ o ✗ según el umbral.
- `http_req_failed` → porcentaje de errores.
- `iterations` y `http_reqs` → throughput (peticiones por segundo).
- Si falla un umbral, k6 termina con código ≠ 0, así que el **pipeline falla** (fácil de meter en CI).
- Si el p95 empeora a medida que suben los usuarios virtuales, hay un cuello de botella (BD, CPU, pool de conexiones). Lo siguiente sería correlacionarlo con la monitorización del servidor (APM, Grafana).

**Variantes que conviene saber nombrar**
| Tipo | `stages` |
| --- | --- |
| Estrés | Subir por tramos (50 → 100 → 200 VU) hasta que rompa |
| Picos | 0 → 200 VU en 10 s, y bajar |
| Resistencia | 20 VU durante 2 h |

### Parte B: `a11y.spec.ts`

```bash
npm i -D @axe-core/playwright
```

```ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

async function scan(page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG).analyze();
  const serious = results.violations.filter((v) =>
    ['serious', 'critical'].includes(v.impact ?? ''),
  );
  // Log legible para el informe
  for (const v of serious) {
    console.log(`[${v.impact}] ${v.id}: ${v.help} → ${v.nodes.length} elementos\n  ${v.helpUrl}`);
  }
  return serious;
}

test('login sin violaciones serias de accesibilidad', async ({ page }) => {
  await page.goto('https://www.saucedemo.com');
  expect(await scan(page)).toEqual([]);
});

test('inventario sin violaciones serias de accesibilidad', async ({ page }) => {
  await page.goto('https://www.saucedemo.com');
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
  await expect(page).toHaveURL(/inventory/);
  expect(await scan(page)).toEqual([]);
});
```

**Hallazgos esperables** (en webs de demo es normal que el test **falle**, y eso es lo interesante):
- `color-contrast`: textos con poco contraste.
- `select-name`: el desplegable de ordenación sin etiqueta accesible.
- `label`: campos sin `<label>` asociado (solo con placeholder).
- `region` / `landmark-one-main`: falta `<main>` (suele ser «moderate»).

**Cómo lo reportaría**
```
Título: [A11y][WCAG 1.4.3 AA] Contraste insuficiente en los precios del inventario
Regla axe: color-contrast · Impacto: serious · 6 elementos
Pasos: login → inventario → ejecutar axe (o el panel de Lighthouse)
Esperado: contraste ≥ 4.5:1 en texto normal
Obtenido: 3.2:1 (#9e9e9e sobre #ffffff)
Referencia: https://dequeuniversity.com/rules/axe/4.10/color-contrast
```

### Qué decir en la entrevista
> «Además de la parte funcional, meto en el pipeline un smoke de rendimiento con k6 y umbrales de p95 y tasa de error, y un escaneo axe por página crítica que falla en las violaciones serious o critical de WCAG AA. Lo complemento con pruebas manuales de teclado y lector de pantalla, porque la herramienta solo detecta parte de los problemas.»
