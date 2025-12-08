import { Component } from "../base/Component";
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

export class Modal extends Component<object> {
    private _closeButton: HTMLButtonElement;
    private _content: HTMLElement;
    private _handleEscape: (event: KeyboardEvent) => void;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);
        this._closeButton = ensureElement<HTMLButtonElement>('.modal__close', container);
        this._content = ensureElement<HTMLElement>('.modal__content', container);
        this._closeButton.addEventListener('click', () => {
            this.close();
        });
        this.container.addEventListener('click', (event) => {
            if (event.target === this.container) {
                this.close();
            }
        });
        this._handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                this.close();
            }
        };
    }

    set content(value: HTMLElement) {
        this._content.replaceChildren(value);
    }

    open() {
        this.container.classList.add('modal_active');
        document.addEventListener('keydown', this._handleEscape);
        this.events.emit('modal:open');
    }

    close() {
        this.container.classList.remove('modal_active');
        document.removeEventListener('keydown', this._handleEscape);
        this.events.emit('modal:close');
    }
}