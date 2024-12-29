import type { AbilityPTR2e } from "@item";
import { default as ItemSheetPTR2e } from "./base.ts";

export default class AbilitySheet extends ItemSheetPTR2e<AbilityPTR2e["system"]> {
    static override DEFAULT_OPTIONS = foundry.utils.mergeObject(
        super.DEFAULT_OPTIONS,
        {
            classes: ["ability-sheet"],
        },
        { inplace: false }
    );

    static override readonly overviewTemplate= "systems/ptr2e/templates/items/ability/ability-overview.hbs";
    static override readonly detailsTemplate= "systems/ptr2e/templates/items/ability/ability-details.hbs";
    override noActions = false;

    static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = 
        foundry.utils.mergeObject(super.PARTS, {
            overview: {
                template: AbilitySheet.overviewTemplate,
            },
            details: {
                template: AbilitySheet.detailsTemplate,
            },
        }, { inplace: false });
}