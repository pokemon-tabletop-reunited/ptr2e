import { ItemPTR2e } from "@item";
import { SpeciesSystemModel } from "@item/data/index.ts";
import type {
  ApplicationConfigurationExpanded} from "@module/apps/appv2-expanded.ts";
import {
  ApplicationV2Expanded,
} from "@module/apps/appv2-expanded.ts";

class SpeciesDropSheetV2 extends foundry.applications.api.HandlebarsApplicationMixin(
  ApplicationV2Expanded
) {
  static override DEFAULT_OPTIONS = foundry.utils.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      classes: ["pokemon", "sheet", "actor"],
      position: {
        width: 250,
        height: 141,
      },
      window: {
        resizable: false,
      },
      tag: "form",
      dragDrop: [{ dragSelector: ".species-link", dropSelector: "form" }],
    },
    { inplace: false }
  );

  static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
    main: {
      id: "main",
      template: "systems/ptr2e/templates/actor/species-drop.hbs",
    },
  }

  promise: (value: ItemPTR2e<SpeciesSystemModel> | null) => void;

  constructor(
    promise: (value: ItemPTR2e<SpeciesSystemModel> | null) => void,
    options?: ApplicationConfigurationExpanded
  ) {
    super(options);

    this.promise = promise;
  }

  override get title() {
    return "Creating a Pokemon...";
  }

  override async _onDrop(event: DragEvent) {
    const data = TextEditor.getDragEventData(event) as Record<string, string>;
    if (data.type === "Item") {
      const item = await fromUuid(data.uuid);
      if (!item) {
        ui.notifications.error("The dropped item could not be found");
        return;
      }

      if (!(item instanceof ItemPTR2e && item.system instanceof SpeciesSystemModel)) {
        ui.notifications.error("The dropped item is not a species");
        return;
      }

      this.promise(item);
      return void this.close();
    }
  }
}

export { SpeciesDropSheetV2 as SpeciesDropSheet };
