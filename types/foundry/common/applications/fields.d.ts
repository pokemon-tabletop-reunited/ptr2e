import { FormInputConfig } from "../data/fields.js";

/**
 * Apply standard attributes to all input elements.
 * @param {HTMLElement} input           The element being configured
 * @param {FormInputConfig<*>} config   Configuration for the element
 */
export function setInputAttributes(input: HTMLElement, config: FormInputConfig): void;