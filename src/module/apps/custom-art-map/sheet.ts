import { HandlebarsRenderOptions } from "types/foundry/common/applications/handlebars-application.ts";
import { ApplicationConfigurationExpanded, ApplicationV2Expanded } from "../appv2-expanded.ts";
import { ImageResolver, SpeciesImageDataSource } from "@utils";
import { SpeciesPTR2e } from "@item";
import PTR2eArtMaps from "@module/data/art-map-collection.ts";

export class ArtMapSettingsMenu extends foundry.applications.api.HandlebarsApplicationMixin(ApplicationV2Expanded)<ApplicationConfigurationExpanded & { settings?: boolean }> {
  static override DEFAULT_OPTIONS = {
    tag: "form",
    classes: ["sheet", "custom-art-map", "default-sheet", "ptr2e"],
    id: "custom-art-map",
    position: {
      height: 450,
      width: 380,
    },
    window: {
      title: "PTR2E.ArtMap.Title",
      minimizable: true,
      resizable: true
    },
    form: {
      submitOnChange: false,
      closeOnSubmit: true,
      handler: ArtMapSettingsMenu.#onSubmit,
    },
    actions: {
    },
    dragDrop: [
      {
        dropSelector: "footer span.info"
      }
    ]
  }

  static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
    header: {
      id: "header",
      template: "systems/ptr2e/templates/apps/custom-art-map-header.hbs",
    },
    content: {
      id: "content",
      template: "systems/ptr2e/templates/apps/custom-art-map.hbs",
      scrollable: [".editor"],
    },
    footer: {
      id: "footer",
      template: "systems/ptr2e/templates/apps/custom-art-map-footer.hbs",
    }
  };

  override async _prepareContext(options?: HandlebarsRenderOptions | undefined) {
    const field = game.settings.settings.get("ptr2e.custom-art-map").type;
    const data = game.settings.get("ptr2e", "custom-art-map") as Record<string, SpeciesImageDataSource>;
    return {
      ...(await super._prepareContext(options)),
      data,
      field
    }
  }

  override _attachPartListeners(partId: string, htmlElement: HTMLElement, options: HandlebarsRenderOptions): void {
    super._attachPartListeners(partId, htmlElement, options);
  }

  override async _onDrop(event: DragEvent): Promise<void> {
    const data: {type?: string, uuid?: string} = foundry.applications.ux.TextEditor.getDragEventData(event);
    if(!data || data?.type != "Item" || !data?.uuid) return;
    const item = await fu.fromUuid<SpeciesPTR2e>(data.uuid);
    if(!item || item?.type != "species") return void ui.notifications.error(game.i18n.localize("PTR2E.ArtMap.Results.InvalidItem"));
    
    const formData = new FormDataExtended(this.element);
    const currentJSON: Record<string, SpeciesImageDataSource> = (() => {
      try {
        return JSON.parse(formData.object["ptr2e.custom-art-map"] as string);
      }
      catch {
        ui.notifications.error(game.i18n.localize("PTR2E.ArtMap.InvalidJSON"));
        return {};
      }
    })();
    if(!currentJSON) return;

    const tempArtMaps = new PTR2eArtMaps();
    for(const k in currentJSON) {
      const [key, data] = tempArtMaps._initializeSource(currentJSON[k], k, true);
      if(!key || !data) continue;
      tempArtMaps.set(key, data);
    }

    const config = tempArtMaps.get(item.slug);
    if(!config) {
      return void ui.notifications.info(game.i18n.format("PTR2E.ArtMap.Results.NotFound", {slug: item.slug}));
    }
    const resolver = await ImageResolver.createFromSpeciesData({
      dexId: item.system.number,
      shiny: false,
      forms: item.system.form?.split("-") ?? []
    }, config);
    if(!resolver?.result) {
      return void ui.notifications.info(game.i18n.format("PTR2E.ArtMap.Results.NoResult", {slug: item.slug, number: item.system.number, form: item.system.form ?? ""}));
    }
    
    const popout = new foundry.applications.apps.ImagePopout({
      src: resolver.result,
      uuid: item.uuid,
      window: { title: game.i18n.format("PTR2E.ArtMap.Results.Title", {name: item.name}) }
    })
    popout.render(true);

  }

  static async #onSubmit(this: ArtMapSettingsMenu, _event: Event, _element: HTMLFormElement, formData: FormDataExtended) {
    const json: object = (() => {
      try {
        return JSON.parse(formData.object["ptr2e.custom-art-map"] as string);
      }
      catch {
        ui.notifications.error(game.i18n.localize("PTR2E.ArtMap.InvalidJSON"));
        return null;
      }
    })();
    if(!json) return;
    await game.settings.set("ptr2e", "custom-art-map", json);
  }
}