import { Component } from "../base/Component";
import { IEvents } from '../base/Events';

export abstract class Card extends Component<object> {
    protected _id: string = '';
    protected _title: HTMLElement;
    protected _price: HTMLElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this._title = container.querySelector('.card__title') as HTMLElement;
        this._price = container.querySelector('.card__price') as HTMLElement;
    }

    set id(value: string) {
        this._id = value;
    }

    set title(value: string) {
        this._title.textContent = value;
    }

    set price(value: number | null) {
        if (value === null) {
            this._price.textContent = 'Бесценно';
        } else {
            this._price.textContent = `${value} синапсов`;
        }
    }
}
