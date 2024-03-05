import { ConsumablePTR2e } from "@item";
import { HasContainer, HasDescription, HasSlug, HasTraits } from "@module/data/index.ts";

const CONSUMABLE_TYPES = ["food", "restorative", "boosters", "ammo", "evolution-item", "pokeball", "other"] as const
type ConsumableType = typeof CONSUMABLE_TYPES[number];
const ConsumableExtension = HasTraits(HasDescription(HasSlug(HasContainer(foundry.abstract.TypeDataModel))))

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
            consumableType: new fields.StringField({ required: true, initial: "other", choices: CONSUMABLE_TYPES }),
            charges: new fields.NumberField({ required: true, initial: 1 }),
        };
    }
}