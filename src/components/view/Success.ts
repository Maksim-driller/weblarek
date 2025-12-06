import { Component } from "../base/Component";
import { IEvents } from '../base/Events';

export class Success extends Component<object> {
    private _description: HTMLElement;
    private _closeButton: HTMLButtonElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);
        this._description = container.querySelector('.order-success__description') as HTMLElement;
        this._closeButton = container.querySelector('.order-success__close') as HTMLButtonElement;
        this._closeButton.addEventListener('click', () => {
            this.events.emit('success:close');
        });
    }
    set total(value: number) {
        this._description.textContent = `Списано ${value} синапсов`;
    }
}