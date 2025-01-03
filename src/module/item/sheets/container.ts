import { default as ItemSheetPTR2e } from "./base.ts";
import type { AnyObject } from "fvtt-types/utils";

export default class ContainerSheet extends ItemSheetPTR2e<AnyObject> {
  static override DEFAULT_OPTIONS = {
    classes: ["ability-sheet"],
  }

  static override readonly overviewTemplate = "systems/ptr2e/templates/items/container/container-overview.hbs";
  static override readonly detailsTemplate = "systems/ptr2e/templates/items/container/container-details.hbs";
  override noActions = true;

  static override PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> =
    foundry.utils.mergeObject(super.PARTS, {
      overview: {
        template: ContainerSheet.overviewTemplate,
      },
      details: {
        template: ContainerSheet.detailsTemplate,
      },
    }, { inplace: false });
}