import { Locator, Page } from "@playwright/test";

export class CartPage{

    readonly cartTitle: Locator;
    readonly itemNames: Locator;

    constructor(page:Page){
        this.cartTitle = page.getByText('Your Cart')
        // Cada producto del carrito es un botón con aria-label "View details for <nombre>";
        // su texto visible es solo el nombre.
        this.itemNames = page.getByRole('button', {name: /^View details for /})
    }

}
