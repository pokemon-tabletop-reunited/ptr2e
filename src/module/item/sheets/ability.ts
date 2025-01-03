import { default as ItemSheetPTR2e } from "./base.ts";
import type { AnyObject } from "fvtt-types/utils";

export default class AbilitySheet extends ItemSheetPTR2e<AnyObject> {
  static override DEFAULT_OPTIONS = foundry.utils.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      classes: ["ability-sheet"],
    },
    { inplace: false }
  );

  static override readonly overviewTemplate = "systems/ptr2e/templates/items/ability/ability-overview.hbs";
  static override readonly detailsTemplate = "systems/ptr2e/templates/items/ability/ability-details.hbs";
  override noActions = false;

  static override PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> =
    foundry.utils.mergeObject(super.PARTS, {
      overview: {
        template: AbilitySheet.overviewTemplate,
      },
      details: {
        template: AbilitySheet.detailsTemplate,
      },
    }, { inplace: false });
}