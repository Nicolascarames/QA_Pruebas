# 05 · Priorización por riesgo antes de una release

| Área | Nivel | Tiempo recomendado | Herramientas |
| --- | --- | --- | --- |
| QA / estrategia | Medio | 15–20 min (respuesta oral) | Pizarra |

## Ejercicio

Pregunta de entrevista (oral o por escrito):

> «Es jueves a las 15:00. Mañana a las 09:00 sale a producción la versión 3.2 de una app de comida a domicilio (web + Android + iOS). La versión trae:
> 1. Nuevo método de pago: Bizum
> 2. Rediseño de la pantalla de perfil
> 3. Corrección de un bug del cálculo de gastos de envío
> 4. Nuevos textos legales en el pie de página
>
> Tienes **2 horas** y estás solo. La regresión completa dura 2 días. ¿Qué pruebas y en qué orden? ¿Qué le dices al jefe de producto?»

## Consejos

- Usa una **matriz de riesgo**: riesgo = probabilidad de fallo × impacto.
- Empieza por un **smoke test**: si la app no abre o no deja pedir, lo demás da igual.
- Lo **nuevo** y lo que **toca dinero** va primero; lo cosmético, al final.
- Prueba también **alrededor** de lo cambiado: el cálculo de envío afecta al total, al checkout y al ticket.
- Lo que no te dé tiempo a probar, **comunícalo**: «sale con este riesgo conocido». La decisión es de negocio, no tuya.
- Menciona apoyos: la suite automatizada en CI, feature flags, despliegue gradual (canary), monitorización y plan de rollback.

## Solución

### 1. Matriz de riesgo

| Cambio | Probabilidad de fallo | Impacto | Riesgo | Orden |
| --- | --- | --- | --- | --- |
| Pago con Bizum (nuevo, con integración externa) | Alta | Muy alto (dinero) | **Crítico** | 2 |
| Corrección de gastos de envío | Media | Alto (dinero y totales) | **Alto** | 3 |
| Rediseño de perfil | Media | Medio | Medio | 4 |
| Textos legales | Baja | Bajo (legal, pero visible) | Bajo | 5 |

### 2. Plan de 2 horas

| Minutos | Qué hago |
| --- | --- |
| 0–15 | **Smoke** en web, Android e iOS: abrir la app, login, buscar restaurante, añadir al carrito y pagar con tarjeta (el método existente). Lanzo la suite automatizada en CI en paralelo. |
| 15–55 | **Bizum:** pago correcto, pago rechazado, cancelación por el usuario, timeout o falta de red, volver de la app del banco, importe con decimales, doble pulsación en «Pagar» (cobro doble). Una plataforma a fondo y las otras con el camino feliz. |
| 55–85 | **Gastos de envío:** el caso del bug original, límites (envío gratis a partir de X €), distintas distancias y comprobar que el total = productos + envío − descuentos en carrito, checkout y ticket. |
| 85–105 | **Perfil:** ver y editar datos, guardar, cambiar foto, tamaños de pantalla pequeños. |
| 105–115 | **Textos legales:** que aparezcan y que los enlaces funcionen. |
| 115–120 | **Informe** al jefe de producto. |

### 3. Qué le digo al jefe de producto

> «He cubierto smoke en las 3 plataformas, Bizum a fondo en Android y en camino feliz en web e iOS, el cálculo de envío completo y el perfil básico. **No** he podido hacer la regresión completa ni Bizum a fondo en iOS. Riesgos conocidos: X. Recomiendo salir con Bizum detrás de un feature flag o al 10 % de usuarios, monitorizar los pagos fallidos la primera hora y tener listo el rollback. Si encuentro un fallo crítico en pago o en totales, recomiendo **no** salir.»

### Puntos que debe tener tu respuesta
- Smoke primero.
- Riesgo = probabilidad × impacto.
- Lo nuevo y el dinero, primero.
- Cubrir el entorno de lo cambiado (regresión selectiva).
- Apoyarte en la automatización.
- Comunicación transparente de lo que no se ha probado.
- Mitigaciones: feature flag, canary, monitorización, rollback.
