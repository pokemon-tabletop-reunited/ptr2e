import { ItemSheetOptions, MovePTR2e } from "@item";
import { ItemSheetPTR2e } from "@item";
import { ActionPTR2e } from "@module/data/models/action.ts";

export default class MoveSheetPTR2e extends ItemSheetPTR2e<MovePTR2e> {
    static override get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["move", "ptr2e"],
            template: "/systems/ptr2e/templates/items/move.hbs",
            width: 365,
            height: 550,
            tabs: [{ navSelector: ".tabs", contentSelector: ".sheet-body", initial: "description" }],
        }, { inplace: false });
    }

    override async getData(option?: Partial<ItemSheetOptions> | undefined): Promise<ItemSheetData<MovePTR2e>> {
        const data = await super.getData(option);

        return data;
    }

    override activateListeners(html: JQuery) {
        super.activateListeners(html);

        html.find(".item-control").on("click", (event) => {
            event.preventDefault();
            const control = event.currentTarget;
            const { type, action } = control.dataset;
            switch (action) {
                case "create":
                    switch (type) {
                        case "attack": {
                            const actions = fu.duplicate(this.item.system._source.actions);
                            const lastAction = actions.at(-1);
                            const newIndex = (Number(lastAction?.slug.split("-").at(-1) ?? 0) || 0) + 1;
                            actions.push(new ActionPTR2e({
                                slug: `${this.item.slug}-attack-${newIndex}`,
                                name: `${this.item.name} Attack ${newIndex}`,
                                type: "attack",
                            }));
                            return this.item.update({ "system.actions": actions });
                        }
                    }
                    break;
                case "delete": {
                    switch (type) {
                        case "attack": {
                            const parent = control.closest(".attack-action[data-target]") as HTMLElement;
                            const slug = parent?.dataset.target;
                            if(!slug) return;
                            const actions = fu.duplicate(this.item.system._source.actions).filter((action: ActionPTR2e) => action.slug !== slug);
                            return this.item.update({ "system.actions": actions });
                        }
                    }
                    break;
                }
                default:
                    break;
            }
            return;
        });
    }
}