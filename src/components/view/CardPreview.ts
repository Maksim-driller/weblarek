import { Card } from "./Card";
import { IEvents } from '../base/Events';
import { categoryMap } from "../../utils/constants";
import { ensureElement } from '../../utils/utils';

export class CardPreview extends Card {
    private _image: HTMLImageElement;
    private _category: HTMLElement;
    private _description: HTMLElement;
    private _button: HTMLButtonElement;

    constructor(container: HTMLElement, events: IEvents) {
        super(container, events);

        this._image = ensureElement<HTMLImageElement>('.card__image', container);
        this._category = ensureElement<HTMLElement>('.card__category', container);
        this._description = ensureElement<HTMLElement>('.card__text', container);
        this._button = ensureElement<HTMLButtonElement>('.card__button', container);
        this._button.addEventListener('click', () => {
            this.events.emit('card:toBasket', { id: this._id });
        });
    }

    set image(value: string) {
        this._image.src = value;
        this._image.alt = this._title?.textContent || '';
    }

    set category(value: string) {
        this._category.textContent = value;
        const categoryClass = categoryMap[value as keyof typeof categoryMap];
        if (categoryClass) {
            this._category.className = `card__category ${categoryClass}`;
        }
    }

    set description(value: string) {
        this._description.textContent = value;
    }

    set buttonText(value: string) {
        this._button.textContent = value;
    }

    disableButton(state: boolean) {
        this._button.disabled = state;
    }
}
