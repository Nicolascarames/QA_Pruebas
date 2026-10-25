# 13 · Ejercicios de lógica de programación

| Área | Nivel | Tiempo recomendado | Herramientas |
| --- | --- | --- | --- |
| Código (SDET / automatización) | Básico–medio | 10–15 min cada uno | Python o JavaScript (la solución va en los dos) |

## Ejercicio

Es lo típico en un live coding para QA automation. Resuélvelos **sin buscar en internet** y explicando la complejidad:

1. **Invertir un string** sin usar `reverse()` ni `[::-1]`.
2. **Palíndromo:** `"Anita lava la tina"` → `true` (ignora espacios, mayúsculas y tildes).
3. **Primer carácter que no se repite:** `"aabbcdde"` → `"c"`.
4. **Contar las apariciones** de cada carácter: `"qa test"` → `{q:1, a:1, t:2, e:1, s:1}` (sin espacios).
5. **Quitar duplicados** manteniendo el orden: `[3,1,3,2,1]` → `[3,1,2]`.
6. **FizzBuzz** del 1 al 15.
7. **Anagramas:** `"listen"` y `"silent"` → `true`.
8. **El segundo número más grande** de una lista: `[5, 1, 5, 3]` → `3`.
9. **Validar un email** con una expresión regular sencilla.
10. **(Típico de QA)** Dado un JSON de respuesta de API, devuelve los usuarios activos ordenados por edad.

**Extra:** escribe tests unitarios para el ejercicio 2, con casos límite.

## Consejos

- **Habla mientras programas.** Pregunta: ¿se distinguen mayúsculas? ¿qué pasa con la cadena vacía? ¿y con `null`?
- Primero que funcione, luego que sea limpio y luego que sea eficiente.
- Di la complejidad: «O(n) en tiempo y O(n) en memoria porque uso un diccionario».
- Prueba tu propio código con casos límite (vacío, un elemento, todos iguales, negativos). Eres QA: se espera que lo hagas.

## Solución (Python)

```python
import re
import unicodedata
from collections import Counter


# 1. Invertir un string  — O(n)
def reverse(s: str) -> str:
    out = []
    for ch in s:
        out.insert(0, ch)       # simple; con índice desde el final evitas el O(n²) de insert
    return "".join(out)

def reverse_fast(s: str) -> str:
    return "".join(s[i] for i in range(len(s) - 1, -1, -1))


# 2. Palíndromo — O(n)
def _normalize(s: str) -> str:
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")  # quita tildes
    return "".join(c for c in s if c.isalnum())

def is_palindrome(s: str) -> bool:
    clean = _normalize(s)
    i, j = 0, len(clean) - 1
    while i < j:
        if clean[i] != clean[j]:
            return False
        i, j = i + 1, j - 1
    return True


# 3. Primer carácter no repetido — O(n)
def first_unique(s: str):
    counts = Counter(s)
    return next((c for c in s if counts[c] == 1), None)


# 4. Contar caracteres
def count_chars(s: str) -> dict:
    result = {}
    for c in s:
        if c != " ":
            result[c] = result.get(c, 0) + 1
    return result


# 5. Quitar duplicados manteniendo el orden — O(n)
def dedupe(items: list) -> list:
    seen, out = set(), []
    for x in items:
        if x not in seen:
            seen.add(x)
            out.append(x)
    return out
    # una línea: list(dict.fromkeys(items))


# 6. FizzBuzz
def fizzbuzz(n: int) -> list:
    out = []
    for i in range(1, n + 1):
        if i % 15 == 0:
            out.append("FizzBuzz")
        elif i % 3 == 0:
            out.append("Fizz")
        elif i % 5 == 0:
            out.append("Buzz")
        else:
            out.append(str(i))
    return out


# 7. Anagramas — O(n)
def is_anagram(a: str, b: str) -> bool:
    return Counter(a.replace(" ", "").lower()) == Counter(b.replace(" ", "").lower())


# 8. Segundo más grande — O(n)
def second_largest(nums: list):
    first = second = None
    for n in nums:
        if first is None or n > first:
            first, second = n, first
        elif n != first and (second is None or n > second):
            second = n
    return second   # None si no existe


# 9. Email (validación básica, no RFC completa)
EMAIL_RE = re.compile(r"^[\w.+-]+@[\w-]+(\.[\w-]+)*\.[a-zA-Z]{2,}$")

def is_valid_email(email: str) -> bool:
    return bool(EMAIL_RE.match(email or ""))


# 10. Usuarios activos ordenados por edad
def active_users_by_age(payload: dict) -> list[str]:
    users = payload.get("data", [])
    active = [u for u in users if u.get("active")]
    return [u["name"] for u in sorted(active, key=lambda u: u["age"])]

# payload = {"data": [{"name":"Ana","age":30,"active":True},
#                     {"name":"Luis","age":22,"active":False},
#                     {"name":"Eva","age":25,"active":True}]}
# → ["Eva", "Ana"]
```

### Extra: tests del palíndromo (pytest)

```python
import pytest

@pytest.mark.parametrize("text,expected", [
    ("Anita lava la tina", True),
    ("Dábale arroz a la zorra el abad", True),   # tildes
    ("A man, a plan, a canal: Panama", True),    # puntuación
    ("qa", False),
    ("", True),                                   # vacío: decisión a acordar
    ("a", True),
    ("12321", True),
    ("123 21", True),
])
def test_is_palindrome(text, expected):
    assert is_palindrome(text) is expected
```

## Solución (JavaScript)

```javascript
const reverse = (s) => { let r = ''; for (const c of s) r = c + r; return r; };

const normalize = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
const isPalindrome = (s) => { const c = normalize(s); return c === [...c].reverse().join(''); };

const firstUnique = (s) => {
  const m = new Map();
  for (const c of s) m.set(c, (m.get(c) || 0) + 1);
  for (const c of s) if (m.get(c) === 1) return c;
  return null;
};

const countChars = (s) =>
  [...s].filter((c) => c !== ' ').reduce((acc, c) => ({ ...acc, [c]: (acc[c] || 0) + 1 }), {});

const dedupe = (arr) => [...new Set(arr)];

const fizzbuzz = (n) =>
  Array.from({ length: n }, (_, i) => {
    const x = i + 1;
    return x % 15 === 0 ? 'FizzBuzz' : x % 3 === 0 ? 'Fizz' : x % 5 === 0 ? 'Buzz' : String(x);
  });

const isAnagram = (a, b) => {
  const k = (s) => [...s.replace(/\s/g, '').toLowerCase()].sort().join('');
  return k(a) === k(b);
};

const secondLargest = (nums) => {
  const u = [...new Set(nums)].sort((a, b) => b - a);
  return u.length > 1 ? u[1] : null;
};

const isValidEmail = (e) => /^[\w.+-]+@[\w-]+(\.[\w-]+)*\.[a-zA-Z]{2,}$/.test(e ?? '');

const activeUsersByAge = (p) =>
  (p.data ?? []).filter((u) => u.active).sort((a, b) => a.age - b.age).map((u) => u.name);
```

### Casos límite que debes mencionar
- Cadena vacía, `null` / `None`.
- Un solo elemento; todos los elementos iguales (`[5,5,5]` → no hay segundo mayor).
- Mayúsculas, tildes, emojis (caracteres de varios bytes).
- Listas con negativos o enormes (rendimiento).
