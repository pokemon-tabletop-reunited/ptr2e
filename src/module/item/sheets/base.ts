import { ItemPTR2e, ItemSystemPTR, ItemSystemsWithActions } from "@item";
import { htmlQueryAll, sluggify } from "@utils";
import { DocumentSheetConfiguration, DocumentSheetV2, Tab } from "./document.ts";
import Tagify from "@yaireo/tagify";
import GithubManager from "@module/apps/github.ts";
import { ActiveEffectPTR2e } from "@effects";
import { ActionEditor } from "@module/apps/action-editor.ts";

export default class ItemSheetPTR2eV2<
    TSystem extends ItemSystemPTR,
> extends foundry.applications.api.HandlebarsApplicationMixin(DocumentSheetV2<ItemPTR2e>) {
    static override DEFAULT_OPTIONS = fu.mergeObject(
        super.DEFAULT_OPTIONS,
        {
            classes: ["move-sheet"],
            position: {
                height: 500,
                width: 550,
            },
            actions: {
                toChat: this.#toChat,
                toGithub: GithubManager.commitItemToGithub,
            },
            form: {
                submitOnChange: true,
                closeOnSubmit: false,
            },
            window: {
                minimizable: true,
                resizable: true,
            },
        },
        { inplace: false }
    );

    // Settings for child classes to override
    static readonly overviewTemplate: string = "";
    static readonly detailsTemplate: string = "";
    readonly noActions: boolean = false;

    #allTraits: { value: string; label: string }[] | undefined;

    static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
        header: {
            id: "header",
            template: "/systems/ptr2e/templates/items/parts/item-header.hbs",
        },
        tabs: {
            id: "tabs",
            template: "/systems/ptr2e/templates/items/parts/item-tabs.hbs",
        },
        traits: {
            id: "traits",
            template: "/systems/ptr2e/templates/items/parts/item-traits.hbs",
        },
        overview: {
            id: "overview",
            template: this.overviewTemplate,
            scrollable: [".scroll"],
        },
        details: {
            id: "details",
            template: this.detailsTemplate,
            scrollable: [".scroll"],
        },
        actions: {
            id: "actions",
            template: "/systems/ptr2e/templates/items/parts/item-actions.hbs",
            scrollable: [".scroll"],
        },
        effects: {
            id: "effects",
            template: "/systems/ptr2e/templates/items/parts/item-effects.hbs",
            scrollable: [".scroll"],
        },
    };

    tabGroups: Record<string, string> = {
        sheet: "overview",
    };

    tabs: Record<string, Tab> = {
        overview: {
            id: "overview",
            group: "sheet",
            icon: "fa-solid fa-house",
            label: "PTR2E.ItemSheet.Tabs.overview.label",
        },
        details: {
            id: "details",
            group: "sheet",
            icon: "fa-solid fa-cogs",
            label: "PTR2E.ItemSheet.Tabs.details.label",
        },
        actions: {
            id: "actions",
            group: "sheet",
            icon: "fa-solid fa-bullseye",
            label: "PTR2E.ItemSheet.Tabs.actions.label",
        },
        effects: {
            id: "effects",
            group: "sheet",
            icon: "fa-solid fa-star",
            label: "PTR2E.ItemSheet.Tabs.effects.label",
        },
    };

    _getTabs() {
        if (this.noActions) delete this.tabs.actions;
        for (const v of Object.values(this.tabs)) {
            v.active = this.tabGroups[v.group] === v.id;
            v.cssClass = v.active ? "active" : "";
        }
        return this.tabs;
    }

    override async _prepareContext() {
        const traits = (() => {
            if ("traits" in this.document.system) {
                const traits = [];
                for (const trait of this.document.system.traits) {
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

        const effects = this.document.effects.contents;

        return {
            ...((await super._prepareContext()) as Record<string, unknown>),
            item: this.document,
            source: this.document.toObject(),
            fields: this.document.system.schema.fields,
            tabs: this._getTabs(),
            traits,
            effects,
        };
    }

    override _prepareSubmitData(
        event: SubmitEvent,
        form: HTMLFormElement,
        formData: FormDataExtended
    ): Record<string, unknown> {
        const submitData = super._prepareSubmitData(event, form, formData);

        if (
            "system" in submitData &&
            submitData.system &&
            typeof submitData.system === "object" &&
            "traits" in submitData.system &&
            Array.isArray(submitData.system.traits)
        )
            // Traits are stored as an array of objects, but we only need the values
            submitData.system.traits = submitData.system.traits.map((trait: { value: string }) =>
                sluggify(trait.value)
            );

        return submitData;
    }

    override async _renderFrame(options: DocumentSheetConfiguration<ItemPTR2e<TSystem>>) {
        const frame = await super._renderFrame(options);

        // Add send to chat button
        const toChatLabel = game.i18n.localize("PTR2E.ItemSheet.SendToChatLabel");
        const toChat = `<button type="button" class="header-control fa-solid fa-arrow-up-right-from-square" data-action="toChat"
                                data-tooltip="${toChatLabel}" aria-label="${toChatLabel}"></button>`;
        this.window.controls.insertAdjacentHTML("afterend", toChat);

        if (game.settings.get("ptr2e", "dev-mode")) {
            // Add send to chat button
            const commitToGithubLabel = game.i18n.localize("PTR2E.UI.DevMode.CommitToGithub.Label");
            const commitToGithub = `<button type="button" class="header-control fa-solid fa-upload" data-action="toGithub"
                                    data-tooltip="${commitToGithubLabel}" aria-label="${commitToGithubLabel}"></button>`;
            this.window.controls.insertAdjacentHTML("afterend", commitToGithub);
        }

        return frame;
    }

    override _attachFrameListeners(): void {
        super._attachFrameListeners();
        this.element.addEventListener("drop", this._onDrop.bind(this));
    }

    override _attachPartListeners(
        partId: string,
        htmlElement: HTMLElement,
        options: DocumentSheetConfiguration<ItemPTR2e<TSystem>>
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

        if (partId === "effects") {
            for (const element of htmlQueryAll(htmlElement, ".item-controls .effect-to-chat")) {
                element.addEventListener("click", async (event) => {
                    const effectId = (
                        (event.currentTarget as HTMLElement)?.closest(".effect") as HTMLElement
                    )?.dataset.id;
                    if (!effectId) return;
                    return (
                        this.document.effects.get(effectId) as ActiveEffectPTR2e<ItemPTR2e<TSystem>>
                    )?.toChat();
                });
            }

            for (const element of htmlQueryAll(htmlElement, ".item-controls .effect-edit")) {
                element.addEventListener("click", async (event) => {
                    const effectId = (
                        (event.currentTarget as HTMLElement)?.closest(".effect") as HTMLElement
                    )?.dataset.id;
                    if (!effectId) return;
                    return (
                        this.document.effects.get(effectId) as ActiveEffectPTR2e<ItemPTR2e<TSystem>>
                    )?.sheet?.render(true);
                });
            }

            for (const element of htmlQueryAll(htmlElement, ".item-controls .effect-delete")) {
                element.addEventListener("click", async (event) => {
                    const effectId = (
                        (event.currentTarget as HTMLElement)?.closest(".effect") as HTMLElement
                    )?.dataset.id;
                    const effect = this.document.effects.get(effectId!);
                    if (!effect) return;

                    // Confirm the deletion unless the user is holding Shift
                    return event.shiftKey
                        ? effect.delete()
                        : foundry.applications.api.DialogV2.confirm({
                              yes: {
                                  callback: () => effect.delete(),
                              },
                              content: game.i18n.format("PTR2E.Dialog.DeleteDocumentContent", {
                                  name: effect.name,
                              }),
                              window: {
                                  title: game.i18n.format("PTR2E.Dialog.DeleteDocumentTitle", {
                                      name: effect.name,
                                  }),
                              },
                          });
                });
            }
        }

        if (partId === "actions") {
            const addButton = htmlElement.querySelector(".actions a[data-action='add-action']");
            addButton?.addEventListener("click", async () => {
                if (!("actions" in this.document.system)) return;
                const actions = this.document.system._source.actions ?? [];

                let num = actions.length + 1;
                const action = {
                    name: `${this.document.name} Action (#${num})`,
                    slug: sluggify(`${this.document.name} Action (#${num})`),
                    description: this.document.system.description ?? "",
                    traits: this.document.system._source.traits ?? [],
                    type: "generic"
                }

                while(this.document.system.actions.has(action.slug)) {
                    action.name = `${this.document.name} Action (#${++num})`;
                    action.slug = sluggify(action.name);
                }

                // @ts-expect-error
                actions.push(action);
                this.document.update({ "system.actions": actions });
            });

            for (const element of htmlQueryAll(htmlElement, ".actions .action a[data-action]")) {
                element.addEventListener("click", async (event) => {
                    const { slug, action: actionType } = (event.currentTarget as HTMLElement)
                        .dataset;
                    if (!slug) return;

                    if (!("actions" in this.document.system)) return;
                    const action = this.document.system.actions.get(slug);
                    if (!action) return;

                    switch (actionType) {
                        case "edit-action": {
                            const sheet = new ActionEditor(this.document as ItemPTR2e<ItemSystemsWithActions>, slug);
                            sheet.render(true);
                            return;
                        }
                        case "delete-action": {
                            const document = this.document;

                            foundry.applications.api.DialogV2.confirm({
                                window: {
                                    title: game.i18n.localize("PTR2E.Dialog.DeleteDocumentTitle"),
                                },
                                content: game.i18n.format("PTR2E.Dialog.DeleteDocumentContent", {
                                    name: action.name,
                                }),
                                yes: {
                                    callback: () => {
                                        if (!("actions" in document.system)) return;
                                        const actions = document.system._source.actions.filter(
                                            (a) => a.slug !== slug
                                        );
                                        document.update({ "system.actions": actions });
                                    },
                                },
                            });
                        }
                    }
                });
            }
        }
    }

    override _onRender(): void {
        for (const stringTags of this.element.querySelectorAll<HTMLElement>("string-tags")) {
            const path = stringTags.getAttribute("name");
            const validate = (() => {
                if (path?.startsWith("system.")) {
                    const systemPath = path.split(".");
                    if (systemPath.length === 2) {
                        const field = this.document.system.schema.fields[
                            systemPath[1]
                        ] as foundry.data.fields.SetField<foundry.data.fields.StringField>;
                        return field.element.validate.bind(field.element);
                    }
                    let current = this.document.system.schema.fields;
                    const pathParts = systemPath.slice(1);
                    for (let i = 0; i < pathParts.length; i++) {
                        let field = current[pathParts[i]] as
                            | foundry.data.fields.SetField<foundry.data.fields.StringField>
                            | foundry.data.fields.SchemaField<foundry.data.fields.DataSchema>;
                        if (!field) return;
                        if (field instanceof foundry.data.fields.SchemaField) {
                            current = field.fields;
                            continue;
                        }
                        if (field instanceof foundry.data.fields.SetField) {
                            return field.element.validate.bind(field.element);
                        }
                        return null;
                    }
                }
                return null;
            })();

            // @ts-expect-error
            let refresh = stringTags._refresh.bind(stringTags);

            // @ts-expect-error
            stringTags._refresh = () => {
                refresh.call();
                this.element.dispatchEvent(new Event("submit", { cancelable: true }));
            };

            //@ts-expect-error
            stringTags._validateTag = (tag: string): boolean => {
                if (validate) {
                    const result = validate(tag);
                    if (result) throw result.asError();
                }
                return true;
            };
        }
    }

    protected override async _onSubmitForm(
        config: foundry.applications.api.ApplicationFormConfiguration,
        event: Event | SubmitEvent
    ): Promise<void> {
        event.preventDefault();
        if (event.target) {
            const target = event.target as HTMLElement;
            if (target.parentElement?.nodeName === "STRING-TAGS") {
                event.stopImmediatePropagation();
                return;
            }
        }
        return super._onSubmitForm(config, event);
    }

    static async #toChat<TSystem extends ItemSystemPTR>(
        this: ItemSheetPTR2eV2<TSystem>,
        _event: Event
    ) {
        return this.document.toChat();
    }

    async _onDrop(event: DragEvent): Promise<any> {
        event.preventDefault();
        const data = TextEditor.getDragEventData<{ type: string }>(event);
        const item = this.document;
        const allowed = Hooks.call("dropItemSheetData", item, data, event);
        if (allowed === false) return;

        // Handle different data types
        switch (data.type) {
            case "ActiveEffect": {
                return this._onDropActiveEffect(event, data);
            }
            case "Item": {
                const item = await ItemPTR2e.fromDropData(data as any);
                if (!item || item.type !== "effect") return;
                const effects = item.effects.map((effect) => effect.toObject());
                if (effects.length === 0) return;
                return ActiveEffectPTR2e.createDocuments(effects, { parent: this.document });
            }
        }
    }

    async _onDropActiveEffect(_event: DragEvent, data: object) {
        const effect = await ActiveEffectPTR2e.fromDropData(data);
        if (!this.document.isOwner || !effect) return false;
        if (effect.target === this.document) return false;
        return ActiveEffectPTR2e.create(effect.toObject(), { parent: this.document });
    }
}

export default interface ItemSheetPTR2eV2<TSystem extends ItemSystemPTR> {
    get document(): ItemPTR2e<TSystem>;
}
