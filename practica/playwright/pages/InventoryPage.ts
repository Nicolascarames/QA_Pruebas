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

    async addToCart(productName:string){
        await this.addToCartButton.filter({hasText: productName}).click();
    }

    async goToCart(){
        await this.page.goto('/cart')
    }
}