import { SummonPTR2e } from "@item";
import { default as ItemSheetPTR2e } from "./base.ts";

export default class SummonSheet extends ItemSheetPTR2e<SummonPTR2e["system"]> {
    static override DEFAULT_OPTIONS = fu.mergeObject(
        super.DEFAULT_OPTIONS,
        {
            classes: ["summon-sheet"],
        },
        { inplace: false }
    );

    static override readonly overviewTemplate= "systems/ptr2e/templates/items/summon/summon-overview.hbs";
    static override readonly detailsTemplate= "systems/ptr2e/templates/items/summon/summon-details.hbs";
    override noActions = false;

    static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = 
        fu.mergeObject(super.PARTS, {
            overview: {
                template: SummonSheet.overviewTemplate,
            },
            details: {
                template: SummonSheet.detailsTemplate,
            },
        }, { inplace: false });
}