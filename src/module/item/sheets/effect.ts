import { EffectPTR2e } from "@item";
import { default as ItemSheetPTR2e } from "./base.ts";

export default class EffectSheet extends ItemSheetPTR2e<EffectPTR2e["system"]> {
  static override DEFAULT_OPTIONS = fu.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      classes: ["effect-sheet"],
    },
    { inplace: false }
  );

  static override readonly overviewTemplate = "systems/ptr2e/templates/items/effect/effect-overview.hbs";
  static override readonly detailsTemplate = "systems/ptr2e/templates/items/effect/effect-details.hbs";
  override noActions = true;

  static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> =
    fu.mergeObject(super.PARTS, {
      overview: {
        template: EffectSheet.overviewTemplate,
      },
      details: {
        template: EffectSheet.detailsTemplate,
      },
    }, { inplace: false });
}