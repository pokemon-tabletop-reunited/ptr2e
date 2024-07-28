import { ConsumablePTR2e } from "@item";
import { default as ItemSheetPTR2e } from "./base.ts";

export default class ConsumableSheet extends ItemSheetPTR2e<ConsumablePTR2e["system"]> {
    static override DEFAULT_OPTIONS = fu.mergeObject(
        super.DEFAULT_OPTIONS,
        {
            classes: ["ability-sheet"],
        },
        { inplace: false }
    );

    static override readonly overviewTemplate= "systems/ptr2e/templates/items/consumable/consumable-overview.hbs";
    static override readonly detailsTemplate= "systems/ptr2e/templates/items/consumable/consumable-details.hbs";
    override noActions = true;

    static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = 
        fu.mergeObject(super.PARTS, {
            overview: {
                template: ConsumableSheet.overviewTemplate,
            },
            details: {
                template: ConsumableSheet.detailsTemplate,
            },
        }, { inplace: false });
}