import { default as ItemSheetPTR2e } from "./base.ts";
import type { AnyObject } from "fvtt-types/utils";

export default class EffectSheet extends ItemSheetPTR2e<AnyObject> {
  static override DEFAULT_OPTIONS = {
    classes: ["effect-sheet"],
  }

  static override readonly overviewTemplate = "systems/ptr2e/templates/items/effect/effect-overview.hbs";
  static override readonly detailsTemplate = "systems/ptr2e/templates/items/effect/effect-details.hbs";
  override noActions = true;

  static override PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> =
    foundry.utils.mergeObject(super.PARTS, {
      overview: {
        template: EffectSheet.overviewTemplate,
      },
      details: {
        template: EffectSheet.detailsTemplate,
      },
    }, { inplace: false });
}