import { ItemPTR2e } from "@item/document.ts";
import { DocumentSheetV2 } from "./document.ts";
import BlueprintSystem from "@item/data/blueprint.ts";

export default class BlueprintSheet extends foundry.applications.api.HandlebarsApplicationMixin(DocumentSheetV2<ItemPTR2e<BlueprintSystem>>) {
  static override DEFAULT_OPTIONS = fu.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      classes: ["blueprint-sheet", "sheet"],
      position: {
        width: 700,
        height: 500,
      },
      window: {
        resizable: true,
      },
      form: {
        submitOnChange: true,
        closeOnSubmit: false,
        handler: this.#onSubmit,
      },
      tag: "form",
    },
    { inplace: false }
  );

  static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
    main: {
      id: "main",
      template: "systems/ptr2e/templates/items/blueprint/blueprint-sheet.hbs",
    },
  };

  override async _prepareContext(): Promise<object> {
    return {
        ...(await super._prepareContext()),
    };
}

  static async #onSubmit(
    this: BlueprintSheet
  ) {
    console.log("Submit");
  }
}