# 04 · Escenarios Gherkin (BDD)

| Área | Nivel | Tiempo recomendado | Herramientas |
| --- | --- | --- | --- |
| QA manual / BDD | Básico–medio | 20–30 min | Editor de texto (Cucumber, SpecFlow o Behave para ejecutarlos) |

## Ejercicio

Esta es la historia de usuario:

> **Como** cliente registrado
> **quiero** aplicar un código de descuento en el carrito
> **para** pagar menos en mi pedido.
>
> **Criterios de aceptación**
> - El código `VERANO10` aplica un 10 % de descuento.
> - Un código caducado muestra «El código ha caducado».
> - Un código inexistente muestra «Código no válido».
> - Solo se puede aplicar un código por pedido.
> - El descuento no se aplica si el subtotal es menor de 20 €.

**Tarea:** escribe el fichero `.feature` en Gherkin cubriendo todos los criterios. Usa `Background` y `Scenario Outline` donde tenga sentido.

## Consejos

- **Given** = estado inicial, **When** = una sola acción, **Then** = resultado observable.
- Escribe en lenguaje de **negocio**, no de interfaz. «Cuando aplico el código VERANO10» es mejor que «Cuando hago clic en el input #coupon y pulso el botón azul».
- Un `When` por escenario. Si necesitas varios, seguramente son dos escenarios.
- Usa `Scenario Outline` + `Examples` cuando cambian solo los datos.
- Usa `Background` para los pasos comunes a todos los escenarios.
- Gherkin funciona en español con `# language: es` (Característica, Escenario, Dado, Cuando, Entonces). Pregunta qué idioma usa el equipo.

## Solución

```gherkin
# language: es
Característica: Aplicar código de descuento en el carrito
  Como cliente registrado
  quiero aplicar un código de descuento
  para pagar menos en mi pedido

  Antecedentes:
    Dado que he iniciado sesión como cliente registrado

  Escenario: Aplicar un código válido con subtotal suficiente
    Dado que mi carrito tiene un subtotal de 50,00 €
    Cuando aplico el código "VERANO10"
    Entonces veo un descuento de 5,00 €
    Y el total del pedido es 45,00 €

  Esquema del escenario: Códigos que no se pueden aplicar
    Dado que mi carrito tiene un subtotal de 50,00 €
    Cuando aplico el código "<codigo>"
    Entonces veo el mensaje "<mensaje>"
    Y el total del pedido sigue siendo 50,00 €

    Ejemplos:
      | codigo     | mensaje                    |
      | INVIERNO05 | El código ha caducado      |
      | NOEXISTE   | Código no válido           |
      |            | Introduce un código        |

  Esquema del escenario: Subtotal mínimo de 20 €
    Dado que mi carrito tiene un subtotal de <subtotal> €
    Cuando aplico el código "VERANO10"
    Entonces el descuento aplicado es de <descuento> €

    Ejemplos:
      | subtotal | descuento |
      | 19,99    | 0,00      |
      | 20,00    | 2,00      |
      | 20,01    | 2,00      |

  Escenario: No se puede aplicar un segundo código
    Dado que mi carrito tiene un subtotal de 50,00 €
    Y ya he aplicado el código "VERANO10"
    Cuando aplico el código "OTRO15"
    Entonces veo el mensaje "Solo se puede aplicar un código por pedido"
    Y el descuento aplicado sigue siendo de 5,00 €
```

### Por qué esta solución puntúa bien
- `Antecedentes` evita repetir el login en cada escenario.
- Los valores límite (19,99 / 20,00 / 20,01) aparecen en los `Ejemplos`, combinando BDD con la técnica de la prueba 02.
- Añade un caso que el requisito no cubría: el **código vacío**. Coméntalo como pregunta al Product Owner: «¿qué mensaje queréis aquí?».
- Cada `Entonces` es verificable con un assert.
- **Ambigüedad que conviene señalar:** ¿el 2,00 € con subtotal de 20,01 se redondea o es 2,001? Pregunta por el redondeo.

### Equivalente en inglés (por si el equipo lo usa)
`Feature / Background / Scenario / Scenario Outline / Examples / Given / When / Then / And`.
