# 11 · Login móvil con Appium

| Área | Nivel | Tiempo recomendado | Herramientas |
| --- | --- | --- | --- |
| Automatización móvil | Medio | 2–3 h (incluida la instalación) | Node 20+, Appium 2, driver UiAutomator2, Android Studio (emulador), Python + Appium-Python-Client, Appium Inspector |

## Ejercicio

Con la app de demostración de Sauce Labs para Android (**Swag Labs Mobile App**, APK publicada en GitHub: `saucelabs/sample-app-mobile` → *Releases*):

1. Prepara el entorno: Appium 2 + UiAutomator2 + un emulador Android.
2. Automatiza:
   - Login correcto (`standard_user` / `secret_sauce`): se ve la pantalla de productos.
   - Login con usuario bloqueado (`locked_out_user`): se ve el mensaje de error.
   - Login con campos vacíos: «Username is required».
3. Aplica Page Object Model y cierra la sesión del driver al acabar.
4. **Extra:** el mismo test en iOS (XCUITest) cambiando solo las capabilities, y ejecución en una granja en la nube (BrowserStack / Sauce Labs).

> Si te dan otra app, el proceso es idéntico: descubre los localizadores con **Appium Inspector**.

## Consejos

- **Prioridad de localizadores en móvil:** `accessibility id` (multiplataforma, el mejor) → `id` / `resource-id` (Android) → UiAutomator / predicados de iOS → XPath (el más lento y frágil).
- Pide al equipo de desarrollo que ponga `contentDescription` / `testID` / `accessibilityIdentifier` en los elementos. Esto puntúa: demuestra que piensas en la «testabilidad».
- **Appium 2:** los drivers se instalan aparte (`appium driver install uiautomator2`) y la URL del servidor ya no lleva `/wd/hub`.
- `appium-doctor` (`npx appium-doctor --android`) comprueba ANDROID_HOME, JAVA_HOME y adb.
- Usa `noReset` / `fullReset` según necesites el estado limpio o no.
- Las esperas, igual que en web: `WebDriverWait`, nunca `sleep`.
- Distingue entre app **nativa** (UiAutomator2 / XCUITest), **híbrida** (cambio de contexto a `WEBVIEW_...`) y **web móvil** (`browserName: Chrome`).

## Solución

### 1. Entorno

```bash
npm i -g appium
appium driver install uiautomator2
npx appium-doctor --android      # comprobar la instalación
appium                            # arranca en http://127.0.0.1:4723

# Emulador: crear un AVD en Android Studio (p. ej. Pixel 7, API 34) y arrancarlo
adb devices                       # debe aparecer emulator-5554

pip install Appium-Python-Client pytest
```

Descarga el APK en `apps/swaglabs.apk`.

### 2. Localizadores

En **Appium Inspector** (Remote Host 127.0.0.1, puerto 4723 y las capabilities de abajo) verás los `content-desc` de la app. Los habituales en esta app son:

| Elemento | Estrategia | Valor |
| --- | --- | --- |
| Usuario | accessibility id | `test-Username` |
| Contraseña | accessibility id | `test-Password` |
| Botón login | accessibility id | `test-LOGIN` |
| Mensaje de error | accessibility id | `test-Error message` |
| Pantalla de productos | accessibility id | `test-PRODUCTS` |

> Verifícalos con el Inspector: según la versión del APK pueden cambiar. Hacer esa comprobación es parte del ejercicio.

### 3. Código

```
appium_swaglabs/
├── apps/swaglabs.apk
├── conftest.py
├── pages/
│   ├── base_screen.py
│   ├── login_screen.py
│   └── products_screen.py
└── tests/test_login.py
```

**`conftest.py`**

```python
import os

import pytest
from appium import webdriver
from appium.options.android import UiAutomator2Options

APP = os.path.abspath("apps/swaglabs.apk")


@pytest.fixture
def driver():
    options = UiAutomator2Options()
    options.platform_name = "Android"
    options.device_name = "emulator-5554"
    options.app = APP
    options.app_wait_activity = "*"
    options.no_reset = False
    options.new_command_timeout = 120

    drv = webdriver.Remote("http://127.0.0.1:4723", options=options)
    yield drv
    drv.quit()
```

**`pages/base_screen.py`**

```python
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


class BaseScreen:
    def __init__(self, driver, timeout=15):
        self.driver = driver
        self.wait = WebDriverWait(driver, timeout)

    @staticmethod
    def acc(value):
        return (AppiumBy.ACCESSIBILITY_ID, value)

    def find(self, locator):
        return self.wait.until(EC.visibility_of_element_located(locator))

    def tap(self, locator):
        self.find(locator).click()

    def type(self, locator, text):
        el = self.find(locator)
        el.clear()
        el.send_keys(text)

    def is_visible(self, locator) -> bool:
        try:
            self.find(locator)
            return True
        except Exception:
            return False
```

**`pages/login_screen.py`**

```python
from appium.webdriver.common.appiumby import AppiumBy

from pages.base_screen import BaseScreen
from pages.products_screen import ProductsScreen


class LoginScreen(BaseScreen):
    USERNAME = BaseScreen.acc("test-Username")
    PASSWORD = BaseScreen.acc("test-Password")
    LOGIN = BaseScreen.acc("test-LOGIN")
    ERROR = BaseScreen.acc("test-Error message")

    def login(self, user: str, pwd: str) -> ProductsScreen:
        if user:
            self.type(self.USERNAME, user)
        if pwd:
            self.type(self.PASSWORD, pwd)
        self.tap(self.LOGIN)
        return ProductsScreen(self.driver)

    def error_text(self) -> str:
        # El texto suele estar en un TextView hijo del contenedor de error
        container = self.find(self.ERROR)
        return container.find_element(AppiumBy.CLASS_NAME, "android.widget.TextView").text
```

**`pages/products_screen.py`**

```python
from pages.base_screen import BaseScreen


class ProductsScreen(BaseScreen):
    CONTAINER = BaseScreen.acc("test-PRODUCTS")

    def is_loaded(self) -> bool:
        return self.is_visible(self.CONTAINER)
```

**`tests/test_login.py`**

```python
import pytest

from pages.login_screen import LoginScreen


def test_login_ok(driver):
    products = LoginScreen(driver).login("standard_user", "secret_sauce")
    assert products.is_loaded()


@pytest.mark.parametrize(
    "user,pwd,expected",
    [
        ("locked_out_user", "secret_sauce", "Sorry, this user has been locked out."),
        ("", "", "Username is required"),
        ("standard_user", "", "Password is required"),
        ("standard_user", "mala", "Username and password do not match any user in this service."),
    ],
)
def test_login_errors(driver, user, pwd, expected):
    screen = LoginScreen(driver)
    screen.login(user, pwd)
    assert expected in screen.error_text()
```

```bash
pytest -v
```

### 4. Extra: iOS y la nube

```python
from appium.options.ios import XCUITestOptions

options = XCUITestOptions()
options.platform_name = "iOS"
options.device_name = "iPhone 15"
options.platform_version = "17.5"
options.app = "/ruta/SwagLabs.app"   # .app para simulador, .ipa para dispositivo real
```

Como los localizadores son **accessibility id**, los page objects valen sin cambios en las dos plataformas.

En BrowserStack o Sauce Labs solo cambian la URL remota, las credenciales y `app` (el id de la app subida); los tests no se tocan.

### Preguntas típicas
- **¿Emulador o dispositivo real?** El emulador es barato y rápido para CI. El dispositivo real es necesario para rendimiento, batería, cámara, biometría, red real y fallos de un fabricante concreto. Una granja de dispositivos da cobertura amplia.
- **Gestos:** en Appium 2, `mobile: swipeGesture`, `mobile: scrollGesture` (UiAutomator2) o las W3C Actions.
- **Apps híbridas:** `driver.contexts` → `driver.switch_to.context("WEBVIEW_com.app")`.
- **Fragmentación:** la matriz de dispositivos se decide con la analítica de uso real (top de modelos y versiones de SO).
