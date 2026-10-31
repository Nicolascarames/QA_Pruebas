import {test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import {users} from '../data/users';

let loginPage: LoginPage;

test.beforeEach(async ({page}) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
})


test('TC-01 · un usuario válido inicia sesión y ve el catálogo', async ({ page }) => {
    await loginPage.login(users.standard.username, users.standard.password);
    await expect(page).toHaveURL('/inventory.html');
    await expect(page.locator('[data-test="title"]')).toHaveText('Products');
});

test('TC-03 · contraseña incorrecta', async ({ page }) => {
    await loginPage.login(users.standard.username, 'novale');
    await expect(loginPage.botonLogin).toBeVisible();
    await expect(loginPage.msgError).toHaveText('Epic sadface: Username and password do not match any user in this service');
});

test('TC-11 · bloqueo de usuario en login', async ({page}) => {
    await loginPage.login(users.locked.username, users.locked.password);
    await expect(loginPage.botonLogin).toBeVisible();
    await expect(loginPage.msgError).toHaveText('Epic sadface: Sorry, this user has been locked out.');
});

