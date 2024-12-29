import type { GearPTR2e } from "@item";
import { default as ItemSheetPTR2e } from "./base.ts";

export default class GearSheet extends ItemSheetPTR2e<GearPTR2e["system"]> {
    static override DEFAULT_OPTIONS = foundry.utils.mergeObject(
        super.DEFAULT_OPTIONS,
        {
            classes: ["ability-sheet"],
        },
        { inplace: false }
    );

    static override readonly overviewTemplate= "systems/ptr2e/templates/items/gear/gear-overview.hbs";
    static override readonly detailsTemplate= "systems/ptr2e/templates/items/gear/gear-details.hbs";
    override noActions = true;

    static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = 
        foundry.utils.mergeObject(super.PARTS, {
            overview: {
                template: GearSheet.overviewTemplate,
            },
            details: {
                template: GearSheet.detailsTemplate,
            },
        }, { inplace: false });
}