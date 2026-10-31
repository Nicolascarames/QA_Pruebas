import { Page, Locator } from "@playwright/test";

export class LoginPage {

    readonly page: Page;
    readonly userInput: Locator;
    readonly pwdInput: Locator;
    readonly botonLogin: Locator;
    readonly msgError: Locator;

    constructor(page:Page){
        this.page = page;
        this.userInput = page.getByRole('textbox', {name:'Username'})
        this.pwdInput = page.getByRole('textbox', {name:'Password'})
        this.botonLogin = page.getByRole('button', {name:'Login'})
        this.msgError = page.getByRole('alert')

    }

    async goto(){
        await this.page.goto('/');
    }

    async login(usuario:string, contraseña:string){
        await this.userInput.fill(usuario);
        await this.pwdInput.fill(contraseña);
        await this.botonLogin.click();
    }
}