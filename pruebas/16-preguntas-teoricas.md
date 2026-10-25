# 16 · Preguntas teóricas con respuesta modelo

| Área | Nivel | Tiempo recomendado | Herramientas |
| --- | --- | --- | --- |
| Teoría / proceso | Todos | Repaso de 1 h; responde cada una en voz alta en menos de 1 min | Ninguna |

## Ejercicio

Tápate las respuestas y contesta en voz alta, como en la entrevista. Después compara.

## Consejos

- Estructura: **definición corta → ejemplo real → cuándo lo usas**.
- Usa ejemplos de **tu experiencia**. En tu caso, flujos de integración (IBM ACE, MQ) son un buen ejemplo de testing de integración, contratos y mensajería.
- Si no sabes algo, di cómo lo averiguarías. Es mejor que inventar.
- Preguntas de comportamiento: método **STAR** (Situación, Tarea, Acción, Resultado).

## Preguntas y respuestas modelo

### Fundamentos

**1. ¿Qué diferencia hay entre verificación y validación?**
Verificación: ¿estamos construyendo el producto **bien**? (cumple la especificación; revisiones, tests). Validación: ¿estamos construyendo el producto **correcto**? (resuelve la necesidad del usuario; UAT).

**2. Error, defecto y fallo.**
Un **error** humano introduce un **defecto** (bug) en el código; al ejecutarse, el defecto produce un **fallo** visible.

**3. Explica la pirámide de testing.**
Base ancha de **unitarios** (rápidos y baratos), en medio **integración / API** y arriba pocos **E2E de UI** (lentos y frágiles). Si se invierte (el «cono de helado») la suite es lenta e inestable. Variante moderna: el «trofeo», con más peso en la integración.

**4. Smoke, sanity y regresión.**
- **Smoke:** comprobación rápida y amplia de que la build es estable (¿arranca? ¿login? ¿flujo principal?).
- **Sanity:** comprobación rápida y concreta tras un arreglo puntual.
- **Regresión:** volver a probar lo existente para asegurar que el cambio no ha roto nada.

**5. Caja negra, blanca y gris.**
Caja negra: sin ver el código (funcional). Caja blanca: conociendo el código (cobertura de ramas). Caja gris: conocimiento parcial (por ejemplo, sabes el esquema de la BD y validas en ella).

**6. Testing funcional y no funcional.**
Funcional: **qué** hace (reglas de negocio). No funcional: **cómo** lo hace (rendimiento, seguridad, usabilidad, accesibilidad, compatibilidad).

**7. Los 7 principios del testing (ISTQB).**
1. El testing muestra la presencia de defectos, no su ausencia.
2. El testing exhaustivo es imposible.
3. Probar pronto ahorra (shift-left).
4. Los defectos se agrupan.
5. La paradoja del pesticida: los mismos tests dejan de encontrar fallos.
6. El testing depende del contexto.
7. La falacia de la ausencia de errores: sin errores no significa útil.

### Proceso y ágil

**8. Ciclo de vida de un bug.**
Nuevo → Asignado → En curso → Resuelto → En verificación → Cerrado. Ramas posibles: Rechazado / Duplicado / No reproducible / Aplazado / Reabierto.

**9. ¿Qué hace un QA en Scrum?**
- Refinamiento: aclara los criterios de aceptación y detecta ambigüedades.
- Planning: estima el esfuerzo de pruebas.
- Durante el sprint: prueba pronto, automatiza y hace pairing con desarrollo.
- Participa en la Definition of Done y en la demo.
- En la retro: propone mejoras de calidad.

**10. ¿Qué es shift-left? ¿Y shift-right?**
Shift-left: probar antes (revisar requisitos, unitarios, contratos y API antes que la UI). Shift-right: probar y observar en producción (monitorización, feature flags, canary, A/B).

**11. Criterios de entrada y de salida.**
Entrada: la build desplegada, el entorno y los datos listos, el smoke pasado. Salida: los casos críticos pasados, ningún bug bloqueante o crítico abierto, la cobertura acordada y los riesgos comunicados.

**12. ¿Qué incluye un plan de pruebas?**
Alcance (qué entra y qué no), enfoque y tipos de prueba, entornos, datos, herramientas, roles, calendario, criterios de entrada y salida, riesgos y mitigación, entregables.

### Automatización

**13. ¿Qué automatizas y qué no?**
**Sí:** regresión repetitiva, smoke, flujos críticos estables, API, pruebas con muchos datos (data-driven) y multiplataforma. **No:** exploratorio, usabilidad, funcionalidades que cambian cada sprint, casos que se ejecutan una sola vez y lo visual subjetivo.

**14. ¿Cómo eliges framework (Selenium, Cypress o Playwright)?**
Según el lenguaje del equipo, los navegadores necesarios, el tipo de app, la comunidad y el coste de mantenimiento.
- **Playwright:** multinavegador (incluido WebKit), auto-waiting, varias pestañas, API testing integrado y trazas.
- **Cypress:** muy buena experiencia de desarrollo, pero tradicionalmente con limitaciones en multipestaña y multidominio.
- **Selenium:** el estándar W3C; muchos lenguajes, grid y ecosistema enorme.

**15. ¿Por qué falla un test de forma intermitente y qué haces?**
Causas: timing y esperas, dependencia entre tests, datos compartidos, entorno inestable, selectores frágiles, animaciones. Qué hago: lo reproduzco ejecutándolo N veces, reviso trazas y capturas, lo pongo en cuarentena con un ticket y arreglo la causa raíz. Nunca lo dejo con reintentos para siempre. (Ver la prueba 08.)

**16. ¿Qué es el Page Object Model? ¿Ventajas?**
Un patrón que encapsula cada pantalla en una clase con sus localizadores y acciones. Ventajas: menos duplicación, mantenimiento en un solo sitio y tests legibles. (Ver la prueba 09.)

**17. ¿Qué es BDD? ¿Aporta siempre?**
Desarrollo guiado por comportamiento con escenarios Given/When/Then compartidos entre negocio, desarrollo y QA. Aporta si negocio **participa** de verdad en los escenarios. Si solo lo escribe QA, añade una capa más sin beneficio.

**18. ¿Cómo gestionas los datos de prueba?**
Cada test crea sus propios datos (por API, que es más rápido que por UI) y los limpia después. Uso factories o builders, datos únicos (timestamps o UUID) para poder ejecutar en paralelo, seeds idempotentes y BD desechables (Testcontainers). Nada de datos reales de clientes (RGPD).

**19. ¿Qué es el mocking / stubbing y cuándo lo usas?**
Sustituir una dependencia por una falsa controlada. Lo uso para servicios de terceros inestables o de pago (pasarela de pago), para forzar errores (500, timeout) o para aislar el frontend (`page.route` en Playwright; WireMock).

**20. ¿Qué es el contract testing?**
Verifica que el consumidor y el proveedor de una API cumplen un contrato acordado (por ejemplo con Pact) sin levantar todo el sistema. Es muy útil en microservicios e **integraciones**, como los flujos de ACE/MQ.

### Móvil

**21. Nativa, híbrida y web móvil.**
Nativa: hecha para el SO (Kotlin/Swift). Híbrida: web dentro de un contenedor nativo (WebView: Ionic, Capacitor). Web móvil: se abre en el navegador. React Native y Flutter son multiplataforma pero renderizan componentes nativos o propios.

**22. Emulador, simulador y dispositivo real.**
El emulador (Android) imita hardware y software; el simulador (iOS) imita solo el software. El dispositivo real es imprescindible para rendimiento, batería, sensores, red real y fallos de un fabricante concreto.

### Seguridad, rendimiento y accesibilidad

**23. Carga, estrés, picos y resistencia.**
- **Carga:** con el volumen esperado.
- **Estrés:** por encima del límite, para ver dónde y cómo rompe.
- **Picos (spike):** subidas bruscas.
- **Resistencia (soak):** carga sostenida durante horas para detectar fugas de memoria.

**24. ¿Qué pruebas de seguridad básicas haría un QA?**
- Inyección SQL y XSS en las entradas.
- Control de acceso: cambiar el id en la URL (IDOR).
- Sesión: expiración y logout real.
- HTTPS y cabeceras.
- Que los mensajes de error no revelen información.
- Referencia: el OWASP Top 10.

**25. Accesibilidad: ¿qué es WCAG?**
Las pautas de accesibilidad web del W3C (niveles A, AA y AAA; normalmente se exige AA). Cuatro principios: perceptible, operable, comprensible y robusto. Se prueba con axe / Lighthouse (automático, que detecta un 30–40 %) más el teclado y el lector de pantalla (manual).

### Comportamiento (usa STAR)

**26. «Cuéntame un bug importante que encontraste.»**
**S:** contexto del proyecto. **T:** qué tenías que probar. **A:** cómo lo encontraste, cómo lo aislaste y cómo lo reportaste. **R:** impacto evitado (dinero, usuarios), qué se mejoró después (un test automático o un proceso).

**27. «Un desarrollador dice que tu bug no es un bug.»**
Vuelvo al requisito o a los criterios de aceptación y aporto evidencias y el impacto en el usuario. Si el requisito es ambiguo, implico al PO para que decida. Lo importante es el producto, no tener razón.

**28. «No hay tiempo para probar todo.»**
Priorizo por riesgo, comunico lo que no se ha probado y propongo mitigaciones. (Ver la prueba 05.)

**29. «¿Por qué QA y no desarrollo?»**
Respuesta personal. Pon en valor tu perfil de desarrollador e integraciones: entiendes el código, las APIs y la arquitectura, lo que te permite automatizar bien y encontrar fallos en las integraciones.

**30. «¿Qué preguntas tienes para nosotros?»** (ten siempre 2 o 3)
- ¿Cuál es la proporción de QA por desarrollador y cómo está repartida la automatización (UI / API / unitarios)?
- ¿Los tests bloquean el merge? ¿Cuánto tarda el pipeline?
- ¿Cuál es el mayor problema de calidad que tenéis ahora?
