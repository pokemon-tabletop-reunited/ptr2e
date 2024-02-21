//@ts-nocheck
import { AbilityPTR2e } from "@item";
import { ItemSheetPTR2e } from "@item/base/sheet.ts";

class AbilitySheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
    static DEFAULT_OPTIONS = fu.mergeObject(super.DEFAULT_OPTIONS, {
        classes: ["ability-sheet"]
    }, { inplace: false })

    static PARTS = {
        body: {
            id: "body",
            template: "/systems/ptr2e/templates/items/ability.hbs",
        }
    }

}

class AbilitySheetPTR2e extends ItemSheetPTR2e<AbilityPTR2e> {
    static get defaultOptions() {
        return fu.mergeObject(super.defaultOptions, {
            classes: ["ptr", "sheet", "ability"],
            template: "/systems/ptr2e/templates/items/ability.hbs",
            width: 600,
            height: 400,
            tabs: [{ navSelector: ".tabs", contentSelector: ".sheet-body", initial: "description" }],
        }, { inplace: false })
    
    }
}

export { AbilitySheetPTR2e, AbilitySheet }

