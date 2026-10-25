# 08 · Arreglar un test flaky (live coding)

| Área | Nivel | Tiempo recomendado | Herramientas |
| --- | --- | --- | --- |
| Automatización web | Medio–avanzado | 30–45 min | Selenium + pytest (la idea vale para cualquier framework) |

## Ejercicio

El entrevistador te enseña este test y te dice: *«Falla en CI más o menos 1 de cada 5 veces y en local casi nunca. Encuentra todos los problemas, explícalos y reescríbelo».*

```python
import time
from selenium import webdriver
from selenium.webdriver.common.by import By

driver = webdriver.Chrome()
product_count = 0


def test_1_login():
    driver.get("https://www.saucedemo.com")
    driver.find_element(By.XPATH, "/html/body/div/div/div[2]/div[1]/div/div/form/div[1]/input").send_keys("standard_user")
    driver.find_element(By.XPATH, "/html/body/div/div/div[2]/div[1]/div/div/form/div[2]/input").send_keys("secret_sauce")
    driver.find_element(By.XPATH, "/html/body/div/div/div[2]/div[1]/div/div/form/input").click()
    time.sleep(2)


def test_2_add_product():
    global product_count
    buttons = driver.find_elements(By.CLASS_NAME, "btn_inventory")
    buttons[0].click()
    product_count += 1
    time.sleep(1)
    badge = driver.find_element(By.CLASS_NAME, "shopping_cart_badge")
    assert badge.text == str(product_count)


def test_3_checkout():
    driver.find_element(By.CLASS_NAME, "shopping_cart_link").click()
    time.sleep(1)
    driver.find_element(By.ID, "checkout").click()
    driver.find_element(By.ID, "first-name").send_keys("Nico")
    driver.find_element(By.ID, "last-name").send_keys("Carames")
    driver.find_element(By.ID, "postal-code").send_keys("15001")
    driver.find_element(By.ID, "continue").click()
    driver.find_element(By.ID, "finish").click()
    assert "Thank you" in driver.page_source
    driver.quit()
```

## Consejos

- Antes de tocar nada, **enumera los problemas en voz alta**. El entrevistador quiere ver el diagnóstico más que el código.
- Causas típicas de que un test sea flaky:
  - Esperas fijas.
  - Dependencia del orden entre tests.
  - Estado compartido.
  - Selectores frágiles.
  - Datos que cambian.
  - Asserts sobre algo que aún no ha cargado.
  - Entorno: CI más lento, distinta resolución, sin `headless`.
- «Funciona en local y falla en CI» suele ser **timing** (`sleep` demasiado corto en una máquina lenta) o **resolución / headless**.
- Los reintentos automáticos no arreglan nada: **ocultan** el problema. Se pueden usar como red de seguridad, nunca como solución.

## Solución

### Problemas detectados

| # | Problema | Por qué falla |
| --- | --- | --- |
| 1 | `time.sleep(1/2)` | En CI la página tarda más de 1–2 s → el elemento no existe todavía. En local, en cambio, se pierde tiempo. |
| 2 | XPath absoluto (`/html/body/div/...`) | Cualquier cambio de maquetación lo rompe. |
| 3 | Tests que **dependen del orden** (`test_1`, `test_2`, `test_3`) | Si se ejecutan en paralelo o por separado (`pytest -k checkout`), fallan. Si el 1 falla, fallan todos. |
| 4 | **Driver global** creado al importar el módulo | Comparte el estado entre tests; si el test 3 falla antes de `quit()`, el navegador se queda abierto. |
| 5 | `global product_count` | Estado mutable compartido; con reintentos o ejecución parcial se desincroniza. |
| 6 | `buttons[0]` | Depende del orden del catálogo y no deja claro qué producto se añade. |
| 7 | `checkout` sin esperar a que cargue la página de checkout | Condición de carrera. |
| 8 | `"Thank you" in page_source` | Puede leer el HTML antes de que se pinte y es un assert poco preciso. |
| 9 | `driver.quit()` dentro del test | Si un assert falla antes, nunca se ejecuta. |
| 10 | Credenciales en el código y sin `headless` ni tamaño de ventana | Comportamiento distinto en CI; con una resolución pequeña la UI puede cambiar (menú hamburguesa). |

### Versión corregida

```python
# conftest.py
import pytest
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait

USER = {"username": "standard_user", "password": "secret_sauce"}


@pytest.fixture
def driver():
    options = webdriver.ChromeOptions()
    options.add_argument("--headless=new")
    options.add_argument("--window-size=1366,900")
    drv = webdriver.Chrome(options=options)
    yield drv
    drv.quit()  # se ejecuta SIEMPRE, aunque falle el test


@pytest.fixture
def wait(driver):
    return WebDriverWait(driver, 10)


@pytest.fixture
def logged_in(driver, wait):
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support import expected_conditions as EC

    driver.get("https://www.saucedemo.com")
    driver.find_element(By.CSS_SELECTOR, "[data-test='username']").send_keys(USER["username"])
    driver.find_element(By.CSS_SELECTOR, "[data-test='password']").send_keys(USER["password"])
    driver.find_element(By.CSS_SELECTOR, "[data-test='login-button']").click()
    wait.until(EC.url_contains("inventory.html"))
    return driver
```

```python
# test_cart_checkout.py
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

BACKPACK_ADD = (By.CSS_SELECTOR, "[data-test='add-to-cart-sauce-labs-backpack']")
CART_BADGE = (By.CSS_SELECTOR, "[data-test='shopping-cart-badge']")
CART_LINK = (By.CSS_SELECTOR, "[data-test='shopping-cart-link']")
CHECKOUT = (By.CSS_SELECTOR, "[data-test='checkout']")
FIRST_NAME = (By.CSS_SELECTOR, "[data-test='firstName']")
LAST_NAME = (By.CSS_SELECTOR, "[data-test='lastName']")
POSTAL = (By.CSS_SELECTOR, "[data-test='postalCode']")
CONTINUE = (By.CSS_SELECTOR, "[data-test='continue']")
FINISH = (By.CSS_SELECTOR, "[data-test='finish']")
COMPLETE = (By.CSS_SELECTOR, "[data-test='complete-header']")


def test_add_product_updates_badge(logged_in, wait):
    driver = logged_in
    driver.find_element(*BACKPACK_ADD).click()
    wait.until(EC.text_to_be_present_in_element(CART_BADGE, "1"))


def test_full_checkout(logged_in, wait):
    driver = logged_in
    driver.find_element(*BACKPACK_ADD).click()
    driver.find_element(*CART_LINK).click()

    wait.until(EC.element_to_be_clickable(CHECKOUT)).click()
    wait.until(EC.visibility_of_element_located(FIRST_NAME)).send_keys("Nico")
    driver.find_element(*LAST_NAME).send_keys("Carames")
    driver.find_element(*POSTAL).send_keys("15001")
    driver.find_element(*CONTINUE).click()

    wait.until(EC.element_to_be_clickable(FINISH)).click()
    header = wait.until(EC.visibility_of_element_located(COMPLETE))
    assert header.text == "Thank you for your order!"
```

### Qué ha cambiado
- **Tests independientes:** cada uno hace su propio login mediante una fixture y se pueden ejecutar en cualquier orden o en paralelo (`pytest -n 4` con `pytest-xdist`).
- **Esperas explícitas** sobre condiciones reales, sin `sleep`.
- **Selectores `data-test`** estables.
- **Fixture con `yield`** que cierra el navegador siempre.
- **Sin estado global.**
- **Assert preciso** sobre un elemento concreto.
- **Headless y tamaño de ventana fijos:** el mismo comportamiento en local y en CI.

### Cómo detectar un test flaky en un proyecto real
- Ejecutarlo N veces: `pytest --count=50` (pytest-repeat) o `npx playwright test --repeat-each=20`.
- Revisar las trazas, capturas y vídeos del fallo.
- Ponerlo en cuarentena (marcarlo y sacarlo del bloqueo del pipeline) mientras se arregla, y registrarlo en un ticket.
