import { WeaponPTR2e } from "@item";
import GearSystem, { GearSystemSource } from "./gear.ts";
import { BaseItemSourcePTR2e } from "./system.ts";

/**
 * @category Item Data Models
 */
export default abstract class WeaponSystem extends GearSystem {
    /**
     * @internal
     */
    declare parent: WeaponPTR2e;

    override async _preCreate(data: this["parent"]["_source"], options: DocumentModificationContext<this["parent"]["parent"]>, user: User): Promise<boolean | void> {
        const result = await super._preCreate(data, options, user);
        if (result === false) return false;

        if(!data.img || data.img === "icons/svg/item-bag.svg") {
            this.parent.updateSource({
                img: "/systems/ptr2e/img/icons/item_icon.webp"
            })
        }
    }

    override async toEmbed(_config: foundry.abstract.DocumentHTMLEmbedConfig, options: EnrichmentOptions, additionalProperties: Record<string, unknown> = {}): Promise<HTMLElement | HTMLCollection | null> {
        return super.toEmbed(_config, options, additionalProperties, "weapon");
    }
}

export type WeaponSource = BaseItemSourcePTR2e<"weapon", WeaponSystemSource>;

interface WeaponSystemSource extends GearSystemSource {}