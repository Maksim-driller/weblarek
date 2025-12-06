import { Component } from "../base/Component";
import { IEvents } from '../base/Events';

export abstract class Form extends Component<object> {
    protected _submit: HTMLButtonElement;
    protected _errors: HTMLElement;

    constructor(protected container: HTMLFormElement, protected events: IEvents) {
        super(container);

        this._submit = container.querySelector('button[type=submit]') as HTMLButtonElement;
        this._errors = container.querySelector('.form__errors') as HTMLElement;

        // Слушатель изменения полей формы
        this.container.addEventListener('input', (event: Event) => {
            const target = event.target as HTMLInputElement;
            const field = target.name;
            const value = target.value;
            this.events.emit(`${this.container.name}:input`, { field, value });
        });

        // Слушатель отправки формы
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
