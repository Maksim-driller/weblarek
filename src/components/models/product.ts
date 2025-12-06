import { IProduct } from "./../../types";
import { IEvents } from "../base/Events";

export class Product {
    private selected: IProduct | null = null;
    private products: IProduct[] = [];

    constructor(protected events: IEvents) {}

    getSelected(): IProduct | null {
        return this.selected;
    }

    getProducts(): IProduct[] {
        return this.products;
    }

    setSelected(product: IProduct): void {
        this.selected = product;
        this.events.emit('product:selected', product);
    }

    setProducts(products: IProduct[]): void {
        this.products = products;
        this.events.emit('products:changed', products);
    }

    getProductById(id: string): IProduct | undefined {
        return this.products.find((product) => product.id === id);
    }
}