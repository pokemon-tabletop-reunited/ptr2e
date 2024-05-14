import { ActionPTR2e } from "@data";
import { ItemPTR2e, ItemSystemsWithActions } from "@item";
import Tagify from "@yaireo/tagify";

export class ActionEditor<
    TDocument extends ItemPTR2e<ItemSystemsWithActions>,
> extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
    static override DEFAULT_OPTIONS = fu.mergeObject(
        super.DEFAULT_OPTIONS,
        {
            tag: "form",
            classes: ["sheet action-sheet"],
            position: {
                height: 750,
                width: 500,
            },
            form: {
                submitOnChange: false,
                closeOnSubmit: false,
            },
            window: {
                minimizable: true,
                resizable: true,
            },
        },
        { inplace: false }
    );

    #allTraits: { value: string; label: string }[] | undefined;

    static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
        header: {
            id: "header",
            template: "/systems/ptr2e/templates/apps/action-editor-header.hbs",
        },
        traits: {
            id: "traits",
            template: "/systems/ptr2e/templates/items/parts/item-traits.hbs",
        },
        action: {
            id: "action",
            template: "/systems/ptr2e/templates/apps/action-editor-body.hbs",
            scrollable: [".scroll"],
        },
    };

    document: TDocument;
    actionSlug: string;
    private _action: ActionPTR2e | null = null;

    get action() {
        return (this._action ??= this.document.system.actions.get(this.actionSlug) ?? null)!;
    }

    override get title() {
        return `${this.document.name}'s Action - ${this.action.name}`;
    }

    constructor(document: TDocument, actionSlug: string, options: Partial<foundry.applications.api.ApplicationConfiguration> = {}) {
        options.id = `action-editor-${document.uuid}-${actionSlug}`;
        super(options);
        this.document = document;
        this.actionSlug = actionSlug;

        if(!this.action) throw new Error(`Action ${actionSlug} not found on item ${document.name}`);
    }

    override async _prepareContext() {
        const traits = (() => {
            if ("traits" in this.action) {
                const traits = [];
                for (const trait of this.action.traits) {
                    traits.push({
                        value: trait.slug,
                        label: trait.label,
                    });
                }
                return traits;
            }
            return [];
        })();

        this.#allTraits = game.ptr.data.traits.map((trait) => ({ value: trait.slug, label: trait.label }));

        return {
            document: this.document,
            action: this.action,
            source: this.action.toObject(),
            fields: this.action.schema.fields,
            traits
        };
    }

    // override _prepareSubmitData(
    //     event: SubmitEvent,
    //     form: HTMLFormElement,
    //     formData: FormDataExtended
    // ): Record<string, unknown> {
    //     const submitData = super._prepareSubmitData(event, form, formData);

    //     if (
    //         "system" in submitData &&
    //         submitData.system &&
    //         typeof submitData.system === "object" &&
    //         "traits" in submitData.system &&
    //         Array.isArray(submitData.system.traits)
    //     )
    //         // Traits are stored as an array of objects, but we only need the values
    //         submitData.system.traits = submitData.system.traits.map((trait: { value: string }) =>
    //             sluggify(trait.value)
    //         );

    //     return submitData;
    // }

    override _attachPartListeners(
        partId: string,
        htmlElement: HTMLElement,
        options: foundry.applications.api.HandlebarsRenderOptions
    ): void {
        super._attachPartListeners(partId, htmlElement, options);

        if (partId === "traits") {
            for (const input of htmlElement.querySelectorAll<HTMLInputElement>(
                "input.ptr2e-tagify"
            )) {
                new Tagify(input, {
                    enforceWhitelist: false,
                    keepInvalidTags: false,
                    editTags: false,
                    tagTextProp: "label",
                    dropdown: {
                        enabled: 0,
                        mapValueTo: "label",
                    },
                    templates: {
                        tag: function (tagData): string {
                            return `
                            <tag contenteditable="false" spellcheck="false" tabindex="-1" class="tagify__tag" ${this.getAttributes(
                                tagData
                            )}>
                            <x title="" class="tagify__tag__removeBtn" role="button" aria-label="remove tag"></x>
                            <div>
                                <span class='tagify__tag-text'>
                                    <span class="trait" data-tooltip-direction="UP" data-trait="${
                                        tagData.value
                                    }" data-tooltip="${
                                        tagData.label
                                    }"><span>[</span><span class="tag">${
                                        tagData.label
                                    }</span><span>]</span></span>
                                </span>
                            </div>
                            `;
                        },
                    },
                    whitelist: this.#allTraits,
                });
            }
        }
    }

    // override _onRender(): void {
    //     for (const stringTags of this.element.querySelectorAll<HTMLElement>("string-tags")) {
    //         const path = stringTags.getAttribute("name");
    //         const validate = (() => {
    //             if (path?.startsWith("system.")) {
    //                 const systemPath = path.split(".");
    //                 if (systemPath.length === 2) {
    //                     const field = this.document.system.schema.fields[
    //                         systemPath[1]
    //                     ] as foundry.data.fields.SetField<foundry.data.fields.StringField>;
    //                     return field.element.validate.bind(field.element);
    //                 }
    //                 let current = this.document.system.schema.fields;
    //                 const pathParts = systemPath.slice(1);
    //                 for (let i = 0; i < pathParts.length; i++) {
    //                     let field = current[pathParts[i]] as
    //                         | foundry.data.fields.SetField<foundry.data.fields.StringField>
    //                         | foundry.data.fields.SchemaField<foundry.data.fields.DataSchema>;
    //                     if (!field) return;
    //                     if (field instanceof foundry.data.fields.SchemaField) {
    //                         current = field.fields;
    //                         continue;
    //                     }
    //                     if (field instanceof foundry.data.fields.SetField) {
    //                         return field.element.validate.bind(field.element);
    //                     }
    //                     return null;
    //                 }
    //             }
    //             return null;
    //         })();

    //         // @ts-expect-error
    //         let refresh = stringTags._refresh.bind(stringTags);

    //         // @ts-expect-error
    //         stringTags._refresh = () => {
    //             refresh.call();
    //             this.element.dispatchEvent(new Event("submit", { cancelable: true }));
    //         };

    //         //@ts-expect-error
    //         stringTags._validateTag = (tag: string): boolean => {
    //             if (validate) {
    //                 const result = validate(tag);
    //                 if (result) throw result.asError();
    //             }
    //             return true;
    //         };
    //     }
    // }

    // protected override async _onSubmitForm(
    //     config: foundry.applications.api.ApplicationFormConfiguration,
    //     event: Event | SubmitEvent
    // ): Promise<void> {
    //     event.preventDefault();
    //     if (event.target) {
    //         const target = event.target as HTMLElement;
    //         if (target.parentElement?.nodeName === "STRING-TAGS") {
    //             event.stopImmediatePropagation();
    //             return;
    //         }
    //     }
    //     return super._onSubmitForm(config, event);
    // }
}