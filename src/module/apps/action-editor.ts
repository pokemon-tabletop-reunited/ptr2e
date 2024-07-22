import { ItemPTR2e, ItemSystemsWithActions } from "@item";
import Tagify from "@yaireo/tagify";
import { ApplicationV2Expanded } from "./appv2-expanded.ts";
import { htmlQuery, sluggify } from "@utils";

export class ActionEditor<
    TDocument extends ItemPTR2e<ItemSystemsWithActions>,
> extends foundry.applications.api.HandlebarsApplicationMixin(ApplicationV2Expanded) {
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
                submitOnChange: true,
                closeOnSubmit: false,
                handler: ActionEditor.#onSubmit,
            },
            window: {
                minimizable: true,
                resizable: true,
                controls: [
                    {
                        label: "PTR2E.ItemSheet.SendToChatLabel",
                        icon: "fas fa-arrow-up-right-from-square",
                        action: "toChat"
                    },
                    {
                        label: "PTR2E.Actions.OpenItemLabel",
                        icon: "fas fa-suitcase",
                        action: "openItem"
                    },
                    {
                        label: "PTR2E.Actions.CreateVariantLabel",
                        icon: "fas fa-plus",
                        action: "createVariant"
                    },
                    {
                        label: "PTR2E.Actions.VariantOfLabel",
                        icon: "fas fa-burst",
                        action: "openOriginal"
                    },
                    {
                        label: "PTR2E.Actions.DeleteVariantLabel",
                        icon: "fas fa-trash",
                        action: "deleteVariant"
                    }
                ]
            },
            actions: {
                toChat: function toChat<TDocument extends ItemPTR2e<ItemSystemsWithActions>>(this: ActionEditor<TDocument>) {
                    this.document.toChat();
                },
                openItem: function openItem<TDocument extends ItemPTR2e<ItemSystemsWithActions>>(this: ActionEditor<TDocument>) {
                    this.document.sheet.render(true);
                },
                createVariant: async function createVariant<TDocument extends ItemPTR2e<ItemSystemsWithActions>>(this: ActionEditor<TDocument>) {
                    const actions = this.document.system.toObject().actions;
                    const action = actions.find(a => a.slug === this.action.slug);
                    if(!action) return;

                    const variant = fu.duplicate(action);
                    variant.slug += sluggify(`-${fu.randomID()}`);
                    variant.name += ` Variant`;
                    variant.variant = action.slug;
                    actions.push(variant);
                    await this.document.update({ "system.actions": actions });
                    
                    const variantAction = this.document.system.actions.get(variant.slug);
                    if(!variantAction) return;
                    ui.notifications.info(`Created variant of ${action.name}`);

                    const editor = new ActionEditor(this.document, variant.slug);
                    editor.render(true);
                },
                openOriginal: function openOriginal<TDocument extends ItemPTR2e<ItemSystemsWithActions>>(this: ActionEditor<TDocument>) {
                    const original = this.action.original
                    if(!original) return;

                    const editor = new ActionEditor(this.document, original.slug);
                    editor.render(true);
                },
                deleteVariant: async function deleteVariant<TDocument extends ItemPTR2e<ItemSystemsWithActions>>(this: ActionEditor<TDocument>) {
                    const actions = this.document.system.toObject().actions;
                    const index = actions.findIndex(a => a.slug === this.action.slug);
                    if(index === -1) return;
                    const action = actions[index];
                    if(!action.variant) return;

                    foundry.applications.api.DialogV2.confirm({
                        window: {
                            title: game.i18n.localize("PTR2E.Dialog.DeleteAction.Title"),
                        },
                        content: game.i18n.format("PTR2E.Dialog.DeleteAction.Content", { name: action.name }),
                        yes: {
                            callback: async () => {
                                const actions = this.document.system.toObject().actions;
                                const index = actions.findIndex(a => a.slug === action.slug);
                                if(index === -1 || !actions[index].variant) return;

                                actions.splice(index, 1);
                                await this.document.update({ "system.actions": actions });
                                this.close();
                            },
                        },
                    });
                
                }
            }
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
            template: "/systems/ptr2e/templates/apps/action-editor-traits.hbs",
        },
        action: {
            id: "action",
            template: "/systems/ptr2e/templates/apps/action-editor-body.hbs",
            scrollable: [".scroll"],
        },
    };

    document: TDocument;
    actionSlug: string;

    get action() {
        return this.document.system.actions.get(this.actionSlug)!;
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

    override _getHeaderControls(): foundry.applications.api.ApplicationHeaderControlsEntry[] {
        const controls = super._getHeaderControls();
        for(const control of controls) {
            if(!['deleteVariant','openOriginal'].includes(control.action)) continue;
            control.visible = !!this.action.variant
        }
        return controls;
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
            traits,
            enrichedDescription: await TextEditor.enrichHTML(this.action.description),
        };
    }

   static async #onSubmit<TDocument extends ItemPTR2e<ItemSystemsWithActions>>(this: ActionEditor<TDocument>, _event: Event, _element: HTMLFormElement, formData: FormDataExtended) {
        const data = formData.object;

        if (
            "traits" in data &&
            data["traits"] &&
            typeof data["traits"] === "object" &&
            Array.isArray(data["traits"])
        ) {
            // Traits are stored as an array of objects, but we only need the values
            data["traits"] = data["traits"].map((trait: { value: string }) =>
                sluggify(trait.value)
            );
        }
        await this.action.update(data);
   }

    override _attachPartListeners(
        partId: string,
        htmlElement: HTMLElement,
        options: foundry.applications.api.HandlebarsRenderOptions
    ): void {
        super._attachPartListeners(partId, htmlElement, options);

        if(partId === "header") {
            htmlQuery(htmlElement, "img[data-edit]")?.addEventListener("click", (event) => {
                const imgElement = event.currentTarget as HTMLImageElement;
                const attr = imgElement.dataset.edit;
                const current = foundry.utils.getProperty<string | undefined>(this.action, attr!);
                const {img} = ItemPTR2e.getDefaultArtwork(this.document.toObject()) ?? {};
                const fp = new FilePicker({
                    current,
                    type: "image",
                    redirectToRoot: img ? [img] : [],
                    callback: (path: string) => {
                        imgElement.src = path;
                        if(this.options.form?.submitOnChange) this.element.dispatchEvent(new Event("submit", { cancelable: true }));
                    },
                    top: this.position.top + 40,
                    left: this.position.left + 10,
                })
                fp.browse();
            });
        }

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

    // override async _renderFrame(options: foundry.applications.api.HandlebarsRenderOptions) {
    //     const frame = await super._renderFrame(options);

    //     // Add send to chat button
    //     const toChatLabel = game.i18n.localize("PTR2E.ItemSheet.SendToChatLabel");
    //     const toChat = `<button type="button" class="header-control fa-solid fa-arrow-up-right-from-square" data-action="toChat"
    //                             data-tooltip="${toChatLabel}" aria-label="${toChatLabel}"></button>`;
    //     this.window.controls.insertAdjacentHTML("afterend", toChat);

    //     // Add send to chat button
    //     const openItemLabel = game.i18n.localize("PTR2E.Actions.OpenItemLabel");
    //     const openItem = `<button type="button" class="header-control fa-solid fa-suitcase" data-action="toChat"
    //                             data-tooltip="${openItemLabel}" aria-label="${openItemLabel}"></button>`;
    //     this.window.controls.insertAdjacentHTML("afterend", openItem);

    //     // Add send to chat button
    //     const createVariantLabel = game.i18n.localize("PTR2E.Actions.CreateVariantLabel");
    //     const createVariant = `<button type="button" class="header-control fa-solid fa-plus" data-action="createVariant"
    //                             data-tooltip="${createVariantLabel}" aria-label="${createVariantLabel}"></button>`;
    //     this.window.controls.insertAdjacentHTML("afterend", createVariant);

    //     if(this.action.variant) {
    //         const variantOfLabel = game.i18n.localize("PTR2E.Actions.VariantOfLabel");
    //         const variantOfButton = `<button type="button" class="header-control fa-solid fa-arrow-down-to-square" data-action="openOriginal"
    //                                 data-tooltip="${variantOfLabel}" aria-label="${variantOfLabel}"></button>`;
    //         this.window.controls.insertAdjacentHTML("afterend", variantOfButton);

    //         const deleteVariantLabel = game.i18n.localize("PTR2E.Actions.DeleteVariantLabel");
    //         const deleteVariantButton = `<button type="button" class="header-control fa-solid fa-trash" data-action="deleteVariant"
    //                                 data-tooltip="${deleteVariantLabel}" aria-label="${deleteVariantLabel}"></button>`;
    //         this.window.controls.insertAdjacentHTML("afterend", deleteVariantButton);
    //     }
        
    //     return frame;
    // }

    protected override async _onSubmitForm(config: foundry.applications.api.ApplicationFormConfiguration, event: Event | SubmitEvent): Promise<void> {
        event.preventDefault();
        const { handler, closeOnSubmit } = config;
        const element = (event.currentTarget ?? this.element) as HTMLFormElement

        $(element).find("tags ~ input").each((_i, input) => {
            if ((input as HTMLInputElement).value === "") (input as HTMLInputElement).value = "[]";
        });

        const formData = new FormDataExtended(element);
        if (handler instanceof Function) await handler.call(this, event, element, formData);
        if (closeOnSubmit) await this.close();
    }

    get actor() {
        return this.document.actor;
    }

    get item() {
        return this.document
    }

    /** @override */
    override _onFirstRender() {
        if(!this.actor) {
            //@ts-expect-error
            this.item.apps[this.id] = this;
            return;
        }
        //@ts-expect-error
        this.actor.apps[this.id] = this;
    }

    /* -------------------------------------------- */

    /** @override */
    override _onClose() {
        if(!this.actor) {
            //@ts-expect-error
            delete this.item.apps[this.id];
            return;
        }
        //@ts-expect-error
        delete this.actor.apps[this.id];
    }
}