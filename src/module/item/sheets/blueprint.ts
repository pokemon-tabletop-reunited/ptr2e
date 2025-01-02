import { ItemPTR2e } from "@item/document.ts";
import { DocumentSheetV2 } from "./document.ts";
import BlueprintSystem from "@item/data/blueprint.ts";
import { Blueprint } from "@module/data/models/blueprint.ts";
import { htmlQuery } from "@utils";
import Sortable from "sortablejs";
import { SpeciesSystemModel } from "@item/data/index.ts";
import type { ActorPTR2e } from "@actor";

export default class BlueprintSheet extends foundry.applications.api.HandlebarsApplicationMixin(DocumentSheetV2<ItemPTR2e<BlueprintSystem>>) {
  static override DEFAULT_OPTIONS = foundry.utils.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      classes: ["blueprint", "sheet"],
      position: {
        width: 700,
        height: 700,
      },
      window: {
        resizable: true,
        controls: [
          {
            action: "rename",
            icon: "fas fa-edit",
            label: "PTR2E.Rename",
            visible: true
          }
        ]
      },
      form: {
        submitOnChange: true,
        closeOnSubmit: false,
        handler: this.#onSubmit,
      },
      dragDrop: [{ dropSelector: "aside" }, {dropSelector: ".species-fields"}],
      actions: {
        "rename": async function (this: BlueprintSheet) {
          const name = this.document.name;
          const dialog = await foundry.applications.api.DialogV2.prompt<string>({
            window: {title: game.i18n.localize("PTR2E.Dialog.RenameDocumentTitle")},
            content: `<p>${game.i18n.localize("PTR2E.Dialog.RenameDocumentContent")}</p><input type="text" name="name" value="${name}">`,
            ok: {
              action: "ok",
              label: "Confirm",
              callback: (_event, _button, dialog) => {
                return dialog?.querySelector<HTMLInputElement>("input[name='name']")?.value ?? name
              }
            }
          })
          if(!dialog || name == dialog) return;
          await this.document.update({name: dialog});
          if(this.rendered) this._updateFrame({window: {title: this.title}});
        }
      },
      tag: "form",
    },
    { inplace: false }
  );

  static override PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    side: {
      id: "side",
      template: "systems/ptr2e/templates/items/blueprint/blueprint-side.hbs",
    },
    main: {
      id: "main",
      template: "systems/ptr2e/templates/items/blueprint/blueprint-sheet.hbs",
    },
  };

  constructor(options: foundry.applications.api.DocumentSheetConfiguration & {
    generation?: {
      x: number,
      y: number,
      temporary: boolean,
      canvas: Canvas,
    },
  }) {
    super(options);
    this.generation = options.generation ?? null;

    this.prepareTeamData();
  }

  get blueprint() {
    return this.document.system;
  }

  generation: {
    x: number,
    y: number,
    temporary: boolean
    canvas: Canvas,
    parent?: ActorPTR2e,
  } | null = null;
  selection: string | null = null
  team: {
    owner: Blueprint | null,
    members: Blueprint[]
  } | null;

  get selected(): Blueprint | null {
    return this.blueprint.blueprints.get(this.selection ?? "") ?? null;
  }

  get(id: string): Blueprint | null {
    return this.blueprint.blueprints.get(id) ?? null;
  }

  prepareTeamData(team = this.team): team is NonNullable<BlueprintSheet["team"]> {
    if (team && this.team) return true;

    this.team = {
      owner: null,
      members: []
    }

    for (const blueprint of this.blueprint.blueprints.contents.sort((a, b) => a.sort - b.sort)) {
      if (blueprint.owner) {
        if (!this.team.owner) {
          this.team.owner = blueprint;
          continue;
        } else {
          ui.notifications.warn("Multiple blueprints are marked as Party Leader. Only one can be the party leader.");
        }
      }
      this.team.members.push(blueprint);
    }
    return true;
  }

  override async _prepareContext(): Promise<object> {
    if (!this.prepareTeamData(this.team)) return {};

    for (const blueprint of this.blueprint.blueprints) {
      await blueprint.prepareAsyncData();
    }

    if (!this.selection) {
      if (this.team.owner) {
        this.selection = this.team.owner.id;
      }
      else if (this.team.members.length > 0) {
        this.selection = this.team.members[0].id;
      }
    }

    return {
      ...(await super._prepareContext()),
      team: this.team,
      type: this.team.owner ? "party" : this.team.members.length > 1 ? "team" : "individual",
      blueprint: this.selected,
      fields: Blueprint.schema.fields,
      isGenerator: !!this.generation,
      habitats: CONFIG.PTR.data.habitats
    };
  }

  override _attachPartListeners(partId: string, htmlElement: HTMLElement, options: foundry.applications.api.HandlebarsApplicationMixin.HandlebarsRenderOptions): void {
    super._attachPartListeners(partId, htmlElement, options);

    if (partId === "side") {
      htmlElement.querySelectorAll(".blueprint.avatar").forEach((element) => {
        element.addEventListener("click", this.onBlueprintClick.bind(this));
        element.addEventListener("dblclick", async (event) => {
          const id = ((event.target as HTMLElement).closest("[data-blueprint-id]") as HTMLElement)?.dataset.blueprintId;
          if (!id) return;

          const blueprint = this.get(id);
          const species = blueprint?.species;
          if (!species) return;

          const doc = await fromUuid(species);
          doc?.sheet?.render(true);
        })
        element.addEventListener("contextmenu", async (event) => {
          if (this.generation) return;
          const id = ((event.target as HTMLElement).closest("[data-blueprint-id]") as HTMLElement)?.dataset.blueprintId;
          if (!id) return;

          const blueprint = this.get(id);
          if (!blueprint) return;

          foundry.applications.api.DialogV2.confirm({
            yes: {
              callback: () => {
                this.team = null;
                this.blueprint.deleteChildren([blueprint.id])
              },
            },
            content: game.i18n.format("PTR2E.Dialog.DeleteDocumentContent", {
              name: blueprint.name,
            }),
            window: {
              title: game.i18n.format("PTR2E.Dialog.DeleteDocumentTitle", {
                name: blueprint.name,
              }),
            },
          });
        });
      });

      if (this.generation) return;

      const ownerElement = htmlQuery(htmlElement, "section.main");
      if (ownerElement) {
        new Sortable(ownerElement, {
          animation: 200,
          direction: "vertical",
          draggable: ".blueprint.avatar",
          dragClass: "drag-preview",
          ghostClass: "drag-gap",
          onEnd: this.onEndSort.bind(this),
          group: {
            name: `blueprints-${this.id}`
          }
        })
      }
      const teamElement = htmlQuery(htmlElement, "section.team");
      if (teamElement) {
        new Sortable(teamElement, {
          animation: 200,
          direction: "vertical",
          draggable: ".blueprint.avatar",
          dragClass: "drag-preview",
          ghostClass: "drag-gap",
          onEnd: this.onEndSort.bind(this),
          onMove: (event) => {
            if (!ownerElement) return;
            const emptyElement = htmlQuery(ownerElement, ".empty")
            if (!emptyElement) return;

            if (event.to == ownerElement) {
              emptyElement.style.opacity = "0.5";
              emptyElement.style.position = "absolute";
            }
            else {
              emptyElement.style.opacity = "1";
              emptyElement.style.position = "relative";
            }
          },
          group: {
            name: `blueprints-${this.id}`
          }
        })
      }
    }
    if(partId === "main") {
      const select = htmlElement.querySelector<HTMLSelectElement>("select.species-select");
      select?.addEventListener("change", async () => {
        const value = select.value;
        if(!value) return;
        if(!this.selected) return;
        if(this.generation?.temporary) {
          this.selected.updateSource({species: value});
        } 
        else {
          await this.blueprint.updateChildren([{_id: this.selected.id, species: value}]);
        }
      })
    }
  }

  override _onRender(context: foundry.applications.api.ApplicationRenderContext, options: foundry.applications.api.HandlebarsDocumentSheetConfiguration): void {
    super._onRender(context, options);

    if (options?.parts?.includes("main")) {
      this.element?.querySelectorAll(".tag.document-tag").forEach((element) => {
        element.addEventListener("dblclick", async () => {
          const id = (element as HTMLElement).dataset.key;
          if (!id) return;

          const doc = await fromUuid(id);
          doc?.sheet?.render(true);
        })
      });
    }
  }

  private onEndSort(event: Sortable.SortableEvent) {
    const id = event.item.dataset.blueprintId;
    if (!id) return;
    const self = this.get(id);
    if (!self) return;
    if (!this.team) return;

    // If the item was pulled from another list
    if (event.pullMode) {
      const updates = [];
      if (event.to.className == 'main') {
        if (this.team.owner) {
          updates.push({ _id: this.team.owner.id, owner: false })
        }
        updates.push({ _id: id, owner: true })
      }
      else {
        if (this.team.owner?.id == id) {
          updates.push({ _id: id, owner: false })
        }
      }

      if (updates.length) {
        this.team = null;
        return void this.blueprint.updateChildren(updates);
      }
    }

    const newIndex = event.newDraggableIndex;
    if (newIndex === undefined) return;
    const blueprints = this.team.owner ? [this.team.owner, ...this.team.members] : this.team.members;
    const target = blueprints[newIndex];
    if (!target) return;

    // Don't sort on self
    if (self.id === target.id) return;
    const sortUpdates = SortingHelpers.performIntegerSort(self, {
      target,
      siblings: blueprints,
    })
    this.team = null;
    this.blueprint.updateChildren(sortUpdates.map(u => ({ _id: u.target.id, sort: u.update.sort })));
  }

  private onBlueprintClick(event: Event) {
    const target = event.currentTarget as HTMLElement;
    const id = target.dataset.blueprintId;
    if (!id) return;

    this.selection = id;
    this.render({ parts: ["main"] });
  }

  /**
   * If the table doesn't contain at least one document let the user know the table is wrong.
   */
  isValidRolltable(table: RollTable): boolean {
    const results = table.results.contents;
    for (const result of results) {
      switch (result.type) {
        case CONST.TABLE_RESULT_TYPES.COMPENDIUM:
        case CONST.TABLE_RESULT_TYPES.DOCUMENT: {
          return true;
        }
      }
    }

    return false;
  }

  override async _onDrop(event: DragEvent) {
    const data = TextEditor.getDragEventData(event) as Record<string, string>;
    const doc = await (async () => {
      switch (data.type) {
        case "RollTable": {
          const table = await fromUuid<RollTable>(data.uuid);
          if (!table) {
            ui.notifications.error("The dropped table could not be found");
            return;
          }

          if (!this.isValidRolltable(table)) {
            ui.notifications.error("The dropped table is not a valid RollTable, it must contain at least one Species Document");
            return;
          }

          return table;
        }
        case "Item": {
          const item = await fromUuid<ItemPTR2e<BlueprintSystem | SpeciesSystemModel>>(data.uuid);
          if (!item) {
            ui.notifications.error("The dropped item could not be found");
            return;
          }

          if (!(item instanceof ItemPTR2e && (item.system instanceof BlueprintSystem || item.system instanceof SpeciesSystemModel))) {
            ui.notifications.error("The dropped item is not a Blueprint / Species / RollTable");
            return;
          }

          return item;
        }
        case "Actor": {
          const actor = await fromUuid<ActorPTR2e>(data.uuid);
          if (!actor) {
            ui.notifications.error("The dropped actor could not be found");
            return;
          }

          if (this.generation) {
            this.generation.parent = actor;
            if(!this.team) return null;
            // @ts-expect-error - Mock for UI purposes.
            this.team.owner = {name: actor.name, img: actor.img};
            this.render({ parts: ["side"] });
            return null;
          }

          return actor;
        }
      }
      return null;
    })();

    if (!doc) return;

    if((event.currentTarget as HTMLElement).classList.contains("species-fields")) {
      if(!this.selected) return;
      if(this.generation?.temporary) {
        return void this.selected.updateSource({species: doc.uuid});
      } else {
        this.team = null
        return void await this.blueprint.updateChildren([{_id: this.selected.id, species: doc.uuid}]);
      }
    }
    else {
      this.team = null;
      this.blueprint.createChildren([doc]);
    }
  }

  static async #onSubmit(
    this: BlueprintSheet,
    event: SubmitEvent | Event,
    _form: HTMLFormElement,
    formData: FormDataExtended
  ) {
    const closeAndGenerate = event.type === "submit";

    // If this isn't a temporary generation, update the current selected blueprint based on form data
    if (!this.generation?.temporary && this.selected) {
      const updateData = foundry.utils.duplicate(formData.object);
      for (const key in updateData) {
        if (updateData[key] === "") {
          delete updateData[key];
        }
      }
      if(updateData.species) this.team = null;
      await this.blueprint.updateChildren([{
        _id: this.selected.id,
        ...updateData
      }]);
    }

    if (!closeAndGenerate) return;

    if (this.generation?.temporary) {
      const blueprint = this.selected;
      if (!blueprint) return;

      const updateData = foundry.utils.duplicate(formData.object);
      for (const key in updateData) {
        if (updateData[key] === "") {
          delete updateData[key];
        }
      }
      foundry.utils.mergeObject(blueprint, updateData, { inplace: true });
    }

    const generation = this.generation ? {...this.generation, team: !this.team?.owner && (this.team?.members?.length ?? 0) > 1} : null;

    const result = this._dataOnly ? this.blueprint.generate(null, true) : this.blueprint.generate(generation);
    if(this._dataOnly) {
      this.resolve(result);
      this._dataOnly = false;
    }
    this.close();
  }

  override _onClose(options: foundry.applications.api.HandlebarsApplicationMixin.HandlebarsRenderOptions): void {
    super._onClose(options);
    if (this._dataOnly) {
      this.resolve();
    }
  }

  private _dataOnly = false;
  private resolve: (value: void | PromiseLike<Partial<ActorPTR2e['_source']>[] | void>) => void;

  async dataOnly(): Promise<Partial<ActorPTR2e['_source']>[] | void> {
    return new Promise((resolve) => {
      this._dataOnly = true;
      this.resolve = resolve;
      this.render(true);
    })
  }
}