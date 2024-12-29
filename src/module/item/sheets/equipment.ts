import type { EquipmentPTR2e } from "@item";
import { default as ItemSheetPTR2e } from "./base.ts";

export default class EquipmentSheet extends ItemSheetPTR2e<EquipmentPTR2e["system"]> {
    static override DEFAULT_OPTIONS = foundry.utils.mergeObject(
        super.DEFAULT_OPTIONS,
        {
            classes: ["ability-sheet"],
        },
        { inplace: false }
    );

    static override readonly overviewTemplate= "systems/ptr2e/templates/items/equipment/equipment-overview.hbs";
    static override readonly detailsTemplate= "systems/ptr2e/templates/items/equipment/equipment-details.hbs";
    override noActions = true;

    static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = 
        foundry.utils.mergeObject(super.PARTS, {
            overview: {
                template: EquipmentSheet.overviewTemplate,
            },
            details: {
                template: EquipmentSheet.detailsTemplate,
            },
        }, { inplace: false });
}