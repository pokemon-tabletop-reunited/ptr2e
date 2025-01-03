import type { AnyObject } from "fvtt-types/utils";
import { default as ItemSheetPTR2e } from "./base.ts";

export default class WeaponSheet extends ItemSheetPTR2e<AnyObject> {
  static override DEFAULT_OPTIONS = {
    classes: ["ability-sheet"],
  }

  static override readonly overviewTemplate = "systems/ptr2e/templates/items/weapon/weapon-overview.hbs";
  static override readonly detailsTemplate = "systems/ptr2e/templates/items/weapon/weapon-details.hbs";
  override noActions = false;

  static override PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> =
    foundry.utils.mergeObject(super.PARTS, {
      overview: {
        template: WeaponSheet.overviewTemplate,
      },
      details: {
        template: WeaponSheet.detailsTemplate,
      },
    }, { inplace: false });
}