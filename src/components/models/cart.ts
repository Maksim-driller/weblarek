import { IProduct } from "./../../types";
import { IEvents } from "../base/Events";

export class Cart {
    private items: IProduct[] = [];

    constructor(protected events: IEvents) {}

    getItems(): IProduct[] {
        return this.items;
    }

    hasItem(productId: string): boolean {
        return this.items.some((item) => item.id === productId);
    }

    addItem(product: IProduct): void {
        if (!this.hasItem(product.id)) {
            this.items.push(product);
            this.events.emit('cart:changed', this.items);
        }
    }

    removeItem(itemId: string): void {
        this.items = this.items.filter((item) => item.id !== itemId);
        this.events.emit('cart:changed', this.items);
    }

    clear(): void {
        this.items = [];
        this.events.emit('cart:changed', this.items);
    }

    getCount(): number {
        return this.items.length;
    }

    getTotal(): number {
        return this.items.reduce((total, item) => total + (item.price ?? 0), 0);
    }
}