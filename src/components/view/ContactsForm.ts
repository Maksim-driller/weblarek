import { Form } from "./Form";
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

export class ContactsForm extends Form {
    private _emailInput: HTMLInputElement;
    private _phoneInput: HTMLInputElement;

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);

        this._emailInput = ensureElement<HTMLInputElement>('input[name="email"]', container);
        this._phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', container);
    }

    set email(value: string) {
        this._emailInput.value = value;
    }

    set phone(value: string) {
        this._phoneInput.value = value;
    }
}
