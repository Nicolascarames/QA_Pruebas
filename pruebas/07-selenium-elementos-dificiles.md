# 07 · Elementos difíciles con Selenium

| Área | Nivel | Tiempo recomendado | Herramientas |
| --- | --- | --- | --- |
| Automatización web | Medio | 60–90 min (o live coding de 30 min con 2–3 apartados) | Python 3.10+, Selenium 4, pytest |

## Ejercicio

En **https://the-internet.herokuapp.com** automatiza:

1. **Carga dinámica** (`/dynamic_loading/2`): pulsa *Start* y comprueba que aparece «Hello World!».
2. **Alertas JS** (`/javascript_alerts`): acepta un alert, cancela un confirm y escribe «hola» en un prompt; comprueba el texto de `#result` en cada caso.
3. **Frames anidados** (`/nested_frames`): lee el texto del frame central (MIDDLE) y del inferior (BOTTOM).
4. **Nueva ventana** (`/windows`): abre el enlace, cambia a la nueva pestaña y comprueba el título «New Window».
5. **Desplegable** (`/dropdown`): selecciona «Option 2» y compruébalo.
6. **Subida de fichero** (`/upload`): sube un fichero temporal y comprueba su nombre en la página de resultado.

**Condición:** prohibido `time.sleep`.

## Consejos

- **Esperas:** las explícitas (`WebDriverWait` + `expected_conditions`) son mejores que las implícitas, y nunca `sleep`. No mezcles las implícitas con las explícitas.
- Con Selenium 4.6 o superior, **Selenium Manager** descarga el driver solo. No hace falta `webdriver-manager`.
- **Frames:** `switch_to.frame(...)` y vuelve siempre con `switch_to.default_content()`.
- **Ventanas:** guarda el `current_window_handle` original antes de abrir la nueva.
- **Alertas:** `wait.until(EC.alert_is_present())` antes de `switch_to.alert`.
- **Uploads:** `send_keys(ruta_absoluta)` sobre el `<input type="file">`. No hagas clic en el botón del diálogo del sistema operativo.
- Usa una fixture de pytest para crear y cerrar el driver.

## Solución

### Instalación

```bash
pip install selenium pytest
```

### `conftest.py`

```python
import pytest
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait

BASE_URL = "https://the-internet.herokuapp.com"


@pytest.fixture
def driver():
    options = webdriver.ChromeOptions()
    options.add_argument("--headless=new")
    options.add_argument("--window-size=1280,900")
    drv = webdriver.Chrome(options=options)
    yield drv
    drv.quit()


@pytest.fixture
def wait(driver):
    return WebDriverWait(driver, 10)
```

### `test_the_internet.py`

```python
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select

from conftest import BASE_URL


def test_dynamic_loading(driver, wait):
    driver.get(f"{BASE_URL}/dynamic_loading/2")
    driver.find_element(By.CSS_SELECTOR, "#start button").click()
    finish = wait.until(EC.visibility_of_element_located((By.ID, "finish")))
    assert finish.text == "Hello World!"


def test_js_alert_accept(driver, wait):
    driver.get(f"{BASE_URL}/javascript_alerts")
    driver.find_element(By.XPATH, "//button[text()='Click for JS Alert']").click()
    wait.until(EC.alert_is_present()).accept()
    assert driver.find_element(By.ID, "result").text == "You successfully clicked an alert"


def test_js_confirm_dismiss(driver, wait):
    driver.get(f"{BASE_URL}/javascript_alerts")
    driver.find_element(By.XPATH, "//button[text()='Click for JS Confirm']").click()
    wait.until(EC.alert_is_present()).dismiss()
    assert driver.find_element(By.ID, "result").text == "You clicked: Cancel"


def test_js_prompt(driver, wait):
    driver.get(f"{BASE_URL}/javascript_alerts")
    driver.find_element(By.XPATH, "//button[text()='Click for JS Prompt']").click()
    alert = wait.until(EC.alert_is_present())
    alert.send_keys("hola")
    alert.accept()
    assert driver.find_element(By.ID, "result").text == "You entered: hola"


def test_nested_frames(driver):
    driver.get(f"{BASE_URL}/nested_frames")

    driver.switch_to.frame("frame-top")
    driver.switch_to.frame("frame-middle")
    assert driver.find_element(By.ID, "content").text == "MIDDLE"

    driver.switch_to.default_content()
    driver.switch_to.frame("frame-bottom")
    assert driver.find_element(By.TAG_NAME, "body").text.strip() == "BOTTOM"
    driver.switch_to.default_content()


def test_new_window(driver, wait):
    driver.get(f"{BASE_URL}/windows")
    original = driver.current_window_handle
    driver.find_element(By.LINK_TEXT, "Click Here").click()

    wait.until(EC.number_of_windows_to_be(2))
    new_handle = next(h for h in driver.window_handles if h != original)
    driver.switch_to.window(new_handle)

    assert driver.find_element(By.TAG_NAME, "h3").text == "New Window"
    driver.close()
    driver.switch_to.window(original)


def test_dropdown(driver):
    driver.get(f"{BASE_URL}/dropdown")
    select = Select(driver.find_element(By.ID, "dropdown"))
    select.select_by_visible_text("Option 2")
    assert select.first_selected_option.text == "Option 2"


def test_file_upload(driver, wait, tmp_path):
    file = tmp_path / "prueba_qa.txt"
    file.write_text("hola QA")

    driver.get(f"{BASE_URL}/upload")
    driver.find_element(By.ID, "file-upload").send_keys(str(file.resolve()))
    driver.find_element(By.ID, "file-submit").click()

    uploaded = wait.until(EC.visibility_of_element_located((By.ID, "uploaded-files")))
    assert uploaded.text == "prueba_qa.txt"
```

### Ejecutar

```bash
pytest -v
```

### Preguntas que te harán sobre este ejercicio
- **¿Implícita o explícita?** La implícita aplica a todos los `find_element` y oculta los problemas; la explícita espera una condición concreta. Mezclarlas puede producir esperas impredecibles.
- **`StaleElementReferenceException`:** el DOM se ha regenerado y la referencia ya no vale. Hay que volver a localizar el elemento o esperar con `EC.staleness_of`.
- **¿Cómo haces clic en un elemento tapado por otro?** Espera `element_to_be_clickable`, haz scroll con `scrollIntoView` o, como último recurso, clic por JavaScript (y explica por qué es un último recurso: no simula a un usuario real).
- **Shadow DOM:** en Selenium 4 se accede con `element.shadow_root.find_element(...)`.

### Versión Java (por si te la piden)

```java
WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
driver.findElement(By.cssSelector("#start button")).click();
WebElement finish = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("finish")));
Assertions.assertEquals("Hello World!", finish.getText());
```
