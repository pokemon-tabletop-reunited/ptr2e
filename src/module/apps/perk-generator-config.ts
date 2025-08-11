import { ApplicationConfigurationExpanded, ApplicationV2Expanded } from "./appv2-expanded.ts";
import { GeneratorConfig } from "@module/data/models/generator-config.ts";
import { BlueprintSheetPTR2e } from "@item/sheets/index.ts";
import Sortable from "sortablejs";
import { ItemPTR2e, PerkPTR2e } from "@item";
import { Blueprint } from "@module/data/models/blueprint.ts";
import BlueprintSystem from "@item/data/blueprint.ts";
import { sluggify } from "@utils";

export class PerkGeneratorConfig extends foundry.applications.api.HandlebarsApplicationMixin(ApplicationV2Expanded) {
  static override DEFAULT_OPTIONS = {
    tag: "form",
    classes: ["ptr2e", "sheet", "perk-config-sheet", "default-sheet"],
    position: {
      height: 560,
      width: 650,
    },
    form: {
      submitOnChange: false,
      closeOnSubmit: true,
      handler: PerkGeneratorConfig.#onSubmit,
    },
    window: {
      minimizable: true,
      resizable: true,
      controls: [
        {
          action: "save",
          icon: "fas fa-save",
          label: "PTR2E.Save",
          visible: false
        },
        {
          action: "toggle-link",
          icon: "fas fa-link",
          label: "PTR2E.Link",
          visible: false
        }
      ]
    },
    actions: {
      "save": async function (this: PerkGeneratorConfig) {
        if (!this.document) return;
        if (!this.document.label) return void ui.notifications.error("You must provide a label for this config before it can be saved to the global configs.");

        const configs = fu.duplicate(game.settings.get("ptr2e", "global-perk-configs"));
        const exists = configs.find(c => c.id === this.document.id)
        if (exists) {
          if (exists.label === this.document.label) {
            return void ui.notifications.error("It appears this config is already saved to the Global Config.");
          }
          this.document.updateSource({ id: fu.randomID() });
        }

        const config = this.document.toObject();
        config.link = true;

        configs.push(config);
        await game.settings.set("ptr2e", "global-perk-configs", configs);

        // This is being submitted from a blueprint sheet.
        if (this.blueprintSheet && this.document?.parent instanceof Blueprint && this.document.parent?.parent instanceof BlueprintSystem) {
          const blueprint = this.document.parent.parent;
          if (this.blueprintSheet.generation?.temporary) {
            this.document.parent.updateSource({ _config: { id: config.id, link: true } });
          }
          else {
            await blueprint.updateChildren([{ _id: this.document.parent.id, _config: { id: config.id, link: true } }]);
          }
        }
      },
      "toggle-link": async function (this: PerkGeneratorConfig) {
        if (!this.document) return;
        if (this.blueprintSheet && this.document?.parent instanceof Blueprint && this.document.parent?.parent instanceof BlueprintSystem) {
          const blueprint = this.document.parent.parent;
          if (this.blueprintSheet.generation?.temporary) {
            this.document.parent.updateSource({ _config: { link: !this.document.link } });
          }
          else {
            await blueprint.updateChildren([{ _id: this.document.parent.id, _config: { link: !this.document.link } }]);
          }

          this.close();
          //@ts-expect-error - Arguments not required.
          return void this.blueprintSheet.options.actions["open-config"].call(this.blueprintSheet);
        }
      },
      "add-priority": function (this: PerkGeneratorConfig, event: PointerEvent/*, _target: HTMLElement, element?: HTMLElement*/) {
        return PerkGeneratorConfig.#addPriority.call(this, event, false);
      },
      "add-negative-priority": function (this: PerkGeneratorConfig, event: PointerEvent/*, _target: HTMLElement, element?: HTMLElement*/) {
        return PerkGeneratorConfig.#addPriority.call(this, event, true);
      },
      "delete-entry": function (this: PerkGeneratorConfig, event: PointerEvent) {
        const parent = (event.target as HTMLElement).closest("li.entry") as HTMLElement | null;
        if (!parent) return;

        const { index } = parent.dataset;
        if (index === undefined) return;

        const { type } = (parent.parentElement as HTMLElement)?.dataset ?? {};
        if (!type) return;

        this.priorities[type as "priority" | "negative"].splice(Number(index), 1);
        if (type !== "inactive") this.priorities[type as "priority" | "negative"].forEach((p, i) => p.priority = i + (type === "priority" ? 1 : 500));
        return void this.render({ parts: ["priorities"] });
      },
      close: function (this: PerkGeneratorConfig) {
        return this.close();
      }
    },
    dragDrop: [{ dropSelector: "ul.priority, ul.negative" }]
  } as unknown as Omit<DeepPartial<ApplicationConfigurationExpanded>, "uniqueId">;

  static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
    config: {
      id: "config",
      template: "systems/ptr2e/templates/apps/generator-config-config.hbs",
    },
    priorities: {
      id: "priorities",
      template: "systems/ptr2e/templates/apps/generator-config-priorities.hbs",
      scrollable: [".scroll"],
    },
    footer: {
      id: "footer",
      template: "systems/ptr2e/templates/apps/generator-config-footer.hbs",
    },
  };

  blueprintSheet: BlueprintSheetPTR2e | null;
  document: GeneratorConfig;
  priorities: {
    priority: GeneratorConfig["priorities"];
    // inactive: GeneratorConfig["priorities"];
    negative: GeneratorConfig["priorities"];
  }

  constructor(document: GeneratorConfig = new GeneratorConfig(), application: BlueprintSheetPTR2e | null = null, options: Partial<foundry.applications.api.ApplicationConfiguration> = {}) {
    options.id = `generator-config-${document.id}${document.link ? "" : `-${application ? 'blueprint' : 'global'}`}`;
    super(options);
    this.document = document;
    this.blueprintSheet = application;
  }

  override get title() {
    return this.document.label
      ? `Generator Config: ${this.document.label}`
      : this.document.parent instanceof Blueprint
        ? `Generator Config for: ${this.document.parent.name}`
        : `Generator Config`;
  }

  get hasGlobal() {
    if (!this.document.link || !this.document.id) return false;
    return this.globalConfig ? true : false;
  }

  get globalConfig() {
    return game.settings.get("ptr2e", "global-perk-configs").find(c => c.id === this.document.id);
  }

  override _getHeaderControls(): foundry.applications.api.ApplicationHeaderControlsEntry[] {
    const controls = super._getHeaderControls();
    const save = controls.find(c => c.action === "save");
    if (save) {
      if (game.user.hasPermission("SETTINGS_MODIFY") && !this.hasGlobal) {
        save.visible = true;
      }
      else {
        save.visible = false;
      }
    }
    const link = controls.find(c => c.action === "toggle-link");
    if (link) {
      if (this.globalConfig) {
        link.visible = true;
        link.label = this.document.link ? "PTR2E.Unlink" : "PTR2E.Link";
        link.icon = this.document.link ? "fas fa-unlink" : "fas fa-link";
      }
      else {
        link.visible = false;
      }
    }
    return controls;
  }

  override async _prepareContext() {
    return {
      fields: this.document.schema.fields,
      source: this.document._source,
      document: this.document,
      //@ts-expect-error - Too lazy to cast this a million times.
      typeField: this.document.schema.fields.priorities.element.fields.type
    }
  }

  override async _preparePartContext(partId: string, context: foundry.applications.api.ApplicationRenderContext) {
    const result = await super._preparePartContext(partId, context);

    if (partId === "footer") {
      result.hasGlobal = !!this.globalConfig;
    }

    if (partId === "priorities") {
      if (!this.priorities) {
        const priority = this.priorities = {
          priority: this.document.priorities.filter(p => p.priority > 0 && p.priority < 500).sort((a, b) => a.priority - b.priority),
          negative: this.document.priorities.filter(p => p.priority >= 500).sort((a, b) => a.priority - b.priority)
        }

        result.priority = priority;
      } else {
        result.priority = this.priorities;
      }
    }
    return result;
  }

  override _onFirstRender(context: foundry.applications.api.ApplicationRenderContext, options: foundry.applications.api.HandlebarsRenderOptions): void {
    super._onFirstRender(context, options);

    if (this.element.querySelector(".choice.hidden")) {
      const element = this.element.querySelector<HTMLInputElement>(`.choice input[name="_config.entry.choice"]`) ?? this.element.querySelector<HTMLInputElement>(`.choice input[name="entry.choice"]`);
      if (element) element.required = false;
    }
  }

  override _attachPartListeners(partId: string, htmlElement: HTMLElement, options: foundry.applications.api.HandlebarsRenderOptions): void {
    super._attachPartListeners(partId, htmlElement, options);

    if (partId === "config") {
      const entryRoot = htmlElement.querySelector<HTMLSelectElement>(`select[name="_config.entry.mode"]`) ?? htmlElement.querySelector<HTMLSelectElement>(`select[name="entry.mode"]`);
      if (!entryRoot) return;

      entryRoot.addEventListener("change", (event) => {
        const value = (event.target as HTMLSelectElement).value as "choice" | "random" | "best";
        if (value === "choice") {
          htmlElement.querySelector<HTMLDivElement>(".choice")?.classList.remove("hidden");
          const element = this.element.querySelector<HTMLInputElement>(`.choice input[name="_config.entry.choice"]`) ?? this.element.querySelector<HTMLInputElement>(`.choice input[name="entry.choice"]`);
          if (element) element.required = true;
        }
        else {
          htmlElement.querySelector<HTMLDivElement>(".choice")?.classList.add("hidden");
          const element = this.element.querySelector<HTMLInputElement>(`.choice input[name="_config.entry.choice"]`) ?? this.element.querySelector<HTMLInputElement>(`.choice input[name="entry.choice"]`);
          if (element) element.required = false;
        }
      });
    }

    if (partId === "priorities") {
      const priority = htmlElement.querySelector<HTMLUListElement>("ul.priority"),
        negative = htmlElement.querySelector<HTMLUListElement>("ul.negative");
      if (!priority || !negative) return;

      for (const entry of htmlElement.querySelectorAll<HTMLLIElement>("li.entry")) {
        const { index } = entry.dataset;
        const parent = entry.parentElement?.dataset.type as "priority" | "negative";
        if (!parent) continue;
        for (const select of entry.querySelectorAll<HTMLSelectElement>("select")) {
          const { name } = select;
          select.addEventListener("change", (event) => {
            const { value } = event.target as HTMLSelectElement;
            this.priorities[parent][Number(index)][name] = value;
            if (name === "type") {
              this.priorities[parent][Number(index)].slug =
                value === "arena"
                  ? "physical"
                  : value === "approach"
                    ? "power"
                    : "";
            }
            this.render({ parts: ["priorities"] });
          })
        }
        for (const input of entry.querySelectorAll<HTMLInputElement>("span.priority input")) {
          input.addEventListener("change", (event) => {
            const value = Number((event.target as HTMLInputElement).value);
            if (value < 0 || value > 500) {
              if (parent === "priority") {
                this.priorities.negative.splice(Number(index), 0, this.priorities.priority.splice(Number(index), 1)[0]);
              }
              this.priorities.negative[Number(index)].priority = value < 0 ? 500 - value : Math.clamp(value, 501, 500 + this.priorities.negative.length);
            } else {
              if (parent === "negative") {
                this.priorities.priority.splice(Number(index), 0, this.priorities.negative.splice(Number(index), 1)[0]);
              }
              this.priorities.priority[Number(index)].priority = Math.clamp(value, 1, this.priorities.priority.length);
            }
            this.render({ parts: ["priorities"] });
          });
        }
        for (const input of entry.querySelectorAll<HTMLInputElement>("input[name='slug']")) {
          input.addEventListener("change", (event) => {
            this.priorities[parent][Number(index)].slug = sluggify((event.target as HTMLInputElement).value);
          });
        }
      }

      const baseSettings = {
        group: "priority",
        sort: true,
        draggable: "li.entry",
        dataIdAttr: "data-priority"
      } satisfies Partial<Sortable.Options>;

      new Sortable(priority, {
        ...baseSettings,
        onAdd: (event) => {
          const { type } = event.from.dataset;
          this.priorities.priority.splice(event.newIndex! - 1, 0, this.priorities[type as "negative"].splice(event.oldIndex! - 1, 1)[0]);
          this.priorities.priority.forEach((p, i) => p.priority = i + 1);
          this.render({ parts: ["priorities"] });
        },
        onUpdate: (event) => {
          this.priorities.priority.splice(event.newIndex! - 1, 0, this.priorities.priority.splice(event.oldIndex! - 1, 1)[0]);
          this.priorities.priority.forEach((p, i) => p.priority = i + 1);
          this.render({ parts: ["priorities"] });
        }
      })
      new Sortable(negative, {
        ...baseSettings,
        onAdd: (event) => {
          const { type } = event.from.dataset;
          this.priorities.negative.splice(event.newIndex! - 1, 0, this.priorities[type as "priority"].splice(event.oldIndex! - 1, 1)[0]);
          this.priorities.negative.forEach((p, i) => p.priority = i + 500);
          this.render({ parts: ["priorities"] });
        },
        onUpdate: (event) => {
          this.priorities.negative.splice(event.newIndex! - 1, 0, this.priorities.negative.splice(event.oldIndex! - 1, 1)[0]);
          this.priorities.negative.forEach((p, i) => p.priority = i + 500);
          this.render({ parts: ["priorities"] });
        }
      })
    }
  }

  override async _onDrop(event: DragEvent) {
    const data: { type: string } = foundry.applications.ux.TextEditor.getDragEventData(event);
    if (data.type !== "Item") return;

    const item = (await ItemPTR2e.implementation.fromDropData(data)) as PerkPTR2e;
    if (!item || item.type !== "perk") return;

    const parent = ((event.target as HTMLElement).dataset.type
      ? (event.target as HTMLElement).dataset.type === "priority"
        ? (event.target as HTMLElement)
        : ((event.currentTarget ?? (event.target as HTMLElement).closest("ul")) as HTMLElement)?.querySelector("li.entry[data-type='perk'][data-slug='']")
      : (
        (event.target as HTMLElement).closest("li.entry[data-type='perk'][data-slug='']")
        ?? ((event.currentTarget ?? (event.target as HTMLElement).closest("ul")) as HTMLElement)?.querySelector("li.entry[data-type='perk'][data-slug='']")
      )) as HTMLElement | null;
    if (!parent) {
      const priority = ((event.currentTarget ?? (event.target as HTMLElement).closest("ul")) as HTMLElement).classList.contains("priority")
        ? this.priorities.priority
        : this.priorities.negative;

      priority.push({
        slug: item.uuid,
        priority: priority.length,
        type: "perk"
      });

      priority.forEach(priority === this.priorities.priority ? (p, i) => p.priority = i + 1 : (p, i) => p.priority = i + 500);

      return void this.render({ parts: ["priorities"] });
    }
    const { index, priority: priorityVal } = parent.dataset;
    if (index === undefined) return;

    const priority = ((event.currentTarget ?? (event.target as HTMLElement).closest("ul")) as HTMLElement).classList.contains("priority")
      ? this.priorities.priority
      : this.priorities.negative;

    priority.splice(Number(index), 1, {
      slug: item.uuid,
      priority: Number(priorityVal),
      type: "perk"
    });

    priority.forEach(priority === this.priorities.priority ? (p, i) => p.priority = i + 1 : (p, i) => p.priority = i + 500);

    return void this.render({ parts: ["priorities"] });
  }

  static async #addPriority(this: PerkGeneratorConfig, _event: MouseEvent, isNegative = false) {
    this.priorities[isNegative ? "negative" : "priority"].push({
      slug: "",
      priority: isNegative
        ? this.priorities.negative.length + 500
        : this.priorities.priority.length + 1,
      type: "perk"
    });
    return void this.render({ parts: ["priorities"] });
  }


  static async #onSubmit(this: PerkGeneratorConfig, _event: Event, _element: HTMLFormElement, formData: FormDataExtended) {
    const data = fu.expandObject(formData.object);
    if (!data._config) {
      if (
        data.cost
        && typeof data.cost === "object"
        && "priority" in data.cost
        && data.cost.priority != null
        && "resolution" in data.cost
        && data.cost.resolution != null
        && data.entry
        && typeof data.entry === "object"
        && "mode" in data.entry
        && data.entry.mode != null
        && "choice" in data.entry
        && data.entry.choice != null
      ) {
        data._config = {
          cost: {
            priority: data.cost.priority as GeneratorConfig['_source']['cost']['priority'],
            resolution: data.cost.resolution as GeneratorConfig['_source']['cost']['resolution']
          },
          entry: {
            mode: data.entry.mode as GeneratorConfig['_source']['entry']['mode'],
            choice: data.entry.choice as GeneratorConfig['_source']['entry']['choice'],
          },
          label: data.label as GeneratorConfig['_source']['label'],
        } as GeneratorConfig['_source'];
      }
      else return;
    }

    const config = data._config as GeneratorConfig['_source'];

    config.priorities = [...this.priorities.priority, ...this.priorities.negative] as GeneratorConfig['_source']['priorities'];
    if (config.entry.mode !== "choice") config.entry.choice = null;

    // This is being submitted from a blueprint sheet.
    if (this.blueprintSheet && this.document?.parent instanceof Blueprint && this.document.parent?.parent instanceof BlueprintSystem) {
      const blueprint = this.document.parent.parent;
      if (this.blueprintSheet.generation?.temporary) {
        const parent = this.document.parent;
        this.document.parent.updateSource({ _config: new GeneratorConfig(fu.mergeObject(this.document.toObject(), config, { inplace: false }), { parent }).toObject() });
      }
      else {
        await blueprint.updateChildren([{ _id: this.document.parent.id, _config: config }]);
      }
      this.blueprintSheet.render({ parts: ["main"] });
    }
    //Otherwise it's from the global sheet
    else {
      if (!this.document.link) return void console.warn("This config is not linked to a blueprint, it will not be saved to the global configs.");
      const current = fu.duplicate(game.settings.get("ptr2e", "global-perk-configs")) as GeneratorConfig['_source'][];
      const exists = current.find(c => c.id === this.document.id);
      if (!exists) return;
      fu.mergeObject(exists, config, { inplace: true });
      await game.settings.set("ptr2e", "global-perk-configs", current);
    }


    return;
  }
}

//@ts-expect-error - Temporary
globalThis.PerkGeneratorConfig = PerkGeneratorConfig;