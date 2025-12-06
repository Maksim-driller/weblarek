import { Form } from "./Form";
import { IEvents } from '../base/Events';

export class OrderForm extends Form {
    private _cardButton: HTMLButtonElement;
    private _cashButton: HTMLButtonElement;
    private _addressInput: HTMLInputElement;

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);

        this._cardButton = container.querySelector('button[name="card"]') as HTMLButtonElement;
        this._cashButton = container.querySelector('button[name="cash"]') as HTMLButtonElement;
        this._addressInput = container.querySelector('input[name="address"]') as HTMLInputElement;
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
