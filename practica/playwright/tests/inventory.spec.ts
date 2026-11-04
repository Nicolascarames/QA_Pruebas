import {test, expect} from '@playwright/test';
import { InventoryPage } from '../pages/InventoryPage';

let inventoryPage: InventoryPage;

test.beforeEach(async ({page}) => {
    inventoryPage = new InventoryPage(page);
    await page.goto('/inventory.html');
})

test ('TC-02 · ordenar los productos por precio de menor a mayor', async ({}) => {
    
    await expect(inventoryPage.productsTitle).toHaveText('Products');
    await inventoryPage.sortBy('lohi');
    await expect(inventoryPage.prices).not.toHaveCount(0);
    const prices = await inventoryPage.getPrices();
    const sorted = prices.toSorted((a, b) => a - b);
    expect(prices).toEqual(sorted);

} )