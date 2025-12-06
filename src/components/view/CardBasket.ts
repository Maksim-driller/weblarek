import { Card } from "./Card";
import { IEvents } from '../base/Events';

export class CardBasket extends Card {
    private _index: HTMLElement;
    private _deleteButton: HTMLButtonElement;

    constructor(container: HTMLElement, events: IEvents) {
        super(container, events);

        this._index = container.querySelector('.basket__item-index') as HTMLElement;
        this._deleteButton = container.querySelector('.basket__item-delete') as HTMLButtonElement;

        // Клик на кнопку удаления
        this._deleteButton.addEventListener('click', () => {
            this.events.emit('basket:remove', { id: this._id });
        });
    }

    set index(value: number) {
        this._index.textContent = String(value);
    }
}
