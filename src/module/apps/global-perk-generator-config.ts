import { GeneratorConfig } from "@module/data/models/generator-config.ts";
import { ApplicationConfigurationExpanded, ApplicationV2Expanded } from "./appv2-expanded.ts";
import { PerkGeneratorConfig } from "./perk-generator-config.ts";
import { exportToJSON, importFromJSON } from "@utils";
import { BlueprintPTR2e } from "@item";

export class GlobalPerkGeneratorConfig extends foundry.applications.api.HandlebarsApplicationMixin(ApplicationV2Expanded) {
  static override DEFAULT_OPTIONS = {
    tag: "aside",
    id: "global-perk-config",
    classes: ["ptr2e", "sheet", "global-perk-config-sheet"],
    position: {
      height: 250,
      width: 400,
    },
    window: {
      minimizable: true,
      resizable: true,
    },
    dragDrop: [{ dragSelector: ".content-link[data-type='GeneratorConfig']" }],
    actions: {
      "open-entry": function (this: GlobalPerkGeneratorConfig, _event: PointerEvent, element: HTMLElement) {
        const id = element.dataset.id;
        if (!id) return void ui.notifications.error("The config could not be found");

        const config = game.settings.get("ptr2e", "global-perk-configs").find((d) => d.id === id);
        if (!config) return void ui.notifications.error("The config could not be found");

        new PerkGeneratorConfig(new GeneratorConfig(config)).render(true);
      },
      "export-config": async function (this: GlobalPerkGeneratorConfig, _event: PointerEvent, element: HTMLElement) {
        const id = element.dataset.id;
        if (!id) return void ui.notifications.error("The config could not be found");

        const config = game.settings.get("ptr2e", "global-perk-configs").find((d) => d.id === id);
        if (!config) return void ui.notifications.error("The config could not be found");

        exportToJSON({
          data: config,
          type: "GeneratorConfig",
          label: config.label,
        });
      },
      "delete-config": async function (this: GlobalPerkGeneratorConfig, _event: PointerEvent, element: HTMLElement) {
        const id = element.dataset.id;
        if (!id) return void ui.notifications.error("The config could not be found");

        const config = game.settings.get("ptr2e", "global-perk-configs").find((d) => d.id === id);
        if (!config) return void ui.notifications.error("The config could not be found");

        foundry.applications.api.DialogV2.confirm({
          window: {
            title: game.i18n.format("PTR2E.GeneratorConfig.Global.Delete.Title", {
              name: config.label,
            }),
          },
          content: game.i18n.format("PTR2E.GeneratorConfig.Global.Delete.Content", {
            name: config.label
          }),
          yes: {
            callback: async () => {
              const configs = game.settings.get("ptr2e", "global-perk-configs");
              const index = configs.findIndex((d) => d.id === config.id);
              if (index === -1) return;

              configs.splice(index, 1);
              await game.settings.set("ptr2e", "global-perk-configs", configs);
              await this.render({ parts: ["config"] });
            },
          },
        });
      },
      "import": async function (this: GlobalPerkGeneratorConfig) {
        const { data } = await importFromJSON<GeneratorConfig["_source"]>({ name: "Perk Generator Config", type: "GeneratorConfig" }) ?? {};
        if (!data) return;

        const configs = game.settings.get("ptr2e", "global-perk-configs");
        const exists = configs.find((d) => d.id === data.id);
        if (exists) {
          if (exists.label === data.label) {
            return void ui.notifications.error("It appears this config is already saved to the Global Config.");
          }
          data.id = fu.randomID();
        }

        configs.push(data);
        await game.settings.set("ptr2e", "global-perk-configs", configs);
        await this.render({ parts: ["config"] });
      }
    }
  };

  static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
    header: {
      id: "header",
      template: "systems/ptr2e/templates/apps/global-perk-generator-header.hbs",
    },
    config: {
      id: "config",
      template: "systems/ptr2e/templates/apps/global-perk-generator-config.hbs",
      scrollable: [".scroll"],
    },
  };

  filter: SearchFilter;

  constructor(options?: Partial<ApplicationConfigurationExpanded>) {
    super(options);

    this.filter = new foundry.applications.ux.SearchFilter({
      inputSelector: "input[name='filter']",
      contentSelector: ".configs.scroll",
      callback: this._onSearchFilter.bind(this),
    });
  }

  override get title() {
    return `Global Perk Generator Configs`;
  }

  override async _prepareContext() {
    const data = game.settings.get("ptr2e", "global-perk-configs");
    return {
      data
    }
  }

  override _onRender(context: foundry.applications.api.ApplicationRenderContext, options: foundry.applications.api.HandlebarsRenderOptions): void {
    super._onRender(context, options);

    this.filter.bind(this.element);
  }

  override _onDragStart(event: DragEvent): void {
    const entry = event.currentTarget as HTMLElement;
    const id = entry.dataset.id;
    if (!id) return;

    const config = game.settings.get("ptr2e", "global-perk-configs")?.find((d) => d.id === id);
    if (!config) return;

    const dragData = {
      type: "GeneratorConfig",
      id: config.id,
    }

    event.dataTransfer!.setData("text/plain", JSON.stringify(dragData));
  }

  override async _onDrop(event: DragEvent) {
    const data = foundry.applications.ux.TextEditor.getDragEventData(event) as Record<string, string>;
    if (data.type !== "GeneratorConfig") return;

    const config = data.uuid ? await (async () => {
      const blueprintItem = await fromUuid<BlueprintPTR2e>(data.uuid);
      if (!blueprintItem) {
        ui.notifications.error("The dropped blueprint could not be found");
        return;
      }

      const blueprint = blueprintItem.system.blueprints.get(data.id);
      if (!blueprint) {
        ui.notifications.error("The dropped blueprint could not be found");
        return;
      }

      return blueprint.config?.clone();
    })() : null;
    if (!config) return;

    const configs = game.settings.get("ptr2e", "global-perk-configs");
    const exists = configs.find((d) => d.id === config.id);

    if (exists) {
      if (exists.label === config.label) {
        return void ui.notifications.error("It appears this config is already saved to the Global Config.");
      }
      config.updateSource({ id: fu.randomID() });
    }

    configs.push(config.toObject());
    await game.settings.set("ptr2e", "global-perk-configs", configs);
    await this.render({ parts: ["config"] });
  }

  _onSearchFilter(_event: KeyboardEvent, query: string, rgx: RegExp, html: HTMLElement) {
    for (const entry of html.querySelectorAll<HTMLAnchorElement>(".entry")) {
      if (!query) {
        entry.classList.remove("hidden");
        continue;
      }
      const label = entry.dataset.label;
      const match = (label && rgx.test(foundry.applications.ux.SearchFilter.cleanQuery(label)));
      entry.classList.toggle("hidden", !match);
    }
  }
}