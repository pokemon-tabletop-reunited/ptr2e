import { DocumentSheetConfiguration, DocumentSheetV2, Tab } from "@item/sheets/document.ts";
import ActiveEffectPTR2e from "./document.ts";
import { CHANGE_FORMS, ChangeForm, ChangeFormOptions } from "./changes/sheet/index.ts";
import * as R from "remeda";
import { htmlQuery, htmlQueryAll, sluggify, SORTABLE_BASE_OPTIONS } from "@utils";
import ChangeModel from "./changes/change.ts";
import { BasicChangeSystem, ChangeModelTypes, Trait } from "@data";
import { CodeMirror } from "./codemirror.ts";
import Sortable from "sortablejs";
import { DataInspector } from "@module/apps/data-inspector/data-inspector.ts";
import Tagify from "@yaireo/tagify";

class ActiveEffectConfig extends foundry.applications.api.HandlebarsApplicationMixin(
  DocumentSheetV2<ActiveEffectPTR2e>
) {
  static override DEFAULT_OPTIONS = fu.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      classes: ["active-effect-sheet"],
      position: {
        width: 550,
        height: "auto",
      },
      form: {
        handler: ActiveEffectConfig.#onSubmit,
        closeOnSubmit: false,
        submitOnChange: true,
      },
      actions: {
        "open-inspector": async function (this: ActiveEffectConfig, event: Event) {
          event.preventDefault();
          const inspector = new DataInspector(this.document);
          inspector.render(true);
        },
        "convert-to-affliction": async function (this: ActiveEffectConfig, event: Event) {
          event.preventDefault();
          const newEffect = this.document.clone({ type: "affliction" }, { keepId: true });
          const parent = this.document.parent;
          await this.document.delete();
          const docs = await ActiveEffectPTR2e.createDocuments([newEffect], {keepId: true, parent});
          docs?.at(0)?.sheet?.render(true);
        }
      },
      window: {
        resizable: true,
        controls: [
          ...(super.DEFAULT_OPTIONS?.window?.controls ?? []),
          {
            icon: "fas fa-atom",
            label: "PTR2E.ActorSheet.Inspector",
            action: "open-inspector",
            visible: true
          }
        ],
      },
    },
    { inplace: false }
  );

  #allTraits: { value: string; label: string, virtual: boolean, type?: Trait["type"] }[] | undefined;

  static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
    header: {
      id: "header",
      template: "systems/ptr2e/templates/items/parts/item-header.hbs",
    },
    tabs: {
      id: "tabs",
      template: "systems/ptr2e/templates/items/parts/item-tabs.hbs",
    },
    overview: {
      id: "overview",
      template: "systems/ptr2e/templates/effects/effect-overview.hbs",
      scrollable: [".scroll"],
    },
    details: {
      id: "details",
      template: "systems/ptr2e/templates/effects/effect-details.hbs",
      scrollable: [".scroll"],
    },
    changes: {
      id: "changes",
      template: "systems/ptr2e/templates/effects/effect-changes.hbs",
      scrollable: [".scroll"],
    },
  };

  #changeForms: ChangeForm[] = [];

  /** If we are currently editing an RE, this is the index */
  #editingChangeIndex: number | null = null;
  #rulesLastScrollTop: number | null = null;

  get editingChange(): ChangeModel["_source"] | null {
    if (this.#editingChangeIndex === null) return null;
    // @ts-expect-error - This is a valid operation
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
    if (!source.img) source.img = "systems/ptr2e/img/icons/effect_icon.webp";

    this.#createChangeForms();

    context.hasDescription = "description" in this.document;
    if (context.hasDescription) {
      context.descriptionHTML = await TextEditor.enrichHTML(this.document.description, {
        secrets: this.document.isOwner,
        relativeTo: this.document,
      });
    }

    const traits  = (() => {
      if ("traits" in this.document.system) {
        const traits = [];
        for (const trait of this.document.system.traits) {
          traits.push({
            value: trait.slug,
            label: trait.label,
            virtual: trait.virtual,
            type: trait.type,
          });
        }
        return traits;
      }
      return [];
    })();

    this.#allTraits = game.ptr.data.traits.map((trait) => ({
      value: trait.slug,
      label: trait.label,
      virtual: false,
      type: trait.type,
    }));


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
        // @ts-expect-error - This is a valid operation
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
      traits
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
              )} style="${Trait.bgColors[tagData.type || "default"] ? `--tag-bg: ${Trait.bgColors[tagData.type || "default"]!["bg"]}; --tag-hover: ${Trait.bgColors[tagData.type || "default"]!["hover"]}; --tag-border-color: ${Trait.bgColors[tagData.type || "default"]!["border"]};` : ""}">
                            ${tagData.virtual ? "" : `<x title="" class="tagify__tag__removeBtn" role="button" aria-label="remove tag"></x>`}
                            <div>
                                <span class='tagify__tag-text'>
                                    <span class="trait" data-tooltip-direction="UP" data-trait="${tagData.value
                }" data-tooltip="${tagData.label
                }"><span>[</span><span class="tag">${tagData.label
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

    if (partId === "changes") {
      for (const anchor of htmlQueryAll(htmlElement, "button[data-action=add-change]")) {
        anchor.addEventListener("click", async (event) => {
          event.preventDefault();
          const formData = new FormDataExtended(this.element);
          const data = this._prepareSubmitData(
            event as unknown as SubmitEvent,
            this.element as HTMLFormElement,
            formData
          );

          if (!data.system?.changes) {
            if (data.system) data.system.changes = [];
            else data.system = { changes: [] };
          }

          const changes = data.system.changes as Partial<ChangeModel["_source"]>[];
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
          const selectValue =
            formData.object[
            `system.changes.${select.parentElement?.dataset.changeIndex}.type`
            ];
          const obj =
            formData.object[
            `system.changes.${select.parentElement?.dataset.changeIndex}`
            ];
          if (obj && typeof obj === "string") {
            const json = JSON.parse(obj);
            if (!json.type) {
              json.type = selectValue;
              formData.object[
                `system.changes.${select.parentElement?.dataset.changeIndex}`
              ] = JSON.stringify(json);
            }
          }

          const data = this._prepareSubmitData(
            event as SubmitEvent,
            this.element as HTMLFormElement,
            formData
          );

          const changes = (data.system?.changes as ChangeModel["_source"][]) ?? [];
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
          // eslint-disable-next-line no-constant-binary-expression
          const index = Number(anchor.dataset.changeIndex ?? "NaN") ?? null;
          this.#editingChangeIndex = index;
          this.#rulesLastScrollTop = htmlElement.scrollTop ?? null;
          this.render({ parts: ["changes"] });
        });
      }

      for (const anchor of htmlQueryAll(htmlElement, "a.remove-change")) {
        anchor.addEventListener("click", async (event) => {
          const formData = new FormDataExtended(this.element);
          const data = this._prepareSubmitData(
            event as unknown as SubmitEvent,
            this.element as HTMLFormElement,
            formData
          );

          const changes = (data.system?.changes as ChangeModel["_source"][]) ?? [];
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
                  game.i18n.format(
                    "PTR2E.EffectSheet.ChangeEditor.Errors.ChangeSyntax",
                    {
                      message: error.message,
                    }
                  )
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

    if (partId === "header" && this.isEditable) {
      htmlQuery(htmlElement, "img[data-edit]")?.addEventListener("click", (event) => {
        const imgElement = event.currentTarget as HTMLImageElement;
        const attr = imgElement.dataset.edit;
        const current = foundry.utils.getProperty<string | undefined>(this.document, attr!);
        const fp = new FilePicker({
          current,
          type: "image",
          redirectToRoot: [],
          callback: (path: string) => {
            imgElement.src = path;
            if (this.options.form?.submitOnChange)
              this.element.dispatchEvent(new Event("submit", { cancelable: true }));
          },
          top: this.position.top + 40,
          left: this.position.left + 10,
        });
        fp.browse();
      });
    }
  }

  override _onRender(
    context: foundry.applications.api.ApplicationRenderContext,
    options: foundry.applications.api.HandlebarsDocumentSheetConfiguration
  ): void {
    super._onRender(context, options);
    if (this.#editingChangeIndex === null && this.#rulesLastScrollTop) {
      const changesTab = htmlQuery(this.element, "[data-tab='changes']");
      if (changesTab) changesTab.scrollTop = this.#rulesLastScrollTop;
      this.#rulesLastScrollTop = null;
    }
  }

  override _prepareSubmitData(
    _event: SubmitEvent,
    _form: HTMLFormElement,
    formData: FormDataExtended
  ): Record<string, unknown> & { system?: Record<string, unknown> } {
    const data = fu.expandObject(formData.object) as Record<string, unknown> & {
      system?: { changes?: Record<number, ChangeModel["_source"]>; traits?: string[] };
    };

    if (data.system?.changes) {
      const changes = this.document.toObject().system.changes as ChangeModel["_source"][];
      for (const changeSection of htmlQueryAll(this.element, ".effect-change[data-idx]")) {
        const idx = Number(changeSection.dataset.idx);
        const changeForm = this.#changeForms[idx];
        if (idx >= changes.length) throw new Error(`Change index ${idx} out of bounds`);

        const incomingData = data.system?.changes?.[idx];
        if (incomingData) {
          changeForm.updateObject(incomingData);
          const validationFailures = changeForm.change.schema.validate(
            changeForm.source,
            { partial: true }
          );
          if (validationFailures && validationFailures.unresolved) {
            changeForm.updateValidationErrors(validationFailures);
            ui.notifications.error(
              game.i18n.localize(
                "PTR2E.EffectSheet.ChangeEditor.Errors.UnableToSaveDueToValidationFailure"
              )
            );
            return {};
          } else {
            changes[idx] = changeForm.source;
          }
        }
      }
      data.system.changes = changes;
    }

    if (
      "system" in data &&
      data.system &&
      typeof data.system === "object" &&
      "traits" in data.system &&
      Array.isArray(data.system.traits)
    )
      // Traits are stored as an array of objects, but we only need the values
      // @ts-expect-error - Traits are stored as an array of objects, but we only need the values
      data.system.traits = data.system.traits.map((trait: { value: string }) =>
        sluggify(trait.value)
      );

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

  static async #onSubmit(
    this: ActiveEffectConfig,
    event: SubmitEvent,
    form: HTMLFormElement,
    formData: FormDataExtended
  ) {
    event.preventDefault();
    event.stopPropagation();
    const submitData = this._prepareSubmitData(event, form, formData);
    if (fu.isEmpty(submitData)) return;

    await this.document.update(submitData);
  }
}

export default ActiveEffectConfig;
