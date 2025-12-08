import { Component } from "../base/Component";
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

export class Page extends Component<object> {
    private _basketButton: HTMLButtonElement;
    private _counter: HTMLElement;
    private _gallery: HTMLElement;
    private _wrapper: HTMLElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this._basketButton = ensureElement<HTMLButtonElement>('.header__basket', container);
        this._counter = ensureElement<HTMLElement>('.header__basket-counter', container);
        this._gallery = ensureElement<HTMLElement>('.gallery', container);
        this._wrapper = ensureElement<HTMLElement>('.page__wrapper', container);

        this._basketButton.addEventListener('click', () => {
            this.events.emit('basket:open');
        });
    }

    set counter(value: number) {
        this._counter.textContent = String(value);
    }

    set catalog(items: HTMLElement[]) {
        this._gallery.replaceChildren(...items);
    }

    set locked(value: boolean) {
        if (value) {
            this._wrapper.classList.add('page__wrapper_locked');
        } else {
            this._wrapper.classList.remove('page__wrapper_locked');
        }
    }
}
