// ANTES: import test, { expect } from "@playwright/test";
// MAL: no es un fallo (funciona), pero no es la forma habitual
// POR QUÉ: la convención de Playwright es importar los dos con nombre: { test, expect }
import { test, expect } from "@playwright/test";
import { users } from "../data/users";
import { CartPage } from "../pages/CartPage";
import { InventoryPage } from "../pages/InventoryPage";
import { LoginPage } from "../pages/LoginPage";
import { articles } from "../data/articles";
import { CheckoutPage } from "../pages/CheckoutPage";

let loginPage: LoginPage;
let inventoryPage: InventoryPage;
let cartPage: CartPage;
let checkoutPage: CheckoutPage;

test.beforeEach (async ({page}) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
    // ME OLVIDE DE PONER LA NAVEGACION Y SIEMPRE CON AWAIT
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
})

test('Checkout completo: total = suma de precios + impuestos', async () => {
    const products = [articles.backpack, articles.bike_Light];

    // Carrito
    await expect(inventoryPage.productsTitle).toHaveText('Products');
    await inventoryPage.addToCart(products.map(p => p.name));
    // toHaveText('Cart, 2 items'): Eso es el nombre accesible y el texto visible es '2'.
    await expect(inventoryPage.cartButton).toHaveText('2');
    await inventoryPage.cartButton.click();
    // ANTES: toHaveText('View details for Sauce Labs Backpack') y otra línea igual para Bike Light
    // MAL: "View details for..." es el aria-label, no el texto visible; y con un string y 2 elementos da error de strict mode
    // POR QUÉ: toHaveText compara el texto visible; para varios elementos se le pasa UN array (comprueba cantidad, orden y texto)
    await expect(cartPage.itemNames).toHaveText(products.map(p => p.name));
    // ANTES: await expect(cartPage.buttonCheckOut).toBeVisible(); antes del click
    // MAL: no es un fallo, pero sobra
    // POR QUÉ: click() ya espera solo a que el botón sea visible y clicable
    await cartPage.buttonCheckOut.click();

    // Paso 1: datos
    // ANTES: fillInfo(...) y después await checkoutPage.buttonContinue.click();
    // MAL: Continue se pulsaba dos veces; la segunda en una pantalla donde ese botón ya no existe
    // POR QUÉ: fillInfo ya pulsa Continue por dentro
    await checkoutPage.fillInfo(users.standard.firstName, users.standard.lastName, users.standard.postalCode);

    // Paso 2: resumen
    // ANTES: buttonFinish.click() y DESPUÉS await expect(checkoutPage.totalPrice).toHaveText('39.98');
    // MAL: (1) comprobaba el total tras Finish, cuando los importes ya no están en pantalla;
    //      (2) 39.98 escrito a mano es el item total, no el total con impuestos
    // POR QUÉ: hay que comprobar antes de cambiar de pantalla, y el enunciado pide CALCULAR
    //          total = suma de precios (desde data/articles) + tax. toBeCloseTo evita el fallo de
    //          los decimales en JS (29.99 + 15.99 = 45.980000000000004)
    await expect(checkoutPage.total).toBeVisible();
    const expectedItemTotal = products.reduce((sum, p) => sum + p.price, 0);
    const itemTotal = await checkoutPage.getAmount(checkoutPage.itemTotal);
    const tax = await checkoutPage.getAmount(checkoutPage.tax);
    const total = await checkoutPage.getAmount(checkoutPage.total);
    expect(itemTotal).toBeCloseTo(expectedItemTotal, 2);
    expect(total).toBeCloseTo(itemTotal + tax, 2);

    // Final
    // ANTES: no había comprobación final
    // MAL: faltaba la parte del enunciado "hasta «Thank you for your order!»"
    // POR QUÉ: sin ella el test no demuestra que el pedido se completó
    await checkoutPage.buttonFinish.click();
    await expect(checkoutPage.completeHeader).toBeVisible();
})
