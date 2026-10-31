# 01 · Casos de prueba de un login (mi solución)

## Suposiciones y preguntas al entrevistador

Técnica: recorrer cada elemento del enunciado y preguntar "¿qué no me dice?".

**Email**
- ¿Distingue mayúsculas (`Ana@x.com` = `ana@x.com`)? ¿Se recortan los espacios del principio y el final?
- ¿Longitud máxima del email?

**Contraseña**
- ¿Longitud mínima y máxima? ¿Reglas de complejidad?
- ¿Se permite pegar en el campo?

**Bloqueo (5 intentos / 15 min)**
- ¿Cuenta por usuario, por IP o por dispositivo?
- ¿El contador se reinicia tras un login correcto?
- ¿Se avisa al usuario de los intentos que le quedan? ¿Recibe un email al bloquearse?
- Si se intenta entrar durante el bloqueo con la contraseña correcta, ¿se deniega? ¿Alarga el bloqueo?

**Recordarme**
- ¿Cuánto dura la sesión recordada? ¿Qué pasa al cerrar sesión a mano o cambiar la contraseña?

**¿Has olvidado tu contraseña?**
- ¿Cuánto tiempo es válido el enlace de recuperación? ¿Es de un solo uso?

**General**
- ¿Hay 2FA o captcha? ¿Navegadores y dispositivos soportados? ¿Requisitos de accesibilidad (WCAG)?

## Categorías

| Categoría | Ideas de casos |
| --- | --- |
| Funcional positivo | camino feliz; el ojo muestra/oculta la contraseña |
| Funcional negativo / validaciones | credenciales incorrectas; email con formato inválido; contraseña demasiado corta |
| Campos vacíos y entradas "raras" | campos vacíos; espacios y mayúsculas en el email |
| Valores límite | intentos fallidos alrededor de 5; tiempo alrededor de 15 min; longitud mínima de contraseña |
| Bloqueo de cuenta | error y bloqueo tras 5 intentos fallidos |
| Sesión / Recordarme | con "Recordarme" marcado, al volver entra sin mostrar el login |
| Seguridad | recuperar contraseña sin revelar si el correo existe; inyecciones en los campos; la contraseña no aparece donde no debe |
| Accesibilidad | uso solo con teclado; lector de pantalla |
| Compatibilidad | responsive en web y móvil |

## Casos de prueba

| ID | Título | Precondiciones | Pasos | Datos | Resultado esperado | Prioridad |
| --- | --- | --- | --- | --- | --- | --- |
| TC-01 | Login correcto | Usuario activo | Escribir email y contraseña válidos, pulsar Iniciar sesión | `ana@test.com` / `Valida123!` | Entra a la página principal | Alta |
| TC-02 | El ojo muestra y oculta la contraseña | — | Escribir contraseña, pulsar el ojo dos veces | `Valida123!` | 1.ª pulsación: texto visible; 2.ª: vuelve a puntos | Baja |
| TC-03 | Contraseña incorrecta | Usuario activo | Email válido + contraseña mala, enviar | `ana@test.com` / `Mala123!` | Error genérico "email o contraseña incorrectos"; no entra | Alta |
| TC-04 | Email no registrado | — | Email inexistente + cualquier contraseña, enviar | `nadie@test.com` | Mismo error genérico que TC-03 (no revela que no existe) | Alta |
| TC-05 | Email con formato inválido | — | Escribir email sin @, enviar | `ana.test.com` | Aviso de formato; no se envía la petición | Baja |
| TC-06 | Contraseña más corta que el mínimo | Mínimo conocido (p. ej. 8) | Contraseña de mínimo-1, mínimo y mínimo+1 | 7, 8 y 9 caracteres | 7: rechazada; 8 y 9: aceptadas por la validación | Baja |
| TC-07 | Campos vacíos | — | Dejar email, contraseña o ambos vacíos, enviar | — | Aviso de campo obligatorio en cada caso; no se envía | Media |
| TC-08 | Email con mayúsculas y espacios | Usuario `ana@test.com` | Entrar con `  Ana@Test.com  ` | — | Según la respuesta del entrevistador; normalmente entra | Media |
| TC-09 | 4 intentos fallidos no bloquean | Usuario activo, contador a 0 | 4 contraseñas malas y luego la buena | — | Entra con la buena | Media |
| TC-10 | 5 intentos fallidos bloquean | Usuario activo, contador a 0 | 5 contraseñas malas | — | Mensaje de cuenta bloqueada 15 min | Alta |
| TC-11 | Bloqueada rechaza la contraseña correcta | Cuenta bloqueada (TC-10) | 6.º intento con la contraseña buena | — | No entra; sigue bloqueada | Alta |
| TC-12 | El bloqueo dura 15 minutos | Cuenta bloqueada | Intentar a los 14:59 y a los 15:00 | Contraseña buena | 14:59: bloqueada; 15:00: entra | Media |
| TC-13 | El contador se reinicia tras un login correcto | Usuario activo | 3 fallos, login bueno, cerrar sesión, 4 fallos más | — | No se bloquea (el contador volvió a 0) | Media |
| TC-14 | Recordarme mantiene la sesión | — | Login con Recordarme, cerrar navegador, volver a abrir la web | Credenciales válidas | Entra directo sin ver el login | Media |
| TC-15 | Sin Recordarme no se mantiene | — | Login sin Recordarme, cerrar navegador, volver | Credenciales válidas | Pide login de nuevo | Media |
| TC-16 | Recuperar contraseña no revela si el email existe | — | Pulsar el enlace, enviar email existente y luego uno inexistente | `ana@test.com`, `nadie@test.com` | Mismo mensaje en los dos casos | Alta |
| TC-17 | Inyección SQL en el email | — | Escribir la inyección como email, enviar | `' OR '1'='1' --` | No entra; error genérico; sin errores técnicos en pantalla | Alta |
| TC-18 | XSS en los campos | — | Escribir un script en el email, enviar | `<script>alert(1)</script>` | No se ejecuta nada; se trata como texto | Alta |
| TC-19 | La contraseña no se expone | DevTools abiertas | Hacer login y revisar la petición y el almacenamiento | — | Va por HTTPS en el body del POST; nunca en la URL, en respuestas ni en `localStorage` | Alta |
| TC-20 | Login solo con teclado | — | Navegar con Tab, marcar Recordarme con Espacio, enviar con Enter | Credenciales válidas | Orden lógico, foco visible, login correcto | Alta |
| TC-21 | Lector de pantalla | Lector activo (NVDA o VoiceOver) | Recorrer el formulario y provocar un error | — | Cada campo anuncia su etiqueta, el ojo tiene nombre y el error se anuncia | Media |
| TC-22 | Responsive | — | Abrir el login en móvil, tablet y escritorio | 375 px, 768 px, 1440 px | Todo visible y usable, sin scroll horizontal | Baja |
| TC-23 | La contraseña distingue mayúsculas | Usuario activo | Escribir la contraseña buena con mayúsculas cambiadas | `vALIDA123!` | Rechazada con el error genérico | Media |
| TC-24 | Longitud máxima de los campos | Máximo conocido (p. ej. 254 en email) | Escribir máximo y máximo+1 caracteres | 254 y 255 | Acepta el máximo; rechaza el máximo+1 | Baja |
| TC-25 | Atrás tras cerrar sesión | Sesión iniciada | Cerrar sesión y pulsar Atrás en el navegador | — | No muestra la página privada; pide login | Alta |
| TC-26 | Cookie de sesión protegida | Sesión iniciada | Revisar la cookie en DevTools > Application | — | Tiene `HttpOnly` y `Secure` | Media |
| TC-27 | No se puede copiar la contraseña | — | Seleccionar el campo contraseña y copiar | — | No se copia | Baja |
| TC-28 | Errores no dependen solo del color | — | Provocar un error | — | Hay texto o icono, no solo borde rojo | Baja |
| TC-29 | Gestor de contraseñas | Contraseña guardada en el navegador | Abrir el login | — | Autocompleta email y contraseña | Baja |
| TC-30 | Teclado de email en móvil | Móvil | Tocar el campo email | — | Aparece el teclado con `@` | Baja |
| TC-31 | Girar la pantalla | Móvil, datos escritos | Girar a horizontal y volver | — | No se pierden los datos | Media |
| TC-32 | Sin red al enviar | — | Cortar la red y pulsar Iniciar sesión | Credenciales válidas | Mensaje de error claro y se puede reintentar | Alta |
| TC-33 | Navegadores y sistemas | — | Repetir TC-01 en Chrome, Firefox, Safari, Edge, Android e iOS | — | Mismo comportamiento | Media |

> TC-23 a TC-33 vienen de la solución oficial. Prioridades corregidas tras la revisión: TC-03 y TC-04 pasan a **Alta** (probar que *no* se entra pesa tanto como probar que sí) y TC-21 pasa a **Media** (accesibilidad, igual que el teclado).

## Los 5 que automatizaría primero (y por qué)

### Mi primera elección

1. **TC-01 Login correcto:** es la base de todos los demás tests; si falla, no funciona nada.
2. **TC-16 Recuperar contraseña:** es la vía para que el usuario vuelva a entrar, y comprobar que el mensaje es el mismo exista o no el email es fácil y estable.
3. **TC-10 Bloqueo tras 5 intentos:** protege contra ataques de fuerza bruta y es repetitivo de probar a mano.
4. **TC-17 Inyección SQL:** riesgo de seguridad crítico y barato de comprobar en cada versión.
5. **TC-18 XSS:** igual que el anterior.

### Revisión

- **TC-01:** acierto total. Es el *smoke test*: si falla, no funciona nada.
- **TC-10:** bien, pero cada ejecución deja la cuenta bloqueada. Hace falta un usuario nuevo por ejecución o desbloquearlo antes (por API o BD). TC-12 (15 min) **no** se automatiza esperando tiempo real.
- **TC-16:** vale comprobando el mensaje en pantalla. El flujo completo (leer el email recibido) necesita un buzón de pruebas y es más frágil.
- **TC-17 y TC-18:** la solución los deja fuera. Una o dos cadenas de ataque en la UI dan falsa seguridad; eso lo cubren herramientas como OWASP ZAP. Decirlo en la entrevista suma.
- **Lo que faltó:** credenciales incorrectas (TC-03/04, regresión crítica y barata) y campos vacíos (TC-07, estable).

### Elección final (la de la solución oficial)

1. **TC-01 Login correcto:** smoke test; base de todo.
2. **TC-03/TC-04 Credenciales incorrectas:** regresión crítica y además comprueba que no se filtra información.
3. **TC-07 Campos vacíos:** barato y estable.
4. **TC-10 Bloqueo tras 5 intentos:** regla de negocio y de seguridad que cuesta repetir a mano.
5. **TC-25 Atrás tras cerrar sesión:** seguridad de la sesión.

**Criterio para elegir qué automatizar:** se repite en cada versión + resultado estable + alto valor. Fuera: lo que depende de tiempo real, de la vista humana (visual, usabilidad) o de sistemas externos (email).

## Lecciones

- **Categorías primero, casos después:** una categoría es un cajón (funcional, límites, seguridad...); los casos van dentro.
- **Valores límite:** probar justo antes, en y justo después del límite (4, 5, 6 intentos; 14:59 y 15:00).
- **Preguntas al entrevistador:** cada frase del enunciado es un requisito incompleto; pregunta lo que no dice. 3 o 4 buenas preguntas puntúan.
- **Enumeración de usuarios:** el login y la recuperación deben responder igual exista o no el email.
- **La contraseña sí va en el body del POST:** lo que se comprueba es HTTPS, nunca en la URL, ni en respuestas, ni en logs, ni en `localStorage`.
- **Accesibilidad con teclado:** Tab mueve entre elementos, Enter envía, Espacio marca casillas; las flechas son para dentro de menús y grupos.
