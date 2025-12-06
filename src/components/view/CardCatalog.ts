import { Card } from "./Card";
import { IEvents } from '../base/Events';
import { categoryMap } from "../../utils/constants";

export class CardCatalog extends Card {
    private _category: HTMLElement;
    private _image: HTMLImageElement;
    private _button: HTMLButtonElement;

    constructor(container: HTMLElement, events: IEvents) {
        super(container, events);

        this._category = container.querySelector('.card__category') as HTMLElement;
        this._image = container.querySelector('.card__image') as HTMLImageElement;
        this._button = container.querySelector('.card__button') as HTMLButtonElement;

        // Клик на карточку (не на кнопку)
        container.addEventListener('click', (event) => {
            if (event.target !== this._button) {
                this.events.emit('card:select', { id: this._id });
            }
        });

        // Клик на кнопку "Купить"
        this._button.addEventListener('click', (event) => {
            event.stopPropagation();
            this.events.emit('card:add', { id: this._id });
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
