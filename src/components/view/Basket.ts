import { Component } from "../base/Component";
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

export class Basket extends Component<object> {
    private _list: HTMLElement;
    private _total: HTMLElement;
    private _button: HTMLButtonElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this._list = ensureElement<HTMLElement>('.basket__list', container);
        this._total = ensureElement<HTMLElement>('.basket__price', container);
        this._button = ensureElement<HTMLButtonElement>('.basket__button', container);
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
