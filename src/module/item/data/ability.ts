import { AbilityPTR2e } from "@item";
import { HasBase } from "@module/data/index.ts";

/**
 * @category Item Data Models
 * @extends {HasBase}
 * @extends {foundry.abstract.TypeDataModel}
 */
export default abstract class AbilitySystem extends HasBase(foundry.abstract.TypeDataModel) {
    /**
     * @internal
     */
    declare parent: AbilityPTR2e;

    override async _preCreate(data: this["parent"]["_source"], options: DocumentModificationContext<this["parent"]["parent"]>, user: User): Promise<boolean | void> {
        const result = await super._preCreate(data, options, user);
        if (result === false) return false;

        if(!data.img || data.img === "icons/svg/item-bag.svg") {
            this.parent.updateSource({
                img: "/systems/ptr2e/img/icons/ability_icon.webp"
            })
        }
    }
}
