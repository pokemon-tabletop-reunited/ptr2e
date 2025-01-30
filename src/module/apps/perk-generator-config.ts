import { ApplicationV2Expanded } from "./appv2-expanded.ts";
import { GeneratorConfig } from "@module/data/models/generator-config.ts";
import { BlueprintSheetPTR2e } from "@item/sheets/index.ts";
import Sortable from "sortablejs";
import { ItemPTR2e, PerkPTR2e } from "@item";
import { Blueprint } from "@module/data/models/blueprint.ts";
import BlueprintSystem from "@item/data/blueprint.ts";

export class PerkGeneratorConfig extends foundry.applications.api.HandlebarsApplicationMixin(ApplicationV2Expanded) {
  static override DEFAULT_OPTIONS = fu.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      tag: "form",
      classes: ["sheet", "perk-config-sheet", "default-sheet"],
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
        controls: []
      },
      actions: {
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
    },
    { inplace: false }
  );

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

    if (partId === "priorities") {
      if (!this.priorities) {
        const priority = this.priorities = {
          priority: this.document.priorities.sort((a, b) => a.priority - b.priority),
          // inactive: [] as GeneratorConfig["priorities"],
          negative: [] as GeneratorConfig["priorities"]
        }

        // const priorities = new Set(priority.priority.map(p => p.slug));
        // for (const arena of ["physical", "mental", "social"]) {
        //   if (!priorities.has(arena)) {
        //     priority.inactive.push({ slug: arena, priority: 0, type: "arena" });
        //   }
        // }
        // for (const approach of ["power", "finesse", "resilience"]) {
        //   if (!priorities.has(approach)) {
        //     priority.inactive.push({ slug: approach, priority: 0, type: "approach" });
        //   }
        // }

        result.priority = priority;
      } else {
        result.priority = this.priorities;
      }
    }
    return result;
  }

  override _onFirstRender(context: foundry.applications.api.ApplicationRenderContext, options: foundry.applications.api.HandlebarsRenderOptions): void {
    super._onFirstRender(context, options);

    if(this.element.querySelector(".choice.hidden")) {
      this.element.querySelector<HTMLInputElement>(`.choice input[name="config.entry.choice"]`)!.required = false;
    }
  }

  override _attachPartListeners(partId: string, htmlElement: HTMLElement, options: foundry.applications.api.HandlebarsRenderOptions): void {
    super._attachPartListeners(partId, htmlElement, options);

    if(partId === "config") {
      const entryRoot = htmlElement.querySelector<HTMLSelectElement>(`select[name="config.entry.mode"]`);
      if(!entryRoot) return;

      entryRoot.addEventListener("change", (event) => {
        const value = (event.target as HTMLSelectElement).value as "choice" | "random" | "best";
        if(value === "choice") {
          htmlElement.querySelector<HTMLDivElement>(".choice")?.classList.remove("hidden");
          htmlElement.querySelector<HTMLInputElement>(`.choice input[name="config.entry.choice"]`)!.required = true;
        }
        else {
          htmlElement.querySelector<HTMLDivElement>(".choice")?.classList.add("hidden");
          htmlElement.querySelector<HTMLInputElement>(`.choice input[name="config.entry.choice"]`)!.required = false;
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
        for(const input of entry.querySelectorAll<HTMLInputElement>("input[name='slug']")) {
          input.addEventListener("change", (event) => {
            this.priorities[parent][Number(index)].slug = (event.target as HTMLInputElement).value;
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
      // new Sortable(inactive, {
      //   ...baseSettings,
      //   onAdd: (event) => {
      //     const { type } = event.from.dataset;
      //     const entry = this.priorities[type as "priority" | "negative"].splice(event.oldIndex! - 1, 1)[0];
      //     entry.priority = 0;
      //     this.priorities.inactive.splice(event.newIndex! - 1, 0, entry);
      //     this.render({ parts: ["priorities"] });
      //   },
      // })
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
    const data: { type: string } = TextEditor.getDragEventData(event);
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
    if(!data.config) return;

    const config = data.config as GeneratorConfig['_source'];

    config.priorities = [...this.priorities.priority, ...this.priorities.negative] as GeneratorConfig['_source']['priorities'];
    if(config.entry.mode !== "choice" && config.entry.choice) config.entry.choice = null;

    // This is being submitted from a blueprint sheet.
    if(this.blueprintSheet && this.document?.parent instanceof Blueprint && this.document.parent?.parent instanceof BlueprintSystem) {
      const blueprint = this.document.parent.parent;
      if(this.blueprintSheet.generation?.temporary) {
        this.document.parent.updateSource({config: config});
      }
      else {
        await blueprint.updateChildren([{_id: this.document.parent.id, config: config}]);
      }
    }

    //Otherwise it's from the global sheet; which isn't yet implemented.

    return;
  }
}

//@ts-expect-error - Temporary
globalThis.PerkGeneratorConfig = PerkGeneratorConfig;