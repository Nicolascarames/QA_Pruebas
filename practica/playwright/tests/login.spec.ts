import {test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import {users} from '../data/users';

// ANTES: esta línea estaba en cart, inventory y checkOut, y no aquí
// MAL: quitaba la sesión justo a los tests que la necesitan (fallaban los 3: SauceDemo los devolvía al login)
// POR QUÉ: test.use vale para todo el fichero; solo los tests de login deben arrancar SIN la sesión guardada
test.use({ storageState: { cookies: [], origins: [] } });

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

test('TC-03 · contraseña incorrecta', async ({  }) => {
    await loginPage.login(users.standard.username, 'novale');
    await expect(loginPage.botonLogin).toBeVisible();
    await expect(loginPage.msgError).toHaveText('Epic sadface: Username and password do not match any user in this service');
});

test('TC-11 · bloqueo de usuario en login', async ({}) => {
    await loginPage.login(users.locked.username, users.locked.password);
    await expect(loginPage.botonLogin).toBeVisible();
    await expect(loginPage.msgError).toHaveText('Epic sadface: Sorry, this user has been locked out.');
});

