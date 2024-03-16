import { AbilityPTR2e, ItemSheetOptions } from "@item";
import { ItemSheetPTR2e } from "@item";

export default class AbilitySheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.DocumentSheetV2<AbilityPTR2e, foundry.applications.api.HandlebarsDocumentSheetConfiguration>) {
    static override DEFAULT_OPTIONS = fu.mergeObject(super.DEFAULT_OPTIONS, {
        classes: ["ability-sheet"],
        position: {
            height: 400,
            width: 600,
        }
    }, { inplace: false })

    static override PARTS = {
        body: {
            id: "body",
            template: "/systems/ptr2e/templates/items/ability.hbs",
        }
    }

    override async _prepareContext() {

        return {
            ...(await super._prepareContext()),
            fields: this.document.system.schema.fields
        }
    }
}

class AbilitySheetPTR2e extends ItemSheetPTR2e<AbilityPTR2e> {
    static override get defaultOptions() {
        return fu.mergeObject(super.defaultOptions, {
            classes: ["ability"],
            template: "/systems/ptr2e/templates/items/ability.hbs",
            width: 600,
            height: 400,
            tabs: [{ navSelector: ".tabs", contentSelector: ".sheet-body", initial: "description" }],
        }, { inplace: false })
    }

    override async getData(option?: Partial<ItemSheetOptions> | undefined): Promise<ItemSheetData<AbilityPTR2e>> {
        const data = await super.getData(option);
        data.fields = {}
        for (const key in this.document.system.schema.fields) {
            const field = this.document.system.schema.fields[key];
            try {
                field.toInput();
                data.fields[key] = field;
            }
            catch {
                console.debug(`Field ${key} is not a valid input field`)
            }
        }
        return data;
    }
}

export { AbilitySheetPTR2e, AbilitySheet }

