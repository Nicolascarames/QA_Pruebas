# 09 · Refactorizar a Page Object Model

| Área | Nivel | Tiempo recomendado | Herramientas |
| --- | --- | --- | --- |
| Automatización web / diseño de frameworks | Medio | 45 min | Python, Selenium 4, pytest |

## Ejercicio

Tienes 3 tests que repiten selectores y lógica. **Refactorízalos a Page Object Model**, sin cambiar lo que comprueban, y explica las ventajas.

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def test_login_ok():
    d = webdriver.Chrome()
    d.get("https://www.saucedemo.com")
    d.find_element(By.ID, "user-name").send_keys("standard_user")
    d.find_element(By.ID, "password").send_keys("secret_sauce")
    d.find_element(By.ID, "login-button").click()
    WebDriverWait(d, 10).until(EC.url_contains("inventory"))
    assert d.find_element(By.CLASS_NAME, "title").text == "Products"
    d.quit()


def test_login_wrong_password():
    d = webdriver.Chrome()
    d.get("https://www.saucedemo.com")
    d.find_element(By.ID, "user-name").send_keys("standard_user")
    d.find_element(By.ID, "password").send_keys("mala")
    d.find_element(By.ID, "login-button").click()
    err = d.find_element(By.CSS_SELECTOR, "h3[data-test='error']").text
    assert "Username and password do not match" in err
    d.quit()


def test_logout():
    d = webdriver.Chrome()
    d.get("https://www.saucedemo.com")
    d.find_element(By.ID, "user-name").send_keys("standard_user")
    d.find_element(By.ID, "password").send_keys("secret_sauce")
    d.find_element(By.ID, "login-button").click()
    WebDriverWait(d, 10).until(EC.url_contains("inventory"))
    d.find_element(By.ID, "react-burger-menu-btn").click()
    WebDriverWait(d, 10).until(EC.element_to_be_clickable((By.ID, "logout_sidebar_link"))).click()
    assert d.find_element(By.ID, "login-button").is_displayed()
    d.quit()
```

## Consejos

- Un **page object** por pantalla (o por componente reutilizable, como el menú lateral). Dentro van los **localizadores** y las **acciones** de negocio (`login()`, `logout()`).
- Los **asserts van en el test**. El page object puede exponer datos (`get_error()`), pero no decide si algo está bien.
- Una acción que navega a otra página puede **devolver el page object siguiente** (*fluent interface*): `login_page.login(...)` → `InventoryPage`.
- Pon las esperas en una clase base (`BasePage`) para no repetirlas.
- El driver lo gestiona **una fixture**, no los tests.
- Ventajas que debes nombrar: si cambia un selector se cambia en un solo sitio, los tests se leen como casos de negocio, hay menos duplicación y es más fácil incorporar a gente nueva.

## Solución

### Estructura

```
pom_saucedemo/
├── conftest.py
├── pages/
│   ├── __init__.py
│   ├── base_page.py
│   ├── login_page.py
│   ├── inventory_page.py
│   └── side_menu.py
└── tests/
    └── test_login.py
```

### `pages/base_page.py`

```python
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


class BasePage:
    def __init__(self, driver: WebDriver, timeout: int = 10):
        self.driver = driver
        self.wait = WebDriverWait(driver, timeout)

    def find(self, locator):
        return self.wait.until(EC.visibility_of_element_located(locator))

    def click(self, locator):
        self.wait.until(EC.element_to_be_clickable(locator)).click()

    def type(self, locator, text: str):
        el = self.find(locator)
        el.clear()
        el.send_keys(text)
```

### `pages/login_page.py`

```python
from selenium.webdriver.common.by import By

from pages.base_page import BasePage
from pages.inventory_page import InventoryPage


class LoginPage(BasePage):
    URL = "https://www.saucedemo.com"
    USERNAME = (By.ID, "user-name")
    PASSWORD = (By.ID, "password")
    LOGIN_BTN = (By.ID, "login-button")
    ERROR = (By.CSS_SELECTOR, "h3[data-test='error']")

    def open(self) -> "LoginPage":
        self.driver.get(self.URL)
        return self

    def login(self, username: str, password: str) -> InventoryPage:
        self.type(self.USERNAME, username)
        self.type(self.PASSWORD, password)
        self.click(self.LOGIN_BTN)
        return InventoryPage(self.driver)

    def get_error(self) -> str:
        return self.find(self.ERROR).text

    def is_loaded(self) -> bool:
        return self.find(self.LOGIN_BTN).is_displayed()
```

### `pages/inventory_page.py`

```python
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

from pages.base_page import BasePage
from pages.side_menu import SideMenu


class InventoryPage(BasePage):
    TITLE = (By.CLASS_NAME, "title")

    def wait_loaded(self) -> "InventoryPage":
        self.wait.until(EC.url_contains("inventory"))
        return self

    def get_title(self) -> str:
        return self.find(self.TITLE).text

    @property
    def menu(self) -> SideMenu:
        return SideMenu(self.driver)
```

### `pages/side_menu.py`

```python
from selenium.webdriver.common.by import By

from pages.base_page import BasePage


class SideMenu(BasePage):
    OPEN_BTN = (By.ID, "react-burger-menu-btn")
    LOGOUT = (By.ID, "logout_sidebar_link")

    def logout(self):
        from pages.login_page import LoginPage  # import local para evitar un ciclo
        self.click(self.OPEN_BTN)
        self.click(self.LOGOUT)
        return LoginPage(self.driver)
```

### `conftest.py`

```python
import pytest
from selenium import webdriver

from pages.login_page import LoginPage


@pytest.fixture
def driver():
    options = webdriver.ChromeOptions()
    options.add_argument("--headless=new")
    drv = webdriver.Chrome(options=options)
    yield drv
    drv.quit()


@pytest.fixture
def login_page(driver) -> LoginPage:
    return LoginPage(driver).open()
```

### `tests/test_login.py`

```python
VALID = ("standard_user", "secret_sauce")


def test_login_ok(login_page):
    inventory = login_page.login(*VALID).wait_loaded()
    assert inventory.get_title() == "Products"


def test_login_wrong_password(login_page):
    login_page.login("standard_user", "mala")
    assert "Username and password do not match" in login_page.get_error()


def test_logout(login_page):
    inventory = login_page.login(*VALID).wait_loaded()
    login_page_again = inventory.menu.logout()
    assert login_page_again.is_loaded()
```

### Antes y después

| Aspecto | Antes | Después |
| --- | --- | --- |
| Líneas por test | 8–12 | 2–3 |
| Selector de login repetido | 3 veces | 1 vez |
| Si cambia `#user-name` | Editar 3 tests | Editar 1 línea |
| Cierre del driver | Manual (se pierde si falla el test) | Fixture, siempre |
| Legibilidad | Técnica | Lenguaje de negocio |

### Preguntas de seguimiento
- **¿POM o Screenplay?** Screenplay (actores, tareas, preguntas) escala mejor en suites muy grandes, pero tiene más curva de aprendizaje. POM es suficiente en la mayoría de los proyectos.
- **¿Page Factory?** En Java (`@FindBy`) inicializa los elementos de forma perezosa. Hoy se usa menos; muchos prefieren localizadores `By` explícitos.
- **¿Componentes?** Las partes repetidas (cabecera, menú, modal) se modelan como componentes reutilizables, como `SideMenu`.
