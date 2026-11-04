import {test, expect} from '@playwright/test';
import { articles } from '../data/articles'
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';

let inventoryPage: InventoryPage
let cartPage: CartPage

test.beforeEach(async ({page}) => {
    inventoryPage = new InventoryPage(page)
    cartPage = new CartPage(page)
    await page.goto('/inventory.html');

})

test ('Añadir 2 productos al carrito', async ({page}) => {
    await inventoryPage.addToCart([articles.backpack.name, articles.bolt_T_Shirt.name])
    await expect (inventoryPage.cartButton).toHaveText('2');
    await inventoryPage.goToCart();
    await expect (cartPage.cartTitle).toHaveText('Your Cart');
    await expect (cartPage.itemNames).toHaveText([articles.backpack.name, articles.bolt_T_Shirt.name]);

})