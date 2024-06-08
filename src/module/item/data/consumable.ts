import { ConsumablePTR2e } from "@item";
import { HasContainer, HasDescription, HasEmbed, HasSlug, HasTraits } from "@module/data/index.ts";
import { BaseItemSourcePTR2e, ItemSystemSource } from "./system.ts";

const CONSUMABLE_TYPES = {
    ammo: "PTR2E.FIELDS.consumable.type.ammo",
    boosters: "PTR2E.FIELDS.consumable.type.boosters",
    "evolution-item": "PTR2E.FIELDS.consumable.type.evolution-item",
    food: "PTR2E.FIELDS.consumable.type.food",
    pokeball:"PTR2E.FIELDS.consumable.type.pokeball",
    restorative:"PTR2E.FIELDS.consumable.type.restorative",
    other:"PTR2E.FIELDS.consumable.type.other",
} as const
type ConsumableType = keyof typeof CONSUMABLE_TYPES;
const ConsumableExtension = HasEmbed(HasTraits(HasDescription(HasSlug(HasContainer(foundry.abstract.TypeDataModel)))), "consumable");

/**
 * @category Item Data Models
 */
export default abstract class ConsumableSystem extends ConsumableExtension {
    /**
     * @internal
     */
    declare parent: ConsumablePTR2e;

    /**
     * The type of consumable item.
     */
    abstract consumableType: ConsumableType;

    /**
     * The number of charges the consumable has.
     */
    abstract charges: {
        value: number;
        max: number;
    }

    /**
     * @internal
     */
    declare _source: InstanceType<typeof ConsumableExtension>['_source'] & {
        consumableType: ConsumableType;
        charges: {
            value: number;
            max: number;
        }
    }

    static override defineSchema(): foundry.data.fields.DataSchema {
        const fields = foundry.data.fields;
        return {
            ...super.defineSchema(),
            consumableType: new fields.StringField({ required: true, initial: "other", choices: CONSUMABLE_TYPES, label: "PTR2E.FIELDS.consumable.type.label", hint: "PTR2E.FIELDS.consumable.type.hint"}),
            charges: new fields.SchemaField({
                value: new fields.NumberField({ required: true, initial: 1, min: 0, step: 1, label: "PTR2E.FIELDS.consumable.charges.value.label", hint: "PTR2E.FIELDS.consumable.charges.value.hint"}),
                max: new fields.NumberField({ required: true, initial: 1, min: 1, step: 1, label: "PTR2E.FIELDS.consumable.charges.max.label", hint: "PTR2E.FIELDS.consumable.charges.max.hint"}),
            }),
            modifier: new fields.NumberField({required: true, nullable: true, initial: null, label: "PTR2E.FIELDS.consumable.modifier.label", hint: "PTR2E.FIELDS.consumable.modifier.hint"})
        };
    }

    static override validateJoint(data: ConsumableSystem['_source']) {
        if(data.charges.value > data.charges.max) throw new Error("PTR2E.Errors.ChargesValueGreaterThanMax");
    }

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

export type ConsumableSource = BaseItemSourcePTR2e<"consumable", ConsumableSystemSource>;

interface ConsumableSystemSource extends Omit<ItemSystemSource, 'actions'> {
    consumableType: ConsumableType;
    charges: {
        value: number;
        max: number;
    }
}