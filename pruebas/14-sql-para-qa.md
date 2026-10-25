# 14 · SQL para QA

| Área | Nivel | Tiempo recomendado | Herramientas |
| --- | --- | --- | --- |
| Validación de datos | Básico–medio | 30 min | Cualquier BD (SQLite online, DB Fiddle, PostgreSQL) |

## Ejercicio

Tienes estas tablas de una tienda:

```sql
CREATE TABLE customers (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100),
  country VARCHAR(50),
  created_at DATE
);

CREATE TABLE orders (
  id INT PRIMARY KEY,
  customer_id INT,
  total DECIMAL(10,2),
  status VARCHAR(20),     -- 'PAID', 'PENDING', 'CANCELLED'
  created_at DATE
);

INSERT INTO customers VALUES
 (1,'Ana','ana@mail.com','ES','2026-01-10'),
 (2,'Luis','luis@mail.com','ES','2026-02-15'),
 (3,'Eva','eva@mail.com','PT','2026-03-01'),
 (4,'Nico','ana@mail.com','ES','2026-03-20'),   -- email duplicado
 (5,'Sara',NULL,'FR','2026-04-05');             -- sin email

INSERT INTO orders VALUES
 (10,1,120.50,'PAID','2026-05-01'),
 (11,1,30.00,'CANCELLED','2026-05-03'),
 (12,2,75.00,'PAID','2026-05-04'),
 (13,3,200.00,'PENDING','2026-05-05'),
 (14,99,50.00,'PAID','2026-05-06'),             -- cliente inexistente (huérfano)
 (15,2,-10.00,'PAID','2026-05-07');             -- total negativo
```

Escribe las consultas para:
1. Clientes de España ordenados por fecha de alta.
2. Total facturado (solo `PAID`) por cliente, con su nombre.
3. Clientes que **no** tienen ningún pedido.
4. **Emails duplicados.**
5. **Pedidos huérfanos** (sin cliente asociado).
6. Pedidos con **datos inválidos** (total ≤ 0 o estado fuera de los permitidos).
7. Clientes con más de 1 pedido.
8. **Extra:** después de un test E2E que crea el pedido `id = 16`, ¿qué consulta usarías para comprobarlo en la BD?

## Consejos

- En QA el SQL sirve sobre todo para **validar datos**: duplicados, huérfanos, nulos, valores fuera de rango y que lo que muestra la UI coincide con la BD.
- `INNER JOIN` devuelve solo lo que coincide. `LEFT JOIN … WHERE b.id IS NULL` encuentra lo que **falta** en un lado.
- `WHERE` filtra filas **antes** de agrupar; `HAVING`, **después**.
- `NULL` no se compara con `=`, se usa `IS NULL`.
- **Nunca** ejecutes `UPDATE` ni `DELETE` sin `WHERE` en un entorno compartido. Trabaja dentro de transacciones.

## Solución

```sql
-- 1. Clientes de España por fecha de alta
SELECT id, name, created_at
FROM customers
WHERE country = 'ES'
ORDER BY created_at;

-- 2. Total facturado (PAID) por cliente
SELECT c.id, c.name, SUM(o.total) AS total_pagado
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE o.status = 'PAID'
GROUP BY c.id, c.name
ORDER BY total_pagado DESC;
-- Ojo: el pedido 15 (-10) resta. Es un dato inválido que el ejercicio 6 detecta.

-- 3. Clientes sin pedidos
SELECT c.id, c.name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL;
-- → Nico (4) y Sara (5)

-- 4. Emails duplicados
SELECT email, COUNT(*) AS veces
FROM customers
WHERE email IS NOT NULL
GROUP BY email
HAVING COUNT(*) > 1;
-- → ana@mail.com, 2

-- 5. Pedidos huérfanos
SELECT o.*
FROM orders o
LEFT JOIN customers c ON c.id = o.customer_id
WHERE c.id IS NULL;
-- → pedido 14 (customer_id 99). Señal de que falta una FOREIGN KEY.

-- 6. Pedidos con datos inválidos
SELECT *
FROM orders
WHERE total <= 0
   OR status NOT IN ('PAID', 'PENDING', 'CANCELLED')
   OR status IS NULL;
-- → pedido 15

-- 7. Clientes con más de 1 pedido
SELECT c.name, COUNT(o.id) AS pedidos
FROM customers c
JOIN orders o ON o.customer_id = c.id
GROUP BY c.id, c.name
HAVING COUNT(o.id) > 1;
-- → Ana (2), Luis (2)

-- 8. Verificar el pedido creado por el test E2E
SELECT o.id, o.total, o.status, c.email
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.id = 16;
-- Assert: existe 1 fila, total = el mostrado en la UI, status = 'PAID',
-- email = el usuario de prueba.
```

### Extra: clientes sin email (calidad de datos)
```sql
SELECT id, name FROM customers WHERE email IS NULL OR TRIM(email) = '';
```

### Hallazgos que deberías **reportar** con este dataset
| Hallazgo | Riesgo | Propuesta |
| --- | --- | --- |
| Email duplicado (ids 1 y 4) | Login ambiguo, notificaciones al cliente equivocado | `UNIQUE` en `email` |
| Pedido huérfano (14) | Informes descuadrados | `FOREIGN KEY` |
| Total negativo (15) | Facturación incorrecta | `CHECK (total > 0)` |
| Cliente sin email (5) | No puede recuperar la contraseña | `NOT NULL` o validación |

### Preguntas típicas
- **Diferencia entre `INNER`, `LEFT`, `RIGHT` y `FULL JOIN`:** filas que coinciden / todas las de la izquierda / todas las de la derecha / todas.
- **`DELETE`, `TRUNCATE` y `DROP`:** borra filas (se puede filtrar y deshacer en una transacción) / vacía la tabla / elimina la tabla.
- **¿Cómo preparas los datos de prueba?** Scripts de *seed* idempotentes, transacciones con rollback por test o contenedores de BD desechables (Testcontainers).
