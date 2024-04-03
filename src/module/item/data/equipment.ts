import { EquipmentPTR2e } from "@item";
import GearSystem, { GearSystemSource } from "./gear.ts";
import { BaseItemSourcePTR2e } from "./system.ts";

/**
 * @category Item Data Models
 */
export default abstract class EquipmentSystem extends GearSystem {
    /**
     * @internal
     */
    declare parent: EquipmentPTR2e;

    override async _preCreate(data: this["parent"]["_source"], options: DocumentModificationContext<this["parent"]["parent"]>, user: User): Promise<boolean | void> {
        const result = await super._preCreate(data, options, user);
        if (result === false) return false;

        if(!data.img || data.img === "icons/svg/item-bag.svg") {
            this.parent.updateSource({
                img: "/systems/ptr2e/img/icons/item_icon.webp"
            })
        }
    }
}

export type EquipmentSource = BaseItemSourcePTR2e<"equipment", EquipmentSystemSource>;

interface EquipmentSystemSource extends GearSystemSource {}