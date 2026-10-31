import {test, expect} from '@playwright/test';
import { InventoryPage } from '../pages/InventoryPage';
import { LoginPage } from '../pages/LoginPage';
import { users } from '../data/users';

let loginPage: LoginPage;
let inventoryPage: InventoryPage;

test.beforeEach(async ({page}) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
})

test ('TC-02 · ordenar los productos por precio de menor a mayor', async ({}) => {
    
    await expect(inventoryPage.productsTitle).toHaveText('Products');
    await inventoryPage.sortBy('lohi');
    await expect(inventoryPage.prices).not.toHaveCount(0);
    const prices = await inventoryPage.getPrices();
    const sorted = prices.toSorted((a, b) => a - b);
    expect(prices).toEqual(sorted);

} )