import { default as ItemSheetPTR2e } from "./base.ts";
import type { AnyObject } from "fvtt-types/utils";

export default class ConsumableSheet extends ItemSheetPTR2e<AnyObject> {
  static override DEFAULT_OPTIONS = {
    classes: ["ability-sheet"],
  }

  static override readonly overviewTemplate = "systems/ptr2e/templates/items/consumable/consumable-overview.hbs";
  static override readonly detailsTemplate = "systems/ptr2e/templates/items/consumable/consumable-details.hbs";
  override noActions = true;

  static override PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> =
    foundry.utils.mergeObject(super.PARTS, {
      overview: {
        template: ConsumableSheet.overviewTemplate,
      },
      details: {
        template: ConsumableSheet.detailsTemplate,
      },
    }, { inplace: false });
}