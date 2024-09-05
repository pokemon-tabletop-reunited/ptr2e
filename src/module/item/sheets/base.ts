import { ItemPTR2e, ItemSystemPTR, ItemSystemsWithActions } from "@item";
import { htmlQuery, htmlQueryAll, sluggify } from "@utils";
import { DocumentSheetConfiguration, Tab } from "./document.ts";
import Tagify from "@yaireo/tagify";
import GithubManager from "@module/apps/github.ts";
import { ActiveEffectPTR2e } from "@effects";
import { ActionEditor } from "@module/apps/action-editor.ts";
import { ItemSheetV2Expanded } from "@module/apps/appv2-expanded.ts";
import { ActionPTR2e } from "@data";
import { DataInspector } from "@module/apps/data-inspector/data-inspector.ts";

export default class ItemSheetPTR2e<
  TSystem extends ItemSystemPTR,
> extends foundry.applications.api.HandlebarsApplicationMixin(ItemSheetV2Expanded) {
  static override DEFAULT_OPTIONS = fu.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      classes: ["move-sheet"],
      dragDrop: [
        {
          dropSelector: ".window-content",
          dragSelector: ".effect-list .effect, .actions-list .action",
        }
      ],
      position: {
        height: 500,
        width: 550,
      },
      actions: {
        toChat: this.#toChat,
        toGithub: GithubManager.commitItemToGithub,
        "open-inspector": async function<TSystem extends ItemSystemPTR>(this: ItemSheetPTR2e<TSystem>, event: Event) {
          event.preventDefault();
          const inspector = new DataInspector(this.item);
          inspector.render(true);
        },
      },
      form: {
        submitOnChange: true,
        closeOnSubmit: false,
      },
      window: {
        minimizable: true,
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

  // Settings for child classes to override
  static readonly overviewTemplate: string = "";
  static readonly detailsTemplate: string = "";
  readonly noActions: boolean = false;

  #allTraits: { value: string; label: string, virtual?: boolean }[] | undefined;

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
      template: "",
      scrollable: [".scroll"],
    },
    details: {
      id: "details",
      template: "",
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
            virtual: trait.virtual ?? false,
          });
        }
        return traits;
      }
      return [];
    })();

    this.#allTraits ??= game.ptr.data.traits.map((trait) => ({
      value: trait.slug,
      label: trait.label,
      virtual: false,
    }));

    const effects = this.document.effects.contents;

    const enrichedDescription = await TextEditor.enrichHTML(this.document.system.description);

    return {
      ...((await super._prepareContext()) as Record<string, unknown>),
      item: this.document,
      source: this.document.toObject(),
      fields: this.document.system.schema.fields,
      tabs: this._getTabs(),
      traits,
      effects,
      enrichedDescription,
    };
  }

  override _prepareSubmitData(
    event: SubmitEvent,
    form: HTMLFormElement,
    formData: FormDataExtended
  ): Record<string, unknown> {
    const submitData = formData.object;

    if (
      "system.traits" in submitData &&
      submitData["system.traits"] &&
      typeof submitData["system.traits"] === "object" &&
      Array.isArray(submitData["system.traits"])
    ) {
      // Traits are stored as an array of objects, but we only need the values
      submitData["system.traits"] = submitData["system.traits"].map(
        (trait: { value: string }) => sluggify(trait.value)
      );
    }

    return super._prepareSubmitData(event, form, formData);
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

  override _attachPartListeners(
    partId: string,
    htmlElement: HTMLElement,
    options: DocumentSheetConfiguration<ItemPTR2e<TSystem>>
  ): void {
    super._attachPartListeners(partId, htmlElement, options);

    for (const element of htmlQueryAll(htmlElement, ".can-add")) {
      const div = document.createElement("div");
      div.classList.add("add-control");
      div.dataset.type = element.dataset.type;
      div.dataset.tooltip = game.i18n.localize("Add");
      div.innerHTML = `<i class="fas fa-plus"></i>`;
      div.addEventListener("click", this._onCreate.bind(this));
      element.appendChild(div);
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
              const isRemovable = tagData.virtual ? "" : `<x title="" class="tagify__tag__removeBtn" role="button" aria-label="remove tag"></x>`;
              return `
                            <tag contenteditable="false" spellcheck="false" tabindex="-1" class="tagify__tag" ${this.getAttributes(
                tagData
              )}>
                            ${isRemovable}
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

    if (partId === "effects") {
      for (const element of htmlQueryAll(htmlElement, ".item-controls .effect-to-chat")) {
        element.addEventListener("click", async (event) => {
          const effectId = (
            (event.currentTarget as HTMLElement)?.closest(".effect") as HTMLElement
          )?.dataset.effectId;
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
          )?.dataset.effectId;
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
          )?.dataset.effectId;
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
        const actions = this.document.system._source.actions as ActionPTR2e[] ?? [];

        let num = actions.length + 1;
        const action = {
          name: `${this.document.name} Action (#${num})`,
          slug: sluggify(`${this.document.name} Action (#${num})`),
          description: this.document.system.description ?? "",
          traits: this.document.system._source.traits ?? [],
          type: "generic",
        };

        while ((this.document.system.actions as Collection<ActionPTR2e>).has(action.slug)) {
          action.name = `${this.document.name} Action (#${++num})`;
          action.slug = sluggify(action.name);
        }

        // @ts-expect-error - Actions on source is not a collection but an array
        actions.push(action);
        this.document.update({ "system.actions": actions });
      });

      for (const element of htmlQueryAll(htmlElement, ".actions .action a[data-action]")) {
        element.addEventListener("click", async (event) => {
          const { slug, action: actionType } = (event.currentTarget as HTMLElement)
            .dataset;
          if (!slug) return;

          if (!("actions" in this.document.system)) return;
          const action = (this.document.system.actions as Collection<ActionPTR2e>).get(slug);
          if (!action) return;

          switch (actionType) {
            case "edit-action": {
              const sheet = new ActionEditor(
                this.document as ItemPTR2e<ItemSystemsWithActions>,
                slug
              );
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
                    const actions = (document.system._source.actions as ActionPTR2e[]).filter(
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

    if (partId === "header" && this.isEditable) {
      htmlQuery(htmlElement, "img[data-edit]")?.addEventListener("click", (event) => {
        const imgElement = event.currentTarget as HTMLImageElement;
        const attr = imgElement.dataset.edit;
        const current = foundry.utils.getProperty<string | undefined>(this.document, attr!);
        const { img } =
          this.document.constructor.getDefaultArtwork(this.document.toObject()) ?? {};
        const fp = new FilePicker({
          current,
          type: "image",
          redirectToRoot: img ? [img] : [],
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

  override _onRender(context: foundry.applications.api.ApplicationRenderContext, options: foundry.applications.api.HandlebarsRenderOptions): void {
    super._onRender(context, options);
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
          // eslint-disable-next-line @typescript-eslint/prefer-for-of
          for (let i = 0; i < pathParts.length; i++) {
            const field = current[pathParts[i]] as
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

      // @ts-expect-error - Monkey Patching
      const refresh = stringTags._refresh.bind(stringTags);

      // @ts-expect-error - Monkey Patching
      stringTags._refresh = () => {
        refresh.call();
        this.element.dispatchEvent(new Event("submit", { cancelable: true }));
      };

      //@ts-expect-error - Monkey Patching
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
    this: ItemSheetPTR2e<TSystem>
  ) {
    return this.document.toChat();
  }

  protected async _onCreate(event: Event) {
    const type = (event.currentTarget as HTMLElement).dataset.type;
    if (!type) return;

    // Items only support effects
    if (type !== "effect") return;

    return ActiveEffectPTR2e.createDialog({}, { parent: this.document });
  }
}

export default interface ItemSheetPTR2e<TSystem extends ItemSystemPTR> {
  get document(): ItemPTR2e<TSystem>;
}
