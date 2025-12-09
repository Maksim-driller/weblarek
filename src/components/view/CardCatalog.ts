import { Card } from "./Card";
import { IEvents } from '../base/Events';
import { categoryMap } from "../../utils/constants";
import { ensureElement } from '../../utils/utils';

export class CardCatalog extends Card {
    private _category: HTMLElement;
    private _image: HTMLImageElement;
    private _button: HTMLButtonElement;

    constructor(container: HTMLElement, events: IEvents) {
        super(container, events);

        this._category = ensureElement<HTMLElement>('.card__category', container);
        this._image = ensureElement<HTMLImageElement>('.card__image', container);
        this._button = ensureElement<HTMLButtonElement>('.card__button', container);
        container.addEventListener('click', () => {
            this.events.emit('card:select', { id: this._id });
        });
    }

    set category(value: string) {
        this._category.textContent = value;
        const categoryClass = categoryMap[value as keyof typeof categoryMap];
        if (categoryClass) {
            this._category.className = `card__category ${categoryClass}`;
        }
    }

    set image(value: string) {
        this._image.src = value;
        this._image.alt = this._title?.textContent || '';
    }

    disableButton(state: boolean) {
        this._button.disabled = state;
    }
}
