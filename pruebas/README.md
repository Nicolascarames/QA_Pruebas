# Pruebas de entrevista QA (manual + automatización web, API y móvil)

Cada archivo trae **enunciado, consejos y solución**. Intenta resolverlo antes de mirar la solución y apunta el progreso en el documento de seguimiento.

| # | Prueba | Área | Tiempo |
| --- | --- | --- | --- |
| 01 | [Casos de prueba de un login](01-casos-prueba-login.md) | Manual | 20–30 min |
| 02 | [Partición de equivalencia y valores límite](02-tecnicas-diseno-casos.md) | Manual | 20 min |
| 03 | [Reporte de bugs en SauceDemo](03-reporte-de-bugs.md) | Manual | 45–60 min |
| 04 | [Escenarios Gherkin (BDD)](04-gherkin-bdd.md) | Manual | 20–30 min |
| 05 | [Priorización por riesgo antes de una release](05-priorizacion-riesgo.md) | Manual | 15–20 min |
| 06 | [E2E de checkout con Playwright y POM](06-playwright-e2e-saucedemo.md) | Web | 2–4 h |
| 07 | [Elementos difíciles con Selenium](07-selenium-elementos-dificiles.md) | Web | 60–90 min |
| 08 | [Arreglar un test flaky](08-arreglar-test-flaky.md) | Web | 30–45 min |
| 09 | [Refactorizar a Page Object Model](09-refactor-page-object-model.md) | Web | 45 min |
| 10 | [CRUD de API en Restful-Booker](10-api-restful-booker.md) | API | 1–2 h |
| 11 | [Login móvil con Appium](11-appium-login-movil.md) | Móvil | 2–3 h |
| 12 | [Casos de prueba específicos de móvil](12-casos-prueba-movil.md) | Móvil | 30 min |
| 13 | [Ejercicios de lógica de programación](13-logica-programacion.md) | Código | 10–15 min c/u |
| 14 | [SQL para QA](14-sql-para-qa.md) | Código | 30 min |
| 15 | [Pipeline de CI con GitHub Actions](15-ci-github-actions.md) | CI/CD | 45–60 min |
| 16 | [Preguntas teóricas con respuesta modelo](16-preguntas-teoricas.md) | Teoría | 1 h |
| 17 | [Rendimiento (k6) y accesibilidad (axe)](17-rendimiento-accesibilidad.md) | Extra | 1–1,5 h |

**Orden recomendado:** 01 → 02 → 03 → 06 → 10 → 08 → 09 → 13 → 16 → el resto.

> Las webs de práctica (SauceDemo, the-internet, Restful-Booker) son públicas y pueden cambiar sus selectores o su comportamiento. Si algo no coincide, compruébalo con DevTools o con Appium Inspector.
