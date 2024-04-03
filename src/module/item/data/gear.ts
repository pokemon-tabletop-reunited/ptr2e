import { GearPTR2e } from "@item";
import { EquipmentData, HasBase, HasGearData, HasIdentification, IdentificationStatus} from "@module/data/index.ts";
import { BaseItemSourcePTR2e, ItemSystemSource } from "./system.ts";

/**
 * @category Item Data Models
 */
export default abstract class GearSystem extends HasIdentification(HasGearData(HasBase(foundry.abstract.TypeDataModel))) {
    /**
     * @internal
     */
    declare parent: GearPTR2e;

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

export type GearSource = BaseItemSourcePTR2e<"gear", GearSystemSource>;

export interface GearSystemSource extends ItemSystemSource {
    cost: number;
    crafting: {
        skill: string;
        time: {
            value: number;
            unit: string;
        }
    };
    equipped: EquipmentData;
    grade: string;
    quantity: number;
    rarity: string;

    identification: {
        misidentified: DocumentUUID | null;
        status: IdentificationStatus;
        unidentified: {
            name: string;
            img: string;
            description: string;
        }
    }
}