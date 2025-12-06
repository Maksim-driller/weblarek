import { Component } from "../base/Component";
import { IEvents } from '../base/Events';

export class Basket extends Component<object> {
    private _list: HTMLElement;
    private _total: HTMLElement;
    private _button: HTMLButtonElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this._list = container.querySelector('.basket__list') as HTMLElement;
        this._total = container.querySelector('.basket__price') as HTMLElement;
        this._button = container.querySelector('.basket__button') as HTMLButtonElement;
        this._button.addEventListener('click', () => {
            this.events.emit('basket:order');
        });
    }

    set items(items: HTMLElement[]) {
        this._list.replaceChildren(...items);
    }

    set total(value: number) {
        this._total.textContent = `${value} синапсов`;
    }

    disableButton(state: boolean) {
        this._button.disabled = state;
    }
}
