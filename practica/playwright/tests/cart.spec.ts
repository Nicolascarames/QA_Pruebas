import {test, expect} from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { users } from '../data/users'
import { articles } from '../data/articles'
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';

let loginPage: LoginPage
let inventoryPage: InventoryPage
let cartPage: CartPage

test.beforeEach(async ({page}) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page)
    cartPage = new CartPage(page)
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);

})

test ('Añadir 2 productos al carrito', async ({page}) => {
    await inventoryPage.addToCart(articles.backpack.name)
    await inventoryPage.addToCart(articles.bolt_T_Shirt.name)
    await expect (inventoryPage.cartButton).toHaveText('2');
    await inventoryPage.goToCart();
    await expect (cartPage.cartTitle).toHaveText('Your Cart');
    await expect (cartPage.itemNames).toHaveText([articles.backpack.name, articles.bolt_T_Shirt.name]);

})