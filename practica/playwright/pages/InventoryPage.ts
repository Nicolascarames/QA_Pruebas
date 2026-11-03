import { Locator, Page } from "@playwright/test";

export class InventoryPage {

    readonly page: Page;
    readonly productsTitle: Locator;
    readonly filterSelect: Locator;
    readonly prices: Locator;
    readonly cartButton: Locator;
    readonly addToCartButton: Locator

    constructor(page:Page){
        this.page = page;
        this.productsTitle = page.locator('[data-test="title"]')
        this.filterSelect = page.getByRole ('combobox', {name: 'Sort products'})
        this.prices = page.getByText(/^\$\d+\.\d{2}$/);
        this.cartButton = page.getByRole('button', {name: /^Cart/})
        this.addToCartButton = page.getByRole('button', {name: 'Add to cart'})
        
    }

    async sortBy(option: 'az' | 'za' | 'lohi' | 'hilo'){
        await this.filterSelect.selectOption(option);
    }

    async getPrices(): Promise<number[]> {
        const text = await this.prices.allTextContents();
        return text.map(price => Number(price.replace('$','')));
    }

    async addToCart(productNameList: string[]){
        // ANTES: addToCart(productNameList: Array) { productNameList.map(productName => { await ... }) }
        // MAL: (1) Array sin tipo de elemento; (2) await dentro de una flecha que no es async;
        //      (3) map lanza todas las vueltas a la vez y no espera ninguna
        // POR QUÉ: map es para transformar datos; para acciones con await en orden se usa for...of
        for (const productName of productNameList) {
            // ANTES: getByRole('button', {name: 'View details for ' + productName}).filter(...).getByRole('button', {name: 'Add to cart'})
            // MAL: buscaba "Add to cart" DENTRO del botón "View details", pero son hermanos, no padre e hijo
            // POR QUÉ: encadenar locators = buscar dentro. Hay que subir al contenedor común (la tarjeta, un <div>
            //          sin rol) y filtrar: el div más interno que tiene los dos botones es el último (.last())
            await this.page.locator('div')
            .filter({has: this.page.getByRole('button', {name: `View details for ${productName}`})})
            .filter({has: this.addToCartButton})
            .last()
            .getByRole('button', {name: 'Add to cart'})
            .click();
        }
    }

    async goToCart(){
        await this.page.goto('/cart.html')
    }
}