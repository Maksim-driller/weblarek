import { Card } from "./Card";
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

export class CardBasket extends Card {
    private _index: HTMLElement;
    private _deleteButton: HTMLButtonElement;

    constructor(container: HTMLElement, events: IEvents) {
        super(container, events);
        this._index = ensureElement<HTMLElement>('.basket__item-index', container);
        this._deleteButton = ensureElement<HTMLButtonElement>('.basket__item-delete', container);
        this._deleteButton.addEventListener('click', () => {
            this.events.emit('basket:remove', { id: this._id });
        });
    }

    set index(value: number) {
        this._index.textContent = String(value);
    }
}
