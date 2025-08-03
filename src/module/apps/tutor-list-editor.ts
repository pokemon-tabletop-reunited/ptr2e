import { ItemPTR2e } from "@item";
import { TutorListSchema, TutorListSettings } from "@system/tutor-list/setting-model.ts";
import { exportToJSON, importFromJSON } from "@utils";
import { ApplicationConfigurationExpanded, ApplicationV2Expanded } from "./appv2-expanded.ts";

class TutorListEditor extends foundry.applications.api.HandlebarsApplicationMixin(ApplicationV2Expanded) {
  static override DEFAULT_OPTIONS = {
    id: "tutor-list-editor",
    classes: ["sheet"],
    tag: "form",
    window: {
      title: "PTR2E.Settings.TutorList.Title",
      controls: [
        {
          icon: "fa-solid fa-file-import",
          label: "SIDEBAR.Import",
          action: "import",
          visible: true
        },
        {
          icon: "fa-solid fa-file-export",
          label: "SIDEBAR.Export",
          action: "export",
          visible: true
        }
      ]
    },
    position: {
      width: 430,
      height: 600
    },
    form: {
      closeOnSubmit: true,
      submitOnChange: false,
      handler: TutorListEditor.#onSubmit
    },
    actions: {
      "delete": async function (this: TutorListEditor, _event: Event, target: HTMLElement) {
        if (!this.list) return;

        const moveSlug = target.dataset.slug;
        if (!moveSlug) return;

        this.list.updateSource({ moves: this.list.moves.filter(move => move.slug !== moveSlug) });
        this.render({ parts: ["body"] });
        ui.notifications.info(`Removed move ${Handlebars.helpers.formatSlug(moveSlug)} from the ${Handlebars.helpers.formatSlug(this.list.slug)} (${Handlebars.helpers.formatSlug(this.list.type)}) list.`);
      },
      "edit": async function (this: TutorListEditor) {
        if (!this.list) return;
        if (this.list.type === "universal") {
          ui.notifications.warn("Please note: the Universal Tutor List's information cannot be edited.");
        }
        const dialog = new TutorListEditorDialog({
          parent: this,
          editOrCreate: "edit"
        });
        dialog.render(true);
      },
      "add-list": async function (this: TutorListEditor) {
        const dialog = new TutorListEditorDialog({
          parent: this,
          editOrCreate: "create"
        });
        dialog.render(true);
      },
      "reset-defaults": async function (this: TutorListEditor) {
        foundry.applications.api.DialogV2.confirm({
          yes: {
            callback: async () => {
              await TutorListSettings.resetDefaults();

              this.lists = new TutorListSettings(game.ptr.data.tutorList.toObject())
              this.list = null;
              this.render({ parts: ["header", "body"] });
            }
          },
          content: game.i18n.localize("PTR2E.Dialog.ResetTutorListDefault"),
          window: {
            title: game.i18n.localize("PTR2E.Dialog.ResetTutorListTitle"),
          },
        })
      },
      "import": async function (this: TutorListEditor) {
        const result = await importFromJSON<{
          data: TutorListSettings["_source"],
          additionalData: { items: ItemPTR2e["_source"][] },
          requiredPacks: string[];
        }>({
          name: "All Tutor Lists",
          type: "TutorListData",
        })
        if (!result?.data) return;

        const { data, additionalData, requiredPacks } = result.data;

        if (requiredPacks.length) {
          const missingPacks = requiredPacks.filter(p => !game.packs.has(p));
          if (missingPacks.length) return void ui.notifications.error(`Aborting Import. Missing required packs: ${missingPacks.join(", ")}`);
        }

        if (additionalData.items.length && !additionalData.items.every(i => game.items.has(i._id!))) {
          const folder = await Folder.create({
            name: `Tutor List ${Handlebars.helpers.formatSlug(data.slug)} Imports`,
            type: "Item",
          })
          if (!folder) return void ui.notifications.error("Failed to create folder for imported items");
          await ItemPTR2e.createDocuments(additionalData.items.map(i => ({ ...i, folder: folder.id })), { keepId: true, renderSheet: false });
        }

        await game.settings.set("ptr2e", "tutorListData", data);
        this.lists = new TutorListSettings(game.ptr.data.tutorList.toObject())
        this.list = null;
        this.render({ parts: ["header", "body"] });
      },
      "export": async function (this: TutorListEditor) {
        const additionalData = {
          items: new Map<string, unknown>()
        }
        const requiredPacks = new Set<string>();

        const data = this.lists.toObject();
        for (const list of data.list) {
          for (const move of list.moves) {
            if (!move.uuid) continue;
            if (!move.uuid.startsWith("Compendium.")) {
              const doc = await fu.fromUuid(move.uuid);
              if (doc instanceof ItemPTR2e) {
                if (!additionalData.items.has(move.uuid)) {
                  additionalData.items.set(move.uuid, doc.toCompendium(null, { keepId: true }));
                }
              }
            }
            else {
              const doc = await fu.fromUuid(move.uuid);
              if (!doc) return void ui.notifications.error(`Invalid move reference: ${move.slug}`);
              const [, mod, pack] = (move.uuid as string).split(".");
              requiredPacks.add(`${mod}.${pack}`);
            }
          }
        }

        exportToJSON({
          type: "TutorListData",
          data: {
            data,
            requiredPacks: Array.from(requiredPacks),
            additionalData: Object.entries(additionalData).reduce((acc, [key, value]) => ({ ...acc, [key]: Array.from(value.values()) }), {})
          }
        })
      }
    },
    dragDrop: [
      {
        dropSelector: ".window-content"
      },
    ]
  };

  static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
    header: {
      id: "header",
      template: "systems/ptr2e/templates/apps/settings/tutor-list-editor-header.hbs"
    },
    body: {
      id: "body",
      template: "systems/ptr2e/templates/apps/settings/tutor-list-editor.hbs",
      scrollable: [".scroll"]
    },
    footer: {
      id: "footer",
      template: "systems/ptr2e/templates/apps/settings/tutor-list-editor-footer.hbs",
    },
  }

  lists: TutorListSettings;
  list: TutorListSchema | null = null;

  constructor(options: Partial<ApplicationConfigurationExpanded> = {}) {
    super(options);
    this.lists = new TutorListSettings(game.ptr.data.tutorList.toObject());
  }

  override async _prepareContext(options: foundry.applications.api.HandlebarsRenderOptions) {
    if (!this.list) this.list = this.lists.get("universal-universal") ?? null;
    if (!this.list) ui.notifications.error("No universal tutor list found, something is wrong with your installation! Please reset your Tutor List Settings.");

    return {
      options,
      lists: this.lists.list.contents.sort((a, b) => {
        if (a.slug === "universal") return -1;
        if (b.slug === "universal") return 1;
        if (a.type === b.type) {
          return a.slug.localeCompare(b.slug);
        }
        return (a.type ?? "").localeCompare(b.type ?? "");
      }),
      list: this.list ? {
        id: this.list.id,
        slug: this.list.slug,
        type: this.list.type,
        moves: this.list.moves.contents.sort((a, b) => a.slug.localeCompare(b.slug)),
      } : {}
    }
  }

  override async _preparePartContext(partId: string, context: foundry.applications.api.ApplicationRenderContext): Promise<foundry.applications.api.ApplicationRenderContext> {
    const preparedContext = await super._preparePartContext(partId, context);
    preparedContext.partId = partId;
    return preparedContext;
  }

  override _attachPartListeners(partId: string, htmlElement: HTMLElement, options: foundry.applications.api.HandlebarsRenderOptions): void {
    super._attachPartListeners(partId, htmlElement, options);

    if (partId === "header") {
      htmlElement.querySelector<HTMLSelectElement>("select#tutor-list-selector")?.addEventListener("change", (event) => {
        const value = (event.target as HTMLSelectElement).value;
        this.list = this.lists.get(value) ?? null;
        if (this.list) {
          const typeSelector = htmlElement.querySelector<HTMLSelectElement>("select#tutor-list-type-selector");
          if (typeSelector) {
            typeSelector.disabled = this.list.type === "universal";
            typeSelector.value = this.list.type;
          }
        }
        this.render({ parts: ["body"] })
      })
    }
  }

  override async _onDrop(event: DragEvent) {
    if (!this.list) return;

    const data: {
      type: string;
      uuid?: string;
    } = foundry.applications.ux.TextEditor.getDragEventData(event);

    if (data.uuid) {
      const item = await fu.fromUuid(data.uuid);
      if (item instanceof ItemPTR2e && item.type === "move") {
        this.list.updateSource({
          moves: [
            ...this.list.moves,
            {
              slug: item.slug,
              uuid: item.uuid
            }
          ]
        })
        this.render({ parts: ["body"] });
      } else {
        return void ui.notifications.error("You can only drop moves onto a tutor list.");
      }
    }

  }

  static async #onSubmit(this: TutorListEditor) {
    const data = this.lists.toObject();
    return void game.settings.set("ptr2e", "tutorListData", data);
  }
}

class TutorListEditorDialog extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
  static override DEFAULT_OPTIONS = {
    id: "tutor-list-editor-dialog",
    classes: ["sheet"],
    tag: "form",
    window: {
      title: "PTR2E.Dialog.AddOrEditTutorListTitle",
      controls: [
        {
          icon: "fa-solid fa-file-import",
          label: "SIDEBAR.Import",
          action: "import",
          visible: true
        },
        {
          icon: "fa-solid fa-file-export",
          label: "SIDEBAR.Export",
          action: "export",
          visible: true
        }
      ]
    },
    position: {
      width: 350,
      height: "auto" as const
    },
    form: {
      closeOnSubmit: true,
      submitOnChange: false,
      handler: TutorListEditorDialog.#onSubmit
    },
    actions: {
      "import": async function (this: TutorListEditorDialog) {
        const result = await importFromJSON<{
          data: TutorListSchema["_source"],
          additionalData: { items: ItemPTR2e["_source"][] },
          requiredPacks: string[]
        }>({
          name: this.mode === "edit" ? Handlebars.helpers.formatSlug(this.parent.list!.slug) : "New Tutor List",
          type: "TutorList",
        })
        if (!result?.data) return;

        const { data, additionalData, requiredPacks } = result.data;

        if (this.parent.list!.id === "universal-universal" && (data.slug !== "universal" || data.type !== "universal")) {
          return void ui.notifications.error("You cannot import a tutor list that is not universal unto the universal tutor list.");
        }

        if (requiredPacks.length) {
          const missingPacks = requiredPacks.filter(p => !game.packs.has(p));
          if (missingPacks.length) return void ui.notifications.error(`Aborting Import. Missing required packs: ${missingPacks.join(", ")}`);
        }

        if (additionalData.items.length && !additionalData.items.every(i => game.items.has(i._id!))) {
          const folder = await Folder.create({
            name: `Tutor List ${Handlebars.helpers.formatSlug(data.slug)} Imports`,
            type: "Item",
          })
          if (!folder) return void ui.notifications.error("Failed to create folder for imported items");
          await ItemPTR2e.createDocuments(additionalData.items.map(i => ({ ...i, folder: folder.id })), { keepId: true, renderSheet: false });
        }

        this.parent.lists.list.delete(this.parent.list!.id);
        if (this.parent.lists.list.has(data.slug + "-" + data.type)) {
          return void ui.notifications.error("A tutor list with that slug and type already exists. Please delete it first if you wish to replace it.");
        }
        this.parent.list!.updateSource(data);
        this.parent.lists.list.set(this.parent.list!.id, this.parent.list!);
        this.parent.render({ parts: ["header", "body"] });
        this.close();
      },
      "export": async function (this: TutorListEditorDialog) {
        if (!this.parent.list) return void ui.notifications.error("No tutor list to export");

        const additionalData = {
          items: new Map<string, unknown>()
        }
        const requiredPacks = new Set<string>();

        const data = this.parent.list.toObject();
        for (const move of data.moves) {
          if (!move.uuid) continue;
          if (!move.uuid.startsWith("Compendium.")) {
            const doc = await fu.fromUuid(move.uuid);
            if (doc instanceof ItemPTR2e) {
              if (!additionalData.items.has(move.uuid)) {
                additionalData.items.set(move.uuid, doc.toCompendium(null, { keepId: true }));
              }
            }
          }
          else {
            const doc = await fu.fromUuid(move.uuid);
            if (!doc) return void ui.notifications.error(`Invalid move reference: ${move.slug}`);
            const [, mod, pack] = (move.uuid as string).split(".");
            requiredPacks.add(`${mod}.${pack}`);
          }
        }

        exportToJSON({
          type: "TutorList",
          data: {
            data,
            requiredPacks: Array.from(requiredPacks),
            additionalData: Object.entries(additionalData).reduce((acc, [key, value]) => ({ ...acc, [key]: Array.from(value.values()) }), {})
          },
          label: this.parent.list.slug
        })
      }
    }
  };

  static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
    body: {
      id: "body",
      template: "systems/ptr2e/templates/apps/settings/tutor-list-dialog.hbs",
    },
    footer: {
      id: "footer",
      template: "systems/ptr2e/templates/apps/settings/tutor-list-dialog-footer.hbs",
    },
  }

  parent: TutorListEditor;
  mode: "edit" | "create";

  constructor(options: Partial<foundry.applications.api.ApplicationConfiguration & { parent: TutorListEditor, editOrCreate: "edit" | "create" }> = {}) {
    const parent = options.parent, editOrCreate = options.editOrCreate;
    if (!parent) throw new Error("TutorListEditorDialog requires a parent TutorListEditor instance.");
    if (!["edit", "create"].includes(editOrCreate ?? "")) {
      throw new Error("TutorListEditorDialog requires an editOrCreate option with value 'edit' or 'create'.");
    }

    super(options);
    this.parent = parent;
    this.mode = editOrCreate!;
  }

  override async _prepareContext() {
    return {
      fields: TutorListSchema.schema.fields,
      typeChoices: (TutorListSchema.schema.fields.type as unknown as { choices: string[] }).choices.filter(type => type !== "universal").reduce((acc, type) => ({
        ...acc,
        [type]: Handlebars.helpers.formatSlug(type)
      }), {}),
      list: this.mode === "edit" ? this.parent.list : {},
      exists: this.mode === "edit"
    };
  }

  static async #onSubmit(this: TutorListEditorDialog, _event: Event, _element: HTMLFormElement, formData: FormDataExtended) {
    const data = formData.object;
    if (this.mode === "edit") {
      if (this.parent.list!.type === "universal") return;

      this.parent.lists.list.delete(this.parent.list!.id);
      this.parent.list!.updateSource(data);
      this.parent.lists.list.set(this.parent.list!.id, this.parent.list!);
    }
    else {
      const tutor = new TutorListSchema(data as unknown as TutorListSchema["_source"]);
      this.parent.lists.updateSource({ list: [...this.parent.lists.list.contents, tutor] });
      this.parent.list = this.parent.lists.get(tutor.id) ?? null;
    }
    this.parent.render({ parts: ["header", "body"] });
  }
}

export { TutorListEditor }