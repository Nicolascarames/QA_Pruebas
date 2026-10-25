# 12 · Casos de prueba específicos de móvil

| Área | Nivel | Tiempo recomendado | Herramientas |
| --- | --- | --- | --- |
| QA manual móvil | Medio | 30 min | Papel / móvil propio |

## Ejercicio

> «Tenemos una app nativa de **pedidos de comida** (Android e iOS). El flujo principal es: buscar restaurante → añadir platos → pagar con tarjeta → seguir el pedido en un mapa en tiempo real con notificaciones push.
>
> Sin repetir lo que harías en web, ¿qué pruebas **específicas de móvil** harías?»

Organízalas por categorías y marca cuáles automatizarías.

## Consejos

- Al entrevistador le interesa lo que **no existe en web**: interrupciones, red, permisos, ciclo de vida de la app, hardware, batería, instalación y actualización, distintas pantallas y versiones de SO, push y deep links.
- Piensa en el **contexto real** del usuario: va por la calle, en el metro sin cobertura, con el 5 % de batería y le entra una llamada justo al pagar.
- Menciona herramientas: Android Studio Profiler y Xcode Instruments (rendimiento), Charles o Proxyman (red y certificados), el *Network Link Conditioner* (iOS) y el throttling del emulador, y granjas como BrowserStack o Firebase Test Lab.

## Solución

### 1. Interrupciones
| Caso | Esperado |
| --- | --- |
| Llamada entrante durante el pago | Al volver, el pago sigue en su estado; no hay cobro doble |
| Notificación de otra app con el pedido a medias | No se pierde el carrito |
| Alarma o temporizador, Siri / Google Assistant | La app se reanuda correctamente |
| Bloquear y desbloquear la pantalla en el checkout | Se mantiene el estado (o pide otra vez la autenticación si es lo que define el requisito) |
| Enchufar o desenchufar los auriculares, conectar Bluetooth | No se cierra la app |

### 2. Red
| Caso | Esperado |
| --- | --- |
| Modo avión al pulsar «Pagar» | Mensaje claro y reintento seguro (idempotente) |
| Cambio de WiFi a 4G a mitad del seguimiento | El mapa sigue actualizándose |
| Red 2G o lenta (throttling) | Indicadores de carga y timeouts razonables, sin bloqueos |
| Sin red al abrir la app | Pantalla offline o datos en caché, sin crash |
| Proxy con certificado no confiable | La app lo rechaza (certificate pinning) |

### 3. Permisos
| Caso | Esperado |
| --- | --- |
| Denegar la ubicación | Se puede introducir la dirección a mano |
| Conceder «solo mientras se usa» | El seguimiento funciona en primer plano |
| Revocar la ubicación desde Ajustes con la app abierta | Se detecta al volver y no hay crash |
| Denegar las notificaciones (Android 13+ / iOS) | La app avisa del estado del pedido dentro de la app |
| «Permitir una vez» (iOS) | Lo vuelve a pedir en la siguiente sesión |

### 4. Ciclo de vida de la app
| Caso | Esperado |
| --- | --- |
| Mandar la app a segundo plano 30 min y volver | La sesión y el pedido se mantienen o se refrescan |
| El SO mata la app por falta de memoria («No conservar actividades» en las opciones de desarrollador de Android) | Al reabrirla se restaura el estado |
| Girar la pantalla en cada paso | No se pierden datos ni hay crash |
| Pantalla dividida / multiventana (Android) | El diseño se adapta |

### 5. Pantallas, SO y dispositivos
| Caso | Esperado |
| --- | --- |
| Pantalla pequeña (iPhone SE) y grande (tablet) | No hay textos cortados y los botones se pueden pulsar |
| Notch / Dynamic Island / pantalla plegable | El contenido no queda tapado |
| Tamaño de letra máximo del sistema | Los textos crecen y no se rompe el diseño |
| Modo oscuro | Colores con contraste correcto |
| Versión de SO mínima soportada y la última | Funciona en ambas |
| Fabricantes con capas propias (Samsung, Xiaomi) | Push y segundo plano funcionan (Xiaomi suele matar los procesos) |

### 6. Push y deep links
| Caso | Esperado |
| --- | --- |
| Push «Tu pedido está en camino» con la app cerrada, en segundo plano y abierta | Llega en los 3 casos; al pulsarla abre el seguimiento |
| Deep link `app://pedido/123` con la sesión iniciada y sin ella | Abre el pedido, o el login y luego el pedido |
| Universal link / App Link desde un email | Abre la app (o la tienda si no está instalada) |

### 7. Hardware, batería y rendimiento
| Caso | Esperado |
| --- | --- |
| Modo ahorro de batería | El seguimiento sigue (quizá con menos frecuencia) |
| Consumo de batería con el mapa 30 min | Dentro de un umbral razonable (medido con Profiler / Instruments) |
| Uso de memoria y CPU | Sin fugas tras 20 navegaciones |
| Arranque en frío | Menos de X s (requisito) |
| Pago con Face ID / huella / Google Pay | Funciona y tiene una alternativa si falla |

### 8. Instalación y actualización
| Caso | Esperado |
| --- | --- |
| Instalación limpia | El onboarding aparece |
| Actualizar de la versión N-1 a la N | Se conservan la sesión, las direcciones y los favoritos (migración de datos) |
| Poco almacenamiento libre | Error controlado |
| Desinstalar y reinstalar | No quedan datos sensibles en el dispositivo |
| Forzar una actualización obligatoria (versión mínima) | Pantalla de bloqueo con enlace a la tienda |

### 9. Accesibilidad móvil
- TalkBack y VoiceOver en todo el flujo de compra.
- Zonas táctiles de al menos 44×44 pt (iOS) / 48×48 dp (Android).

### Qué automatizaría
- **Sí:** login, flujo de compra, permisos (Appium permite aceptarlos y denegarlos con `autoGrantPermissions` o `mobile: changePermissions`), rotación, red (emulador: `driver.set_network_connection`), deep links (`mobile: deepLink`), segundo plano (`driver.background_app(5)`).
- **Manual o con herramientas específicas:** llamadas reales, batería y consumo, fabricantes concretos, sensación de fluidez y accesibilidad completa con lector de pantalla.
