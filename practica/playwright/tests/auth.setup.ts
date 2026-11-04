import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { users } from '../data/users';

// Aquí se guarda la sesión. La carpeta playwright/.auth/ ya está en .gitignore
const authFile = 'playwright/.auth/user.json';

setup('login una vez y guardar la sesión', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    // Esperar a estar dentro antes de guardar; si no, guardaría una sesión vacía
    await expect(page).toHaveURL('/inventory.html');
    await page.context().storageState({ path: authFile });
});
