import { IProduct } from "./../../types";

export class Cart {
    private items: IProduct[] = [];

    getItems(): IProduct[] {
        return this.items;
    }

    hasItem(productId: string): boolean {
        return this.items.some((item) => item.id === productId);
    }

    addItem(product: IProduct): void {
        if (!this.hasItem(product.id)) {
            this.items.push(product);
        }
    }

    removeItem(itemId: string): void {
        this.items = this.items.filter((item) => item.id !== itemId);
    }

    clear(): void {
        this.items = [];
    }

    getCount(): number {
        return this.items.length;
    }

    getTotal(): number {
        return this.items.reduce((total, item) => total + (item.price ?? 0), 0);
    }
}