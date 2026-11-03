import { Locator, Page } from "@playwright/test";

export class CheckoutPage {

    // Paso 1: tus datos
    readonly textboxName: Locator;
    readonly textboxLastName: Locator;
    readonly textboxZip: Locator;
    readonly buttonContinue: Locator;
    // Paso 2: resumen
    readonly itemTotal: Locator;
    readonly tax: Locator;
    readonly total: Locator;
    readonly buttonFinish: Locator;
    // Final
    readonly completeHeader: Locator;

    constructor(page:Page){

        this.textboxName = page.getByRole('textbox', {name: 'First Name'});
        this.textboxLastName = page.getByRole('textbox', {name: 'Last Name'});
        // ANTES: textboxCip · MAL: errata en el nombre · POR QUÉ: es "Zip code"; un nombre claro evita confusiones
        this.textboxZip = page.getByRole('textbox', {name: 'Zip/Postal Code'});
        this.buttonContinue = page.getByRole('button', {name: 'Continue'});

        // ANTES: readonly totalPrice = page.getByText(/^View details for /);
        // MAL: copia-pega del locator de nombres del carrito; no apuntaba a ningún precio
        // POR QUÉ: para calcular "total = suma + impuestos" hacen falta tres importes: item total, tax y total
        // Textos tipo "Item total: $39.98", "Tax: $3.20", "Total: $43.18".
        // ^ = "empieza por": así /^Total:/ no encaja con "Item total: ...".
        this.itemTotal = page.getByText(/^Item total: \$/);
        this.tax = page.getByText(/^Tax: \$/);
        this.total = page.getByText(/^Total: \$/);
        this.buttonFinish = page.getByRole('button', {name: 'Finish'});

        this.completeHeader = page.getByRole('heading', {name: 'Thank you for your order!'});
    }

    async fillInfo (firstName:string, lastName:string, postalCode:string){
        await this.textboxName.fill(firstName);
        await this.textboxLastName.fill(lastName);
        await this.textboxZip.fill(postalCode);
        await this.buttonContinue.click();
    }

    // "Item total: $39.98" -> 39.98 (quita todo lo que no sea dígito o punto)
    async getAmount(locator: Locator): Promise<number> {
        const text = await locator.textContent() ?? '';
        return Number(text.replace(/[^\d.]/g, ''));
    }

}
