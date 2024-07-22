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

    static override defineSchema(): AbilitySchema {
        const fields = foundry.data.fields;
        return {
            ...super.defineSchema(),

            free: new fields.BooleanField({
                required: true,
                initial: false,
                label: "PTR2E.FIELDS.free.label",
                hint: "PTR2E.FIELDS.free.hint",
            }),
            slot: new fields.NumberField({
                required: true,
                nullable: true,
                initial: null,
                label: "PTR2E.FIELDS.slot.label",
                hint: "PTR2E.FIELDS.slot.hint",
            }),
        };
    }

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

export default interface AbilitySystem extends ModelPropsFromSchema<AbilitySchema> {}

type AbilitySchema = {
    slot: foundry.data.fields.NumberField<number, number, true, true, true>;
    free: foundry.data.fields.BooleanField<boolean, boolean, true, false, true>;
}

export type AbilitySource = BaseItemSourcePTR2e<"ability", AbilitySystemSource>;

interface AbilitySystemSource extends ItemSystemSource {
    slot: number;
    free: boolean;
}