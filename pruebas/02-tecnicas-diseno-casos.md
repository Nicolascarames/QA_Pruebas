# 02 · Partición de equivalencia y valores límite

| Área | Nivel | Tiempo recomendado | Herramientas |
| --- | --- | --- | --- |
| QA manual (ISTQB) | Básico–medio | 20 min | Ninguna |

## Ejercicio

Una tienda online aplica descuentos según la **edad** del cliente, un campo numérico entero:

| Edad | Descuento |
| --- | --- |
| Menos de 0 o más de 120 | Error «Edad no válida» |
| 0 a 17 | No puede comprar (menor) |
| 18 a 25 | 15 % |
| 26 a 64 | 0 % |
| 65 a 120 | 30 % |

**Tareas:**
1. Identifica las **particiones de equivalencia** (válidas e inválidas).
2. Aplica **análisis de valores límite** (2 valores por límite).
3. Añade los casos de entradas no numéricas.
4. **Extra:** el descuento de 65+ solo se aplica si además el cliente es socio. Haz la **tabla de decisión**.

## Consejos

- **Partición de equivalencia:** se divide la entrada en grupos que el sistema debería tratar igual; basta un valor por grupo.
- **Valores límite:** los fallos se concentran en los bordes (`<` frente a `<=`). Con 2 valores por límite se prueba el borde y el valor inmediatamente fuera; con 3 valores, también el de dentro.
- No olvides las particiones **inválidas** (negativos, decimales, texto, vacío).
- Di en voz alta qué técnica usas y por qué. Los entrevistadores con base ISTQB lo valoran.

## Solución

### 1. Particiones de equivalencia

| Partición | Rango | Tipo | Valor representativo | Esperado |
| --- | --- | --- | --- | --- |
| P1 | < 0 | Inválida | -5 | Error |
| P2 | 0–17 | Válida | 10 | No puede comprar |
| P3 | 18–25 | Válida | 20 | 15 % |
| P4 | 26–64 | Válida | 40 | 0 % |
| P5 | 65–120 | Válida | 80 | 30 % |
| P6 | > 120 | Inválida | 150 | Error |

### 2. Valores límite (2 valores por límite)

| Límite | Valores | Esperado |
| --- | --- | --- |
| Entre P1 y P2 | -1, 0 | Error / menor |
| Entre P2 y P3 | 17, 18 | Menor / 15 % |
| Entre P3 y P4 | 25, 26 | 15 % / 0 % |
| Entre P4 y P5 | 64, 65 | 0 % / 30 % |
| Entre P5 y P6 | 120, 121 | 30 % / Error |

Total: **10 casos de límite**, que ya cubren las 6 particiones.

### 3. Entradas no numéricas

| Entrada | Esperado |
| --- | --- |
| Vacío | «Campo obligatorio» |
| `abc` | Error de formato |
| `25.5` | Error (debe ser entero) o redondeo, según el requisito; si no está claro, **pregunta** |
| `  30  ` | Se recortan los espacios y se acepta, o error, según el requisito |
| `-0` | Se trata como 0 |
| `9999999999999` | Error controlado, sin desbordamiento |
| `1e2` | Error (o 100, según el parser; pregunta) |

### 4. Tabla de decisión (65+ y socio)

| Regla | R1 | R2 | R3 | R4 |
| --- | --- | --- | --- | --- |
| Edad ≥ 65 | S | S | N | N |
| Es socio | S | N | S | N |
| **Descuento 30 %** | **Sí** | No | No | No |

Son 4 combinaciones, así que 4 casos. Se combina con el límite: 64 y socio → no; 65 y socio → sí.

### Qué decir en la entrevista
> «Con partición de equivalencia reduzco las entradas a 6 grupos; con valores límite pruebo 10 valores en los bordes, que es donde suelen estar los fallos de `<` frente a `<=`. Añado las entradas no numéricas y una tabla de decisión para la condición combinada. Con unos 20 casos tengo una cobertura alta.»
