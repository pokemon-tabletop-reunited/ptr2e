import { WeaponPTR2e } from "@item";
import { default as ItemSheetPTR2e } from "./base.ts";

export default class WeaponSheet extends ItemSheetPTR2e<WeaponPTR2e["system"]> {
    static override DEFAULT_OPTIONS = fu.mergeObject(
        super.DEFAULT_OPTIONS,
        {
            classes: ["ability-sheet"],
        },
        { inplace: false }
    );

    static override readonly overviewTemplate= "systems/ptr2e/templates/items/weapon/weapon-overview.hbs";
    static override readonly detailsTemplate= "systems/ptr2e/templates/items/weapon/weapon-details.hbs";
    override noActions = false;

    static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = 
        fu.mergeObject(super.PARTS, {
            overview: {
                template: WeaponSheet.overviewTemplate,
            },
            details: {
                template: WeaponSheet.detailsTemplate,
            },
        }, { inplace: false });
}