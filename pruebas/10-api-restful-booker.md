# 10 · CRUD de API en Restful-Booker

| Área | Nivel | Tiempo recomendado | Herramientas |
| --- | --- | --- | --- |
| Testing de API | Medio | 1–2 h | Python + pytest + requests (alternativas: Postman/Newman, REST Assured, Playwright `request`) |

## Ejercicio

La API pública **https://restful-booker.herokuapp.com** ([documentación](https://restful-booker.herokuapp.com/apidoc/index.html)) gestiona reservas de hotel.

Automatiza:
1. **Autenticación:** `POST /auth` con `admin` / `password123` → obtener el token.
2. **Crear** una reserva (`POST /booking`) y comprobar el código de estado, que la respuesta trae `bookingid` y que los datos coinciden.
3. **Leer** la reserva (`GET /booking/{id}`).
4. **Actualizar** entera (`PUT`) y parcialmente (`PATCH`) usando el token.
5. **Borrar** (`DELETE`) y comprobar que después el `GET` devuelve 404.
6. **Casos negativos:** `PUT` sin token, `GET` de un id inexistente y `POST` con un body incompleto.
7. **Extra:** validar el **esquema JSON** y el **tiempo de respuesta** (menos de 2 s).

## Consejos

- Cada test debe **crear sus propios datos** (con una fixture) y, si puede, borrarlos al final. No dependas de que exista el id 1.
- Comprueba más que el `200`: la **cabecera Content-Type**, el **cuerpo**, el **esquema** y los **tipos**.
- Restful-Booker tiene peculiaridades **a propósito**: `DELETE` devuelve `201 Created` y un body incompleto da `500`. En la entrevista, **señálalas como bugs** de diseño de la API, no te limites a aceptarlas.
- El token va en una cabecera `Cookie: token=<valor>` (o `Authorization: Basic` con admin:password123).
- Separa el **cliente de la API** (una clase con métodos `create_booking()`, …) de los tests. Es el equivalente del POM en API.
- Ojo: es una API pública que se reinicia de vez en cuando. Si falla, puede que no sea culpa tuya.

## Solución

### Instalación

```bash
pip install pytest requests jsonschema
```

### `api_client.py`

```python
import requests

BASE_URL = "https://restful-booker.herokuapp.com"


class BookingClient:
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json",
                                     "Accept": "application/json"})

    def auth(self, username="admin", password="password123") -> str:
        r = self.session.post(f"{self.base_url}/auth",
                              json={"username": username, "password": password})
        r.raise_for_status()
        return r.json()["token"]

    def create(self, booking: dict):
        return self.session.post(f"{self.base_url}/booking", json=booking)

    def get(self, booking_id: int):
        return self.session.get(f"{self.base_url}/booking/{booking_id}")

    def update(self, booking_id: int, booking: dict, token: str | None):
        headers = {"Cookie": f"token={token}"} if token else {}
        return self.session.put(f"{self.base_url}/booking/{booking_id}",
                                json=booking, headers=headers)

    def patch(self, booking_id: int, data: dict, token: str):
        return self.session.patch(f"{self.base_url}/booking/{booking_id}",
                                  json=data, headers={"Cookie": f"token={token}"})

    def delete(self, booking_id: int, token: str):
        return self.session.delete(f"{self.base_url}/booking/{booking_id}",
                                   headers={"Cookie": f"token={token}"})
```

### `conftest.py`

```python
import pytest

from api_client import BookingClient


@pytest.fixture(scope="session")
def client():
    return BookingClient()


@pytest.fixture(scope="session")
def token(client):
    return client.auth()


@pytest.fixture
def booking_data():
    return {
        "firstname": "Nico",
        "lastname": "Carames",
        "totalprice": 150,
        "depositpaid": True,
        "bookingdates": {"checkin": "2026-11-01", "checkout": "2026-11-05"},
        "additionalneeds": "Breakfast",
    }


@pytest.fixture
def booking(client, token, booking_data):
    """Crea una reserva para el test y la borra al terminar."""
    r = client.create(booking_data)
    assert r.status_code == 200
    booking_id = r.json()["bookingid"]
    yield booking_id, booking_data
    client.delete(booking_id, token)
```

### `test_booking.py`

```python
from jsonschema import validate

BOOKING_SCHEMA = {
    "type": "object",
    "required": ["firstname", "lastname", "totalprice", "depositpaid", "bookingdates"],
    "properties": {
        "firstname": {"type": "string"},
        "lastname": {"type": "string"},
        "totalprice": {"type": "integer"},
        "depositpaid": {"type": "boolean"},
        "bookingdates": {
            "type": "object",
            "required": ["checkin", "checkout"],
            "properties": {
                "checkin": {"type": "string", "format": "date"},
                "checkout": {"type": "string", "format": "date"},
            },
        },
        "additionalneeds": {"type": "string"},
    },
}


def test_auth_returns_token(client):
    assert len(client.auth()) > 0


def test_create_booking(client, booking_data):
    r = client.create(booking_data)
    assert r.status_code == 200
    assert r.headers["Content-Type"].startswith("application/json")
    body = r.json()
    assert isinstance(body["bookingid"], int)
    assert body["booking"] == booking_data
    assert r.elapsed.total_seconds() < 2


def test_get_booking_matches_schema(client, booking):
    booking_id, data = booking
    r = client.get(booking_id)
    assert r.status_code == 200
    validate(instance=r.json(), schema=BOOKING_SCHEMA)
    assert r.json()["firstname"] == data["firstname"]


def test_update_booking(client, token, booking):
    booking_id, data = booking
    updated = {**data, "firstname": "Nicolas", "totalprice": 200}
    r = client.update(booking_id, updated, token)
    assert r.status_code == 200
    assert r.json() == updated
    assert client.get(booking_id).json()["totalprice"] == 200


def test_patch_booking(client, token, booking):
    booking_id, _ = booking
    r = client.patch(booking_id, {"additionalneeds": "Late checkout"}, token)
    assert r.status_code == 200
    assert r.json()["additionalneeds"] == "Late checkout"


def test_delete_booking(client, token, booking_data):
    booking_id = client.create(booking_data).json()["bookingid"]
    r = client.delete(booking_id, token)
    # Peculiaridad de la API: devuelve 201. Lo correcto según REST sería 200 o 204.
    assert r.status_code == 201
    assert client.get(booking_id).status_code == 404


# ---------- Negativos ----------

def test_update_without_token_is_forbidden(client, booking):
    booking_id, data = booking
    r = client.update(booking_id, data, token=None)
    assert r.status_code == 403


def test_get_nonexistent_booking(client):
    assert client.get(999999999).status_code == 404


def test_create_with_missing_fields(client):
    r = client.create({"firstname": "Solo nombre"})
    # La API devuelve 500; lo correcto sería 400 Bad Request → reportarlo como bug
    assert r.status_code in (400, 500)


def test_auth_with_bad_credentials(client):
    r = client.session.post(f"{client.base_url}/auth",
                            json={"username": "admin", "password": "mala"})
    assert r.status_code == 200          # otra peculiaridad: no devuelve 401
    assert r.json().get("reason") == "Bad credentials"
```

### Ejecutar

```bash
pytest -v
```

### Lo mismo en Postman (pestaña *Tests* / *Scripts*)

```javascript
pm.test("Status 200", () => pm.response.to.have.status(200));
pm.test("Tiene bookingid", () => {
  const body = pm.response.json();
  pm.expect(body.bookingid).to.be.a("number");
  pm.collectionVariables.set("bookingId", body.bookingid);
});
pm.test("Responde en < 2 s", () => pm.expect(pm.response.responseTime).to.be.below(2000));
```

Ejecución en CI: `newman run coleccion.json -e entorno.json -r cli,htmlextra`.

### Bugs de la API que conviene mencionar
| Comportamiento | Lo esperado según REST |
| --- | --- |
| `DELETE` → 201 | 200 o 204 |
| Body incompleto → 500 | 400 con un mensaje de validación |
| Credenciales incorrectas → 200 con `reason` | 401 |
| `PUT` sin token → 403 | 401 (no autenticado) |
