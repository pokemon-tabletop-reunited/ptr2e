import ActiveEffectConfig from "@module/effects/sheet.ts";
import ChangeModel from "../change.ts";
import { createHTMLElement, fontAwesomeIcon, htmlClosest, htmlQuery, htmlQueryAll, isBracketedValue, isObject, tagify } from "@utils";
import * as R from "remeda";
import ActiveEffectPTR2e from "@module/effects/document.ts";
import { ItemPTR2e } from "@item";
import ResolvableValueField from "@module/data/fields/resolvable-value-field.ts";

class ChangeForm<TChange extends ChangeModel = ChangeModel> {
    declare sheet: ActiveEffectConfig;
    declare index: number;
    declare change: TChange;
    declare source: TChange["_source"];
    declare schema: TChange["schema"];
    declare element: HTMLElement;

    /** Tab configuration data */
    protected tabs: ChangeTabData | null = null;
    /** The currently active tab */
    #activeTab: Maybe<string> = null;

    get template() {
        return "/systems/ptr2e/templates/effects/changes/base.hbs";
    }

    /** Base proprety path for the contained change */
    get basePath(): string {
        return `system.changes.${this.index}`;
    }

    constructor(options: ChangeFormOptions<TChange>) {
        this.initialize(options);
    }

    initialize(options: ChangeFormOptions<TChange>) {
        this.sheet = options.sheet;
        this.index = options.index;
        this.change = options.change;
        this.source = this.change.toObject();
        this.schema = this.change.schema;
    }

    get effect(): ActiveEffectPTR2e {
        return this.change.effect;
    }

    get fieldIdPrefix(): string {
        return `field-${this.sheet.id}-${this.index}-`;
    }

    async _prepareContext(): Promise<ChangeFormContext<TChange>> {
        const validationFailures = ((): string[] => {
            const fieldFailures =
                this.change.validationFailures.fields?.asError().getAllFailures() ?? {};
            const jointFailures = this.change.validationFailures.joint
                ? { joint: this.change.validationFailures.joint }
                : {};
            return Object.entries({ ...fieldFailures, ...jointFailures }).map(([key, failure]) => 
                key === "joint"
                    ? failure.message.replace(/^.*Joint Validation Error:\s*/, "")
                    : `${key}: ${failure.message}`
            )
        })();

        return {
            ...R.pick(this, ["index", "change", "source"]),
            effect: this.effect,
            fieldIdPrefix: this.fieldIdPrefix,
            basePath: this.basePath,
            change: this.change,
            fields: this.schema?.fields,
            form: await this.#getFormHelpers(),
            validationFailures,
        };
    }

    async #getFormHelpers() {
        const valueTemplate = await getTemplate(
            "systems/ptr2e/templates/effects/changes/partials/resolvable-value.hbs"
        );
        const bracketsTemplate = await getTemplate(
            "systems/ptr2e/templates/effects/changes/partials/resolvable-brackets.hbs"
        );
        const dropZoneTemplate = await getTemplate(
            "systems/ptr2e/templates/effects/changes/partials/drop-zone.hbs"
        );
        const getResolvableData = (property: string) => {
            const value = fu.getProperty(this.source, property);
            const mode = isBracketedValue(value)
                ? "brackets"
                : isObject(value)
                  ? "object"
                  : "primitive";
            return { value, mode, property, path: `${this.basePath}.${property}` };
        };

        return {
            resolvableValue: (
                property: string,
                options: { hash?: { fileInput?: boolean } } = {}
            ) => {
                return valueTemplate({
                    ...getResolvableData(property),
                    inputId: `${this.fieldIdPrefix}${property}`,
                    fileInput: options.hash?.fileInput ?? false,
                });
            },
            resolvableAddBracket: (property: string) => {
                const data = getResolvableData(property);
                if (data.mode !== "brackets") return "";
                return createHTMLElement("a", {
                    children: [fontAwesomeIcon("plus", { fixedWidth: true })],
                    dataset: { action: "add-bracket", property },
                }).outerHTML;
            },
            resolvableBrackets: (property: string) => {
                return bracketsTemplate(getResolvableData(property));
            },
            dropZone: (dropId: string, dropText: string, dropTooltip?: string) => {
                return dropZoneTemplate({ dropId, dropText, dropTooltip });
            },
        };
    }

    async render(): Promise<string> {
        const context = await this._prepareContext();
        context.template = await renderTemplate(this.template, context)
        return renderTemplate("/systems/ptr2e/templates/effects/changes/partials/outer.hbs", context);
    }

    /**
     * Trigger a rerender of the form when validation fails.
     * This way the user can see and fix the issues before submitting for real.
     **/ 
    async updateValidationErrors(validationFailures: foundry.data.validation.DataModelValidationFailure): Promise<void> {
        const failures = ((): string[] => {
            const sourceFailures = validationFailures?.asError().getAllFailures() ?? {};
            const fieldFailures =
                this.change.validationFailures.fields?.asError().getAllFailures() ?? {};
            const jointFailures = this.change.validationFailures.joint
                ? { joint: this.change.validationFailures.joint }
                : {};
            return Object.entries({ ...sourceFailures, ...fieldFailures, ...jointFailures }).map(([key, failure]) => 
                key === "joint"
                    ? failure.message.replace(/^.*Joint Validation Error:\s*/, "")
                    : `${key}: ${failure.message}`
            )
        })();
        
        const element = htmlQuery(this.sheet.element, `section.effect-change[data-idx="${this.index}"]`);
        if (element) {
            const failuresDiv = htmlQuery(element, ".validation-failures");
            const failuresUL = `<ul>${failures.map(message => `<li><span>${message}</span></li>`).join('')}</ul>`
            if(failuresDiv) {
                failuresDiv.innerHTML = failuresUL;
            }
            else {
                element.insertAdjacentHTML("beforeend", `<div class="validation-failures">${failuresUL}</div>`);
            }
        }
    }

    /**
     * Helper to update the effect with the new change data.
     * This function exists because array updates in foundry are currently clunky
     */
    async updateItem(updates: Partial<TChange["_source"]> | Record<string, unknown>): Promise<void> {
        const changes = this.effect.toObject().system.changes;
        const result = fu.mergeObject(this.source, updates, {performDeletions: true});
        if(this.schema) {
            cleanDataUsingSchema(this.schema.fields, result);
        }
        changes[this.index] = result as ChangeModel;
        await this.effect.update({ "system.changes": changes });
    }

    activateListeners(html: HTMLElement): void {
        this.element = html;

        // Tagify selectors lists
        const selectorElement = htmlQuery<HTMLInputElement>(html, ".selector-list");
        tagify(selectorElement);

        // Add event listener for priority. This exists because normal form submission won't work for text-area forms
        const priorityInput = htmlQuery<HTMLInputElement>(html, ".change-element-header .priority input");
        priorityInput?.addEventListener("change", (event) => {
            event.stopPropagation();
            const value = priorityInput.value;
            if (value === "" || Number.isNaN(Number(value))) {
                this.updateItem({ "-=priority": null });
            } else {
                this.updateItem({ priority: Number(value) });
            }
        });

        for (const button of htmlQueryAll(html, "[data-action=toggle-brackets]")) {
            button.addEventListener("click", () => {
                const property = button.dataset.property ?? "value";
                const value = fu.getProperty(this.source, property);
                if (isBracketedValue(value)) {
                    this.updateItem({ [property]: "" });
                } else {
                    this.updateItem({ [property]: { brackets: [{ value: "" }] } });
                }
            });
        }

        for (const button of htmlQueryAll(html, "[data-action=add-bracket]")) {
            const property = button.dataset.property ?? "value";
            button.addEventListener("click", () => {
                const value = fu.getProperty(this.source, property);
                if (isBracketedValue(value)) {
                    value.brackets.push({ value: "" });
                    this.updateItem({ [property]: value });
                }
            });
        }

        for (const button of htmlQueryAll(html, "[data-action=delete-bracket]")) {
            const property = button.dataset.property ?? "value";
            button.addEventListener("click", () => {
                const value = fu.getProperty(this.source, property);
                const idx = Number(htmlClosest(button, "[data-idx]")?.dataset.idx);
                if (isBracketedValue(value)) {
                    value.brackets.splice(idx, 1);
                    this.updateItem({ [property]: value });
                }
            });
        }

        if (this.tabs) {
            for (const anchor of htmlQueryAll(html, "a[data-change-tab]")) {
                anchor.addEventListener("click", () => {
                    this.activateTab(html, anchor.dataset.changeTab);
                });
            }
            this.activateTab(html, this.#activeTab);
        }

        for (const dropZone of htmlQueryAll(html, "div.change-drop-zone")) {
            dropZone.addEventListener("drop", (event) => {
                this.onDrop(event, dropZone);
            });
        }
    }

    protected async onDrop(event: DragEvent, _element: HTMLElement): Promise<ItemPTR2e | null> {
        const data = event.dataTransfer?.getData("text/plain");
        if (!data) return null;
        const item = await ItemPTR2e.fromDropData(JSON.parse(data));
        return item ?? null;
    }

    protected activateTab(html: HTMLElement, tabName: Maybe<string>): void {
        if (!this.tabs) return;
        const activeTab = tabName ?? this.tabs.names.at(0);
        if (!activeTab || !this.tabs.names.includes(activeTab)) return;
        this.#activeTab = activeTab;

        for (const element of htmlQueryAll(html, "[data-change-tab]")) {
            if (element.dataset.changeTab === activeTab) {
                element.classList.add("active");
                if (element.tagName !== "A") {
                    element.style.display = this.tabs.displayStyle;
                }
            } else {
                element.classList.remove("active");
                if (element.tagName !== "A") {
                    element.style.display = "none";
                }
            }
        }
    }

    updateObject(source: TChange["_source"]): void {
        // If the entire thing is a string, this is a regular JSON textarea
        if (typeof source === "string") {
            try {
                this.source = fu.mergeObject(this.source, JSON.parse(source), {inplace: false});
            } catch (error) {
                if (error instanceof Error) {
                    ui.notifications.error(
                        game.i18n.format("PTR2E.EffectSheet.ChangeEditor.Errors.ChangeSyntax", { message: error.message }),
                    );
                    console.warn("Syntax error in rule element definition.", error.message, source);
                    throw error; // prevent update, to give the user a chance to correct, and prevent bad data
                }
            }

            return;
        }

        source = fu.mergeObject(this.source, source, {inplace: false});

        // Prevent wheel events on the sliders from spamming updates
        for (const slider of htmlQueryAll<HTMLInputElement>(this.element, "input[type=range")) {
            slider.style.pointerEvents = "none";
        }

        // Predicate is special cased as always json. Later on extend such parsing to more things
        cleanPredicate(source);

        if (this.schema) {
            cleanDataUsingSchema(this.schema.fields, source);
        }

        // Update our reference so that equality matching works on the next data prep cycle
        // This allows form reuse to occur
        this.source = source;
    }
}

/** Recursively clean and remove all fields that have a default value */
function cleanDataUsingSchema(schema: Record<string, foundry.data.fields.DataField>, data: Record<string, unknown>): void {
    const { fields } = foundry.data;

    // Removes the field if it is the initial value.
    // It may merge with the initial value to handle cases where the values where cleaned recursively
    const deleteIfInitial = (key: string, field: foundry.data.fields.DataField): boolean => {
        if(["type"].includes(key)) return false;
        if (data[key] === undefined) return true;
        if(field.options.required ?? ('element' in field ? (field as {element: foundry.data.fields.DataField})?.element?.options.required : false)) return false;
        const initialValue = typeof field.initial === "function" ? field.initial(data) : field.initial;
        const valueRaw = data[key];
        const value = R.isObject(valueRaw) && R.isObject(initialValue) ? { ...initialValue, ...valueRaw } : valueRaw;
        const isInitial = R.equals(initialValue, value);
        if (isInitial) delete data[key];
        return !(key in data);
    };

    for (const [key, field] of Object.entries(schema)) {
        if (deleteIfInitial(key, field)) continue;

        if (field instanceof ResolvableValueField) {
            data[key] = field.clean(data[key]);
            deleteIfInitial(key, field);
            continue;
        }

        if ("fields" in field) {
            const value = data[key];
            if (R.isObject(value)) {
                cleanDataUsingSchema(field.fields as Record<string, foundry.data.fields.DataField>, value);
                deleteIfInitial(key, field);
                continue;
            }
        }

        if (field instanceof fields.ArrayField && field.element instanceof fields.SchemaField) {
            const value = data[key];
            if (Array.isArray(value)) {
                // Recursively clean schema fields inside an array
                for (const data of value) {
                    if (R.isObject(data)) {
                        if (data.predicate) {
                            cleanPredicate(data);
                        }
                        cleanDataUsingSchema(field.element.fields, data);
                    }
                }
                continue;
            }
        }

        // Allow certain field types to clean the data. Unfortunately we cannot do it to all.
        // Arrays need to allow string inputs (some selectors) and StrictArrays are explodey
        // The most common benefit from clean() is handling things like the "blank" property
        if (field instanceof fields.StringField) {
            data[key] = field.clean(data[key], {});
            deleteIfInitial(key, field);
        }
    }
}

function cleanPredicate(source: { predicate?: unknown }) {
    const predicateValue = source.predicate;
    if (typeof predicateValue === "string") {
        if (predicateValue.trim() === "") {
            delete source.predicate;
        } else {
            try {
                source.predicate = JSON.parse(predicateValue);
            } catch (error) {
                if (error instanceof Error) {
                    ui.notifications.error(
                        game.i18n.format("PTR2E.EffectSheet.ChangeEditor.Errors.ChangeSyntax", { message: error.message }),
                    );
                    throw error; // prevent update, to give the user a chance to correct, and prevent bad data
                }
            }
        }
    }
}

type ChangeTabData = {
    /** Valid tab names for this form */
    names: string[];
    /** The display style applied to active tabs */
    displayStyle: "block" | "flex" | "grid";
};

interface ChangeFormContext<TChange extends ChangeModel>
    extends Omit<ChangeFormOptions<TChange>, "sheet"> {
    effect: ActiveEffectPTR2e;
    /** A prefix for use in label-input/select pairs */
    fieldIdPrefix: string;
    basePath: string;
    fields: TChange["schema"]["fields"];
    /** A collection of additional handlebars functions */
    form: Record<string, unknown>;
    validationFailures: string[];
    template?: string;
}

interface ChangeFormOptions<TChange extends ChangeModel = ChangeModel> {
    sheet: ActiveEffectConfig;
    index: number;
    change: TChange;
}

export default ChangeForm;
export type { ChangeFormOptions, ChangeFormContext, ChangeTabData };