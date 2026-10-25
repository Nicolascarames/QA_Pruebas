# 15 · Pipeline de CI con GitHub Actions

| Área | Nivel | Tiempo recomendado | Herramientas |
| --- | --- | --- | --- |
| CI/CD | Medio | 45–60 min | GitHub, GitHub Actions, el proyecto de la prueba 06 (y opcionalmente el de la 10) |

## Ejercicio

Añade CI al proyecto de Playwright de la **prueba 06** (y, si quieres, a los tests de API de la **10**):

1. Ejecutar los tests en cada **push** y **pull request** a `main`.
2. Ejecutarlos también **cada noche** (regresión nocturna).
3. Lanzarlos **a mano** eligiendo el navegador.
4. Ejecutar en **paralelo** (shards o matriz de navegadores).
5. Publicar el **informe HTML** como artefacto aunque fallen los tests.
6. **Extra:** un job separado para la API (Python) y una insignia (badge) de estado en el README.

## Consejos

- Usa `npm ci` (instalación reproducible a partir del lockfile), no `npm install`.
- `npx playwright install --with-deps` instala los navegadores y las librerías del sistema en el runner de Ubuntu.
- `if: ${{ !cancelled() }}` (o `always()`) en la subida del informe: si no, cuando fallan los tests no se sube nada, que es justo cuando más falta hace.
- **Cachea** las dependencias (`actions/setup-node` con `cache: npm`).
- Los secretos (URLs, credenciales) van en **Settings → Secrets**, nunca en el YAML.
- `retries: 2` en CI está bien como red de seguridad, pero revisa los tests que pasan al reintentar: son flaky (prueba 08).
- Explica cómo encaja en el flujo: los tests de PR **bloquean el merge** (branch protection) y los nocturnos avisan por Slack o email.

## Solución

### `.github/workflows/e2e.yml`

```yaml
name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 3 * * 1-5'        # 03:00 UTC, de lunes a viernes
  workflow_dispatch:
    inputs:
      browser:
        description: 'Navegador'
        required: true
        default: 'chromium'
        type: choice
        options: [chromium, firefox, webkit, all]

concurrency:
  group: e2e-${{ github.ref }}
  cancel-in-progress: true

jobs:
  e2e:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    strategy:
      fail-fast: false
      matrix:
        shard: [1/2, 2/2]
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Instalar dependencias
        run: npm ci

      - name: Instalar navegadores
        run: npx playwright install --with-deps

      - name: Ejecutar tests
        env:
          BROWSER: ${{ github.event.inputs.browser || 'all' }}
        run: |
          if [ "$BROWSER" = "all" ]; then
            npx playwright test --shard=${{ matrix.shard }}
          else
            npx playwright test --project=$BROWSER --shard=${{ matrix.shard }}
          fi

      - name: Subir informe
        if: ${{ !cancelled() }}
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-${{ strategy.job-index }}
          path: playwright-report/
          retention-days: 14

  api:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: api-tests
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: pip
      - run: pip install -r requirements.txt
      - run: pytest -v --junitxml=results.xml
      - name: Subir resultados
        if: ${{ !cancelled() }}
        uses: actions/upload-artifact@v4
        with:
          name: api-results
          path: api-tests/results.xml
```

`api-tests/requirements.txt`:
```
pytest
requests
jsonschema
```

### Badge en el README

```markdown
![E2E Tests](https://github.com/<usuario>/<repo>/actions/workflows/e2e.yml/badge.svg)
```

### Cómo explicarlo en la entrevista
1. **Disparadores:** PR (feedback rápido antes del merge), push a main, noche (regresión completa sin frenar a nadie) y manual.
2. **Paralelismo:** 2 shards dividen la suite y bajan el tiempo; `fail-fast: false` para ver todos los fallos.
3. **Evidencias:** informe HTML + trazas + capturas como artefactos durante 14 días.
4. **Control de costes:** `concurrency` cancela ejecuciones obsoletas de la misma rama y `timeout-minutes` evita jobs colgados.
5. **Calidad:** branch protection exige que pase el check de PR para poder hacer merge.

### Preguntas de seguimiento
- **¿Qué tests van en el PR y cuáles de noche?** En el PR, smoke + API + unitarios (menos de 10 min). De noche, el E2E completo y el cross-browser.
- **¿Jenkins?** La misma idea con un `Jenkinsfile` declarativo (`stages`, `post { always { publishHTML ... } }`).
- **¿Docker?** La imagen oficial `mcr.microsoft.com/playwright:<versión>` trae los navegadores instalados. Úsala con la misma versión que tu `@playwright/test`.
- **¿Entornos?** `baseURL` por variable de entorno (`BASE_URL=${{ vars.STAGING_URL }}`) y un job por entorno.
