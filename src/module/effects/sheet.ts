import { DocumentSheetConfiguration, DocumentSheetV2, Tab } from "@item/sheets/document.ts";
import ActiveEffectPTR2e from "./document.ts";
import { CHANGE_FORMS, ChangeForm, ChangeFormOptions } from "./changes/sheet/index.ts";
import * as R from "remeda";
import { htmlQuery, htmlQueryAll, SORTABLE_BASE_OPTIONS } from "@utils";
import ChangeModel from "./changes/change.ts";
import { BasicChangeSystem, ChangeModelTypes } from "@data";
import { CodeMirror } from "./codemirror.ts";
import Sortable from "sortablejs";

class ActiveEffectConfigPTR2e extends foundry.applications.api.HandlebarsApplicationMixin(
    DocumentSheetV2<ActiveEffectPTR2e>
) {
    static override DEFAULT_OPTIONS = fu.mergeObject(
        super.DEFAULT_OPTIONS,
        {
            classes: ["active-effect-sheet"],
            position: {
                width: 630,
                height: "auto",
            },
            form: {
                handler: ActiveEffectConfigPTR2e.#onSubmit,
                closeOnSubmit: false,
                submitOnChange: true,
            },
        },
        { inplace: false }
    );

    static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
        header: {
            id: "header",
            template: "/systems/ptr2e/templates/items/parts/item-header.hbs",
        },
        tabs: {
            id: "tabs",
            template: "/systems/ptr2e/templates/items/parts/item-tabs.hbs",
        },
        overview: {
            id: "overview",
            template: "/systems/ptr2e/templates/effects/effect-overview.hbs",
            scrollable: [".scroll"],
        },
        details: {
            id: "details",
            template: "/systems/ptr2e/templates/effects/effect-details.hbs",
            scrollable: [".scroll"],
        },
        changes: {
            id: "changes",
            template: "/systems/ptr2e/templates/effects/effect-changes.hbs",
            scrollable: [".scroll"],
        }
    };

    #changeForms: ChangeForm[] = [];

    /** If we are currently editing an RE, this is the index */
    #editingChangeIndex: number | null = null;
    #rulesLastScrollTop: number | null = null;

    get editingChange(): ChangeModel["_source"] | null {
        if (this.#editingChangeIndex === null) return null;
        return this.document.changes[this.#editingChangeIndex] ?? null;
    }

    tabGroups: Record<string, string> = {
        sheet: "overview",
    };

    tabs: Record<string, Tab> = {
        overview: {
            id: "overview",
            group: "sheet",
            icon: "fa-solid fa-house",
            label: "PTR2E.EffectSheet.Tabs.overview.label",
        },
        details: {
            id: "details",
            group: "sheet",
            icon: "fa-solid fa-cogs",
            label: "PTR2E.EffectSheet.Tabs.details.label",
        },
        changes: {
            id: "changes",
            group: "sheet",
            icon: "fa-solid fa-star",
            label: "PTR2E.EffectSheet.Tabs.changes.label",
        },
    };

    _getTabs() {
        for (const v of Object.values(this.tabs)) {
            v.active = this.tabGroups[v.group] === v.id;
            v.cssClass = v.active ? "active" : "";
        }
        return this.tabs;
    }

    override changeTab(
        tab: string,
        group: string,
        {
            event,
            navElement,
            force = false,
            updatePosition = true,
        }: { event?: Event; navElement?: HTMLElement; force: boolean; updatePosition: boolean } = {
            force: false,
            updatePosition: true,
        }
    ): void {
        super.changeTab(tab, group, { event, navElement, force, updatePosition });
        if (!updatePosition) return;

        if (tab === "changes") {
            if (Number(this.position.height) >= 720) this.setPosition({ height: 720 });
        } else {
            this.setPosition({ height: "auto" });
        }
    }

    override async _prepareContext(options?: DocumentSheetConfiguration<ActiveEffectPTR2e>) {
        const context = (await super._prepareContext(options)) as Record<string, unknown>;

        context.descriptionHTML = await TextEditor.enrichHTML(this.document.description, {
            secrets: this.document.isOwner,
        });
        const legacyTransfer = CONFIG.ActiveEffect.legacyTransferral;
        const labels = {
            transfer: {
                name: game.i18n.localize(`EFFECT.Transfer${legacyTransfer ? "Legacy" : ""}`),
                hint: game.i18n.localize(`EFFECT.TransferHint${legacyTransfer ? "Legacy" : ""}`),
            },
        };

        // Status Conditions
        const statuses = CONFIG.statusEffects.map((s) => ({
            id: s.id,
            label: game.i18n.localize(s.name),
            selected: (
                this.document.statuses instanceof Set
                    ? this.document.statuses.has(s.id)
                    : (this.document.statuses as string[]).includes(s.id)
            )
                ? "selected"
                : "",
        }));

        const source = this.document.toObject();
        //@ts-ignore
        if (!source.img) source.img = "/systems/ptr2e/img/icons/effect_icon.webp";

        this.#createChangeForms();

        return {
            ...context,
            tabs: this._getTabs(),
            labels,
            source,
            item: this.document,
            effect: this.document,
            data: this.document,
            isActorEffect: this.document.parent?.documentName === "Actor",
            isItemEffect: this.document.parent?.documentName === "Item",
            submitText: "EFFECT.Submit",
            statuses,
            modes: Object.entries(CONST.ACTIVE_EFFECT_MODES).reduce((obj, e) => {
                // @ts-ignore
                obj[e[1]] = game.i18n.localize(`EFFECT.MODE_${e[0]}`);
                return obj;
            }, {}),
            changeEditing: !!this.editingChange,
            changes: await Promise.all(
                this.#changeForms.map(async (form) => ({
                    template: await form.render(),
                    fields: form.schema.fields,
                    source: form.source,
                    index: form.index,
                }))
            ),
            fields: this.document.schema.fields,
            system: this.document.system,
        };
    }

    override close(options?: foundry.applications.api.ApplicationClosingOptions) {
        this.#editingChangeIndex = null;
        return super.close(options);
    }

    override _attachPartListeners(
        partId: string,
        htmlElement: HTMLElement,
        options: foundry.applications.api.HandlebarsRenderOptions
    ): void {
        super._attachPartListeners(partId, htmlElement, options);
        if (partId === "overview") {
            const colorElement =
                htmlElement.querySelector<HTMLInputElement>("input[type='color']")!;
            const edits = colorElement?.dataset?.edit;
            if (edits) {
                colorElement.addEventListener("input", () => {
                    const sibling = colorElement.previousElementSibling as
                        | HTMLInputElement
                        | undefined;
                    if (sibling?.getAttribute("name") !== edits) return;

                    sibling.value = colorElement.value;
                    colorElement.style.setProperty(
                        "--color-input-border-color",
                        colorElement.value
                    );
                });
            }
        }

        if (partId === "changes") {
            for (const anchor of htmlQueryAll(htmlElement, "button[data-action=add-change]")) {
                anchor.addEventListener("click", async (event) => {
                    event.preventDefault();
                    const formData = new FormDataExtended(this.element);
                    const data = this._prepareSubmitData(formData);

                    const changes = data.system?.changes as Partial<ChangeModel["_source"]>[];
                    changes.push({
                        type: BasicChangeSystem.TYPE,
                    });
                    await this.document.update(data);
                });
            }

            for (const select of htmlQueryAll<HTMLFormElement>(htmlElement, ".type select[name]")) {
                select.addEventListener("change", async (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    const formData = new FormDataExtended(this.element);

                    // Manually update the JSON data with the new type if it doesn't exist
                    const selectValue = formData.object[`system.changes.${select.parentElement?.dataset.changeIndex}.type`]
                    const obj = formData.object[`system.changes.${select.parentElement?.dataset.changeIndex}`];
                    if(obj && typeof obj === "string") {
                        const json = JSON.parse(obj);
                        if(!json.type) {
                            json.type = selectValue;
                            formData.object[`system.changes.${select.parentElement?.dataset.changeIndex}`] = JSON.stringify(json);
                        }
                    }

                    const data = this._prepareSubmitData(formData);

                    const changes = data.system?.changes as ChangeModel["_source"][];
                    const index = Number(select.parentElement?.dataset.changeIndex ?? "NaN");
                    if (changes && Number.isInteger(index) && changes.length > index) {
                        changes[index].type = select.value;
                        await this.document.update(data);
                    }
                });
            }

            for (const anchor of htmlQueryAll(htmlElement, "a.edit-change")) {
                anchor.addEventListener("click", async () => {
                    if (
                        this.state !== foundry.applications.api.ApplicationV2.RENDER_STATES.RENDERED
                    )
                        return;
                    const index = Number(anchor.dataset.changeIndex ?? "NaN") ?? null;
                    this.#editingChangeIndex = index;
                    this.#rulesLastScrollTop = htmlElement.scrollTop ?? null;
                    this.render({ parts: ["changes"] });
                });
            }

            for (const anchor of htmlQueryAll(htmlElement, "a.remove-change")) {
                anchor.addEventListener("click", async (_event) => {
                    const formData = new FormDataExtended(this.element);
                    const data = this._prepareSubmitData(formData);

                    const changes = data.system?.changes as ChangeModel["_source"][];
                    const index = Number(anchor.dataset.changeIndex ?? "NaN");
                    if (changes && Number.isInteger(index) && changes.length > index) {
                        changes.splice(index, 1);
                        await this.document.update(data);
                    }
                });
            }

            const editingChange = this.editingChange;
            if (editingChange) {
                const changeText = JSON.stringify(editingChange, null, 2);
                const schema = ChangeModelTypes()[editingChange.type]?.schema.fields;
                const view = new CodeMirror.EditorView({
                    doc: changeText,
                    extensions: [
                        CodeMirror.basicSetup,
                        CodeMirror.keybindings,
                        ...CodeMirror.changeExtensions({ schema }),
                    ],
                });

                htmlElement
                    .querySelector<HTMLDivElement>(".change-editing .editor-placeholder")
                    ?.replaceWith(view.dom);

                const closeBtn = htmlElement.querySelector<HTMLButtonElement>(
                    ".change-editing button[data-action=close-editor]"
                );
                closeBtn?.addEventListener("click", (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    this.#editingChangeIndex = null;
                    this.render({ parts: ["changes"], position: { height: "auto" } });
                });
                closeBtn?.removeAttribute("disabled");

                htmlElement
                    .querySelector<HTMLButtonElement>(
                        ".change-editing button[data-action=apply-editor]"
                    )
                    ?.addEventListener("click", (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        const value = view.state.doc.toString();

                        // Close early if the editing index is invalid
                        if (this.#editingChangeIndex === null) {
                            this.#editingChangeIndex = null;
                            this.render({ parts: ["changes"], position: { height: "auto" } });
                            return;
                        }

                        try {
                            const changes = this.document.toObject().system.changes;
                            changes[this.#editingChangeIndex] = JSON.parse(value as string);
                            this.#editingChangeIndex = null;
                            this.document.update({ "system.changes": changes });
                        } catch (error) {
                            if (error instanceof Error) {
                                ui.notifications.error(
                                    game.i18n.format("PTR2E.EffectSheet.ChangeEditor.Errors.ChangeSyntax", {
                                        message: error.message,
                                    })
                                );
                                console.warn(
                                    "Syntax error in change definition.",
                                    error.message,
                                    value
                                );
                                throw error;
                            }
                        }
                    });
            }

            // Activate rule element sub forms
            const ruleSections = htmlElement.querySelectorAll<HTMLElement>(".effect-change");
            for (const ruleSection of Array.from(ruleSections)) {
                const idx = ruleSection.dataset.idx ? Number(ruleSection.dataset.idx) : NaN;
                this.#changeForms.at(idx)?.activateListeners(ruleSection);
            }

            // Allow drag/drop sorting of rule elements
            const changes = htmlQuery(htmlElement, ".change-element-forms");
            if (changes) {
                Sortable.create(changes, {
                    ...SORTABLE_BASE_OPTIONS,
                    handle: ".drag-handle",
                    onEnd: async (event) => {
                        const currentIndex = event.oldDraggableIndex;
                        const newIndex = event.newDraggableIndex;
                        if (currentIndex === undefined || newIndex === undefined) {
                            this.render({ parts: ["changes"] });
                            return;
                        }

                        // Update rules. If the update returns undefined, there was no change, and we need to re-render manually
                        const changes = this.document.toObject().system.changes;
                        const movingChange = changes.at(currentIndex);
                        if (movingChange && newIndex <= changes.length) {
                            changes.splice(currentIndex, 1);
                            changes.splice(newIndex, 0, movingChange);
                            const result = await this.document.update({
                                "system.changes": changes,
                            });
                            if (!result) this.render({ parts: ["changes"] });
                        } else {
                            this.render({ parts: ["changes"] });
                        }
                    },
                });
            }
        }
    }

    override _onRender(
        _context: foundry.applications.api.ApplicationRenderContext,
        _options: foundry.applications.api.HandlebarsDocumentSheetConfiguration
    ): void {
        if (this.#editingChangeIndex === null && this.#rulesLastScrollTop) {
            const changesTab = htmlQuery(this.element, "[data-tab='changes']");
            if (changesTab) changesTab.scrollTop = this.#rulesLastScrollTop;
            this.#rulesLastScrollTop = null;
        }
    }

    override _prepareSubmitData(formData: FormDataExtended): Record<string, unknown> & {system?: Record<string, unknown>} {
        const data = fu.expandObject(formData.object) as Record<string, unknown> & {
            system?: { changes?: Record<number, ChangeModel["_source"]> };
        };

        if(data.system?.changes) {
        const changes = this.document.toObject().system.changes as ChangeModel["_source"][];
            for(const changeSection of htmlQueryAll(this.element, ".effect-change[data-idx]")) {
                const idx = Number(changeSection.dataset.idx);
                const changeForm = this.#changeForms[idx];
                if(idx >= changes.length) throw new Error(`Change index ${idx} out of bounds`);

                const incomingData = data.system?.changes?.[idx];
                if(incomingData) {
                    changeForm.updateObject(incomingData);
                    const validationFailures = changeForm.change.schema.validate(changeForm.source, {partial: true});
                    if(validationFailures && validationFailures.unresolved) {
                        changeForm.updateValidationErrors(validationFailures);
                        ui.notifications.error(game.i18n.localize("PTR2E.EffectSheet.ChangeEditor.Errors.UnableToSaveDueToValidationFailure"));
                        return {};
                    }
                    else {
                        changes[idx] = changeForm.source;
                    }
                }
            }
            data.system.changes = changes;
        }

        data.statuses ??= [];
        return data;
    }

    #createChangeForms(): void {
        const changes = this.document.toObject().system.changes;
        const previousForms = [...this.#changeForms];

        // First pass, create options, and then look for exact matches of data and reuse those forms
        // This is mostly to handle deletions and re-ordering of rule elements
        const processedChanges = changes.map((change, index) => {
            const changeModel = this.document.changes.find((r) => r.sourceIndex === index);
            if (!changeModel)
                throw new Error(`Change model not found for change at index ${index}`);
            const options: ChangeFormOptions = {
                sheet: this,
                index,
                change: changeModel,
            };

            // If a form exists of the correct type with an exact match, reuse that one.
            // If we find a match, delete it so that we don't use the same form for two different Changes
            const FormClass = CHANGE_FORMS[change.type] ?? ChangeForm;
            const existing = previousForms.find(
                (form) => R.equals(form.source, change) && form.constructor.name === FormClass.name
            );
            if (existing) {
                previousForms.splice(previousForms.indexOf(existing), 1);
            }
            return { options, FormClass, existing };
        });

        // Second pass, if any unmatched rule has a form in the exact position that fits, reuse that one
        // We have to account for re-ordering when fetching the existing form
        for (const change of processedChanges) {
            if (change.existing) continue;
            const existing = this.#changeForms.at(change.options.index);
            const alreadyMatches = processedChanges.some((c) => c.existing === existing);
            if (existing?.constructor.name === change.FormClass.name && !alreadyMatches) {
                change.existing = existing;
            }
        }

        // Create the forms, using the existing form or creating a new one if necessary
        this.#changeForms = processedChanges.map((processed) => {
            if (processed.existing) {
                processed.existing.initialize(processed.options);
                return processed.existing;
            }

            return new processed.FormClass(processed.options);
        });
    }

    static async #onSubmit(this: ActiveEffectConfigPTR2e, event: SubmitEvent, _form: HTMLFormElement, formData: FormDataExtended) {
        event.preventDefault();
        event.stopPropagation();
        const submitData = this._prepareSubmitData(formData);
        if (fu.isEmpty(submitData)) return;

        await this.document.update(submitData);
    }
}

export default ActiveEffectConfigPTR2e;
