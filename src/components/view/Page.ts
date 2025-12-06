import { Component } from "../base/Component";
import { IEvents } from '../base/Events';

export class Page extends Component<object> {
    private _basketButton: HTMLButtonElement;
    private _counter: HTMLElement;
    private _gallery: HTMLElement;
    private _wrapper: HTMLElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this._basketButton = container.querySelector('.header__basket') as HTMLButtonElement;
        this._counter = container.querySelector('.header__basket-counter') as HTMLElement;
        this._gallery = container.querySelector('.gallery') as HTMLElement;
        this._wrapper = container.querySelector('.page__wrapper') as HTMLElement;

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
