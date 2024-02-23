//@ts-nocheck
import { AbilityPTR2e } from "@item";
import { ItemSheetPTR2e } from "@item/base/sheet.ts";
import { DocumentSheetV2 } from "@module/apps/appv2/document-sheet.ts";

class AbilitySheet extends foundry.applications.api.HandlebarsApplicationMixin(DocumentSheetV2) {
    static DEFAULT_OPTIONS = fu.mergeObject(super.DEFAULT_OPTIONS, {
        id: "ability-sheet-{id}",
        classes: ["ability-sheet"],
        window: {
            title: "Ability Sheet",
            icon: '<i class="fas fa-spell"></i>',
        },
        position: {
            width: 600,
            height: 400,
        },
        actions: {

        }
    }, { inplace: false })

    static override PARTS = {
        body: {
            id: "body",
            template: "/systems/ptr2e/templates/items/ability-body.hbs",
        }
    }

    _attachPartListeners(partId: string, htmlElement: HTMLElement, options?: Record<string,unknown>) {
        console.log("Attaching part listeners", partId, htmlElement, options);
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

