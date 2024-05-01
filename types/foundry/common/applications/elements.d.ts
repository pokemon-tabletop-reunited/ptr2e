import { FormInputConfig } from "../data/fields.js";
import { AbstractFormInputElement } from "./form-element.ts";

/**
 * A custom HTML element which allows for arbitrary assignment of a set of string tags.
 * This element may be used directly or subclassed to impose additional validation or functionality.
 * @extends {AbstractFormInputElement<Set<string>>}
 */
export class HTMLStringTagsElement<SType = string> extends AbstractFormInputElement<Set<SType>, SType[]> {
    static override tagName: string;

    static icons: { add: string; remove: string };
    static labels: { add: string; remove: string; placeholder: string };

    /* -------------------------------------------- */

    /**
     * Initialize innerText or an initial value attribute of the element as a comma-separated list of currently assigned
     * string tags.
     */
    protected _initializeTags(): void;

    /* -------------------------------------------- */

    /**
     * Subclasses may impose more strict validation on what tags are allowed.
     * @param {string} tag      A candidate tag
     * @throws {Error}          An error if the candidate tag is not allowed
     */
    protected _validateTag(tag: string): void;

    /* -------------------------------------------- */

    /** @override */
    protected override _buildElements(): HTMLElement[];

    /* -------------------------------------------- */

    /** @override */
    protected override _refresh(): void;

    /* -------------------------------------------- */

    /**
     * Render the HTML fragment used to represent a tag.
     * @param {string} tag      The raw tag value
     * @returns {string}        An HTML string for the tag
     */
    static renderTag(tag: any): string | Promise<string>;

    /* -------------------------------------------- */

    protected override _activateListeners(): void;

    /* -------------------------------------------- */
    /*  Form Handling                               */
    /* -------------------------------------------- */

    protected override _getValue(): SType[];

    /* -------------------------------------------- */

    protected override _setValue(value: Set<SType>): void;

    /* -------------------------------------------- */

    protected override _toggleDisabled(disabled: boolean): void;

    /* -------------------------------------------- */

    /**
     * Create a HTMLStringTagsElement using provided configuration data.
     * @param {FormInputConfig<string>} config
     */
    static create(config: FormInputConfig<any>): HTMLStringTagsElement<any>;
}
