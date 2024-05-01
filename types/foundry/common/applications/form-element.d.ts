/**
 * An abstract custom HTMLElement designed for use with form inputs.
 * @abstract
 * @template {any} FormInputValueType
 *
 * @fires {Event} input           An "input" event when the value of the input changes
 * @fires {Event} change          A "change" event when the value of the element changes
 */
export abstract class AbstractFormInputElement<FormInputValueType, FormInputReturnValueType = FormInputValueType> extends HTMLElement {
    /**
     * The HTML tag name used by this element.
     */
    static tagName: string;

    /**
     * Declare that this custom element provides form element functionality.
     */
    static formAssociated: boolean;

    /**
     * Attached ElementInternals which provides form handling functionality.
     */
    protected _internals: ElementInternals;

    /**
     * The form this element belongs to.
     */
    get form(): HTMLFormElement;

    /* -------------------------------------------- */
    /*  Element Properties                          */
    /* -------------------------------------------- */

    /**
     * The input element name.
     */
    get name(): string;

    set name(value);

    /* -------------------------------------------- */

    /**
     * The value of the input element.
     * @type {FormInputValueType}
     */
    get value(): FormInputValueType;

    set value(value: FormInputValueType);

    /**
     * The underlying value of the element.
     */
    protected _value: FormInputValueType;

    /* -------------------------------------------- */

    /**
     * Return the value of the input element which should be submitted to the form.
     */
    protected _getValue(): FormInputReturnValueType;

    /* -------------------------------------------- */

    /**
     * Translate user-provided input value into the format that should be stored.
     * @throws {Error}        An error if the provided value is invalid
     */
    protected _setValue(value: FormInputValueType): void;

    /* -------------------------------------------- */

    /**
     * Is this element disabled?
     */
    get disabled(): boolean;

    set disabled(value);

    /* -------------------------------------------- */

    /**
     * Special behaviors that the subclass should implement when toggling the disabled state of the input.
     */
    protected _toggleDisabled(disabled: boolean): void;

    /* -------------------------------------------- */
    /*  Element Lifecycle                           */
    /* -------------------------------------------- */

    /**
     * Initialize the custom element, constructing its HTML.
     */
    connectedCallback(): void;

    /* -------------------------------------------- */

    /**
     * Create the HTML elements that should be included in this custom element.
     * Elements are returned as an array of ordered children.
     */
    protected _buildElements(): HTMLElement[];

    /* -------------------------------------------- */

    /**
     * Refresh the active state of the custom element.
     */
    protected _refresh(): void;

    /* -------------------------------------------- */

    /**
     * Apply key attributes on the containing custom HTML element to input elements contained within it.
     * @internal
     */
    protected _applyInputAttributes(input: HTMLElement): void;

    /* -------------------------------------------- */

    /**
     * Activate event listeners which add dynamic behavior to the custom element.
     */
    protected _activateListeners(): void;

    /* -------------------------------------------- */

    /**
     * Special handling when the custom element is clicked. This should be implemented to transfer focus to an
     * appropriate internal element.
     */
    protected _onClick(event: PointerEvent): void;
}
