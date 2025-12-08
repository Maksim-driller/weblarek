import { Form } from "./Form";
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

export class OrderForm extends Form {
    private _cardButton: HTMLButtonElement;
    private _cashButton: HTMLButtonElement;
    private _addressInput: HTMLInputElement;

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);

        this._cardButton = ensureElement<HTMLButtonElement>('button[name="card"]', container);
        this._cashButton = ensureElement<HTMLButtonElement>('button[name="cash"]', container);
        this._addressInput = ensureElement<HTMLInputElement>('input[name="address"]', container);
        this._cardButton.addEventListener('click', () => {
            this.payment = 'card';
            this.events.emit('order:payment', { payment: 'card' });
        });

        this._cashButton.addEventListener('click', () => {
            this.payment = 'cash';
            this.events.emit('order:payment', { payment: 'cash' });
        });
    }

    set payment(value: 'card' | 'cash') {
        this._cardButton.classList.remove('button_alt-active');
        this._cashButton.classList.remove('button_alt-active');
        if (value === 'card') {
            this._cardButton.classList.add('button_alt-active');
        } else {
            this._cashButton.classList.add('button_alt-active');
        }
    }

    set address(value: string) {
        this._addressInput.value = value;
    }
}
