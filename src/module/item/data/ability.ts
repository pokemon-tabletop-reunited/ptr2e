import { AbilityPTR2e } from "@item";
import { HasBase, HasEmbed } from "@module/data/index.ts";
import { BaseItemSourcePTR2e, ItemSystemSource } from "./system.ts";

/**
 * @category Item Data Models
 * @extends {HasBase}
 * @extends {foundry.abstract.TypeDataModel}
 */
export default abstract class AbilitySystem extends HasEmbed(HasBase(foundry.abstract.TypeDataModel), "ability") {
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

export type AbilitySource = BaseItemSourcePTR2e<"ability", AbilitySystemSource>;

interface AbilitySystemSource extends ItemSystemSource {
    
}