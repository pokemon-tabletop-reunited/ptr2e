import type { AnyObject } from "fvtt-types/utils";
import { default as ItemSheetPTR2e } from "./base.ts";

export default class EquipmentSheet extends ItemSheetPTR2e<AnyObject> {
  static override DEFAULT_OPTIONS = {
    classes: ["ability-sheet"],
  }

  static override readonly overviewTemplate = "systems/ptr2e/templates/items/equipment/equipment-overview.hbs";
  static override readonly detailsTemplate = "systems/ptr2e/templates/items/equipment/equipment-details.hbs";
  override noActions = true;

  static override PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> =
    foundry.utils.mergeObject(super.PARTS, {
      overview: {
        template: EquipmentSheet.overviewTemplate,
      },
      details: {
        template: EquipmentSheet.detailsTemplate,
      },
    }, { inplace: false });
}