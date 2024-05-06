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
    override noActions: boolean = false;

    override async _prepareContext() {
        const [itemNames, itemLinks] = await (async () => {
            const result = await Promise.all(this.document.system.prerequisites.map(async prereq =>{
                const item = await fromUuid<PerkPTR2e>(prereq);
                if(!item) return [prereq, prereq];

                return [item.name, await TextEditor.enrichHTML(item.link)]
            }));

            return [result.map(r => r[0]), result.map(r => r[1])];
        })();
        return {
            ...(await super._prepareContext()),
            prerequisites: {
                names: itemNames,
                links: itemLinks,
            }
        }
    }

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