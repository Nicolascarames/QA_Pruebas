# 01 · Casos de prueba de un login

| Área | Nivel | Tiempo recomendado | Herramientas |
| --- | --- | --- | --- |
| QA manual | Básico–medio | 20–30 min | Papel, Excel o la herramienta que uses |

## Ejercicio

Te enseñan esta pantalla de login de una app (web y móvil):

- Campo **Email**
- Campo **Contraseña** (con un botón de ojo para mostrar u ocultar)
- Casilla **Recordarme**
- Botón **Iniciar sesión**
- Enlace **¿Has olvidado tu contraseña?**
- Tras **5 intentos fallidos**, la cuenta se bloquea 15 minutos.

**Tarea:** escribe todos los casos de prueba que se te ocurran. Para cada uno pon ID, título, precondiciones, pasos, datos, resultado esperado y prioridad. Luego elige los **5 que automatizarías primero** y explica por qué.

## Consejos

- No te limites al camino feliz. El entrevistador mira sobre todo si cubres casos **negativos, de límite, de seguridad, de usabilidad y de accesibilidad**.
- Empieza por organizar en categorías y luego rellena. Así se nota el método.
- Si el enunciado deja algo abierto (longitud máxima, ¿se diferencian mayúsculas en el email?), **pregúntalo** o apunta la suposición. Hacer preguntas puntúa.
- Prioriza: no todos los casos valen lo mismo. Marca Alta, Media o Baja.
- Para automatizar, elige casos estables, repetitivos y de alto valor (smoke y regresión). Deja fuera los visuales o de usabilidad subjetiva.

## Solución

### Categorías y casos

**Funcionales (camino feliz)**

| ID | Caso | Resultado esperado | Prioridad |
| --- | --- | --- | --- |
| TC01 | Login con email y contraseña válidos | Entra y redirige a la home | Alta |
| TC02 | Login con «Recordarme» marcado, cerrar y reabrir el navegador o la app | Sigue con la sesión iniciada | Media |
| TC03 | Login sin «Recordarme», cerrar y reabrir | Pide login otra vez | Media |
| TC04 | Enviar con la tecla Enter | Igual que pulsar el botón | Media |
| TC05 | Botón del ojo | Muestra y oculta la contraseña | Baja |
| TC06 | Enlace «¿Has olvidado tu contraseña?» | Navega al flujo de recuperación | Alta |

**Negativos**

| ID | Caso | Resultado esperado | Prioridad |
| --- | --- | --- | --- |
| TC07 | Email correcto y contraseña incorrecta | Mensaje genérico de error; no entra | Alta |
| TC08 | Email no registrado | **El mismo** mensaje genérico (no revela si el email existe) | Alta |
| TC09 | Ambos campos vacíos | Botón deshabilitado o validación en los dos campos | Alta |
| TC10 | Solo email vacío / solo contraseña vacía | Validación en el campo vacío | Media |
| TC11 | Email con formato inválido (`nico@`, `nico.com`, `@x.com`) | Error de formato antes de enviar | Media |
| TC12 | Espacios al principio o al final del email | Se recortan (o se rechazan, según el requisito) | Media |
| TC13 | Email en mayúsculas (`NICO@MAIL.COM`) | Se trata igual que en minúsculas | Media |
| TC14 | Contraseña con mayúsculas cambiadas | Rechazada: la contraseña distingue mayúsculas | Media |

**Límites y bloqueo**

| ID | Caso | Resultado esperado | Prioridad |
| --- | --- | --- | --- |
| TC15 | 4 intentos fallidos y luego el correcto | Entra; el contador se reinicia | Alta |
| TC16 | 5 intentos fallidos | Cuenta bloqueada con un mensaje claro | Alta |
| TC17 | Intentar entrar bloqueado, con la contraseña correcta | Sigue bloqueada | Alta |
| TC18 | A los 14:59 min y a los 15:00 min del bloqueo | Bloqueada / desbloqueada | Media |
| TC19 | Longitud máxima de los campos (p. ej. 254 caracteres de email) | Se acepta el máximo y se rechaza el máximo + 1 | Baja |

**Seguridad**

| ID | Caso | Resultado esperado | Prioridad |
| --- | --- | --- | --- |
| TC20 | Inyección SQL en los campos (`' OR '1'='1`) | No entra y no aparece un error de la BD | Alta |
| TC21 | XSS en el email (`<script>alert(1)</script>`) | No se ejecuta | Alta |
| TC22 | La contraseña viaja por HTTPS y no aparece en la URL ni en los logs | Correcto | Alta |
| TC23 | Botón «atrás» tras cerrar sesión | No vuelve a una página privada | Alta |
| TC24 | Copiar del campo contraseña | No se permite copiar | Baja |
| TC25 | Cookie de sesión con `HttpOnly` y `Secure` | Activadas | Media |

**Usabilidad y accesibilidad**

| ID | Caso | Resultado esperado | Prioridad |
| --- | --- | --- | --- |
| TC26 | Navegar solo con el tabulador | El orden es lógico: email → contraseña → recordarme → botón | Media |
| TC27 | Lector de pantalla (NVDA / VoiceOver / TalkBack) | Los campos tienen etiquetas leíbles | Media |
| TC28 | Los mensajes de error no dependen solo del color | Correcto | Baja |
| TC29 | Autocompletado del gestor de contraseñas | Funciona | Baja |

**Móvil y compatibilidad**

| ID | Caso | Resultado esperado | Prioridad |
| --- | --- | --- | --- |
| TC30 | Teclado de tipo email en el campo email | Aparece `@` en el teclado | Baja |
| TC31 | Girar la pantalla con los datos escritos | No se pierden los datos | Media |
| TC32 | Perder la red al pulsar «Iniciar sesión» | Mensaje de error y se puede reintentar | Alta |
| TC33 | Chrome, Firefox, Safari y Edge; Android e iOS | Mismo comportamiento | Media |

### Ejemplo de caso bien redactado

```
ID: TC16
Título: La cuenta se bloquea tras 5 intentos fallidos
Precondiciones: existe el usuario test@mail.com con contraseña Valid123!, sin bloquear
Pasos:
  1. Abrir /login
  2. Introducir test@mail.com y la contraseña "Mal1"
  3. Pulsar «Iniciar sesión»
  4. Repetir los pasos 2 y 3 cuatro veces más (5 intentos en total)
Resultado esperado: tras el 5.º intento aparece «Cuenta bloqueada durante 15 minutos»
                    y el login con la contraseña correcta también se rechaza
Prioridad: Alta
```

### Los 5 que automatizaría primero
1. **TC01 – Login válido:** es el smoke test; si falla, no funciona nada.
2. **TC07/TC08 – Credenciales inválidas:** regresión crítica y además comprueba que no se filtre información.
3. **TC09 – Campos vacíos:** barato y estable.
4. **TC16 – Bloqueo tras 5 intentos:** regla de negocio y de seguridad que cuesta repetir a mano.
5. **TC23 – No volver atrás tras cerrar sesión:** seguridad de sesión.

Lo visual y la accesibilidad con lector de pantalla los dejaría manuales, o los cubriría con herramientas específicas (axe, regresión visual).
