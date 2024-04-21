import { PerkPTR2e } from "@item";
import { default as ItemSheetPTR2e } from "./base.ts";

export default class PerkSheet extends ItemSheetPTR2e<PerkPTR2e["system"]> {
    static override DEFAULT_OPTIONS = fu.mergeObject(
        super.DEFAULT_OPTIONS,
        {
            classes: ["ability-sheet"],
        },
        { inplace: false }
    );

    static override readonly overviewTemplate= "systems/ptr2e/templates/items/perk/perk-overview.hbs";
    static override readonly detailsTemplate= "systems/ptr2e/templates/items/perk/perk-details.hbs";
    override noActions: boolean = true;

    static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = 
        fu.mergeObject(super.PARTS, {
            overview: {
                template: PerkSheet.overviewTemplate,
            },
            details: {
                template: PerkSheet.detailsTemplate,
            },
        }, { inplace: false });
}