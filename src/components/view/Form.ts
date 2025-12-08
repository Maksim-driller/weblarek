import { Component } from "../base/Component";
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

export abstract class Form extends Component<object> {
    protected _submit: HTMLButtonElement;
    protected _errors: HTMLElement;

    constructor(protected container: HTMLFormElement, protected events: IEvents) {
        super(container);

        this._submit = ensureElement<HTMLButtonElement>('button[type=submit]', container);
        this._errors = ensureElement<HTMLElement>('.form__errors', container);
        this.container.addEventListener('input', (event: Event) => {
            const target = event.target as HTMLInputElement;
            const field = target.name;
            const value = target.value;
            this.events.emit(`${this.container.name}:input`, { field, value });
        });
        this.container.addEventListener('submit', (event: Event) => {
            event.preventDefault();
            this.events.emit(`${this.container.name}:submit`);
        });
    }

    set valid(value: boolean) {
        this._submit.disabled = !value;
    }

    set errors(value: string) {
        this._errors.textContent = value;
    }
}
