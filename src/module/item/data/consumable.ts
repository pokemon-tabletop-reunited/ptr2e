import { ContainerPTR2e } from "@item";
import { HasContainer, HasDescription, HasEmbed, HasGearData, HasMigrations, HasSlug, HasTraits, Trait } from "@module/data/index.ts";
import { BaseItemSourcePTR2e, ItemSystemSource } from "./system.ts";
import { MigrationSchema } from "@module/data/mixins/has-migrations.ts";
import { TraitsSchema } from "@module/data/mixins/has-traits.ts";
import { DescriptionSchema } from "@module/data/mixins/has-description.ts";
import { SlugSchema } from "@module/data/mixins/has-slug.ts";
import { ContainerSchema } from "@module/data/mixins/has-container.ts";
import { GearSchema } from "@module/data/mixins/has-gear-data.ts";

const CONSUMABLE_TYPES = {
  ammo: "PTR2E.FIELDS.consumable.type.ammo",
  boosters: "PTR2E.FIELDS.consumable.type.boosters",
  "evolution-item": "PTR2E.FIELDS.consumable.type.evolution-item",
  food: "PTR2E.FIELDS.consumable.type.food",
  pokeball: "PTR2E.FIELDS.consumable.type.pokeball",
  restorative: "PTR2E.FIELDS.consumable.type.restorative",
  other: "PTR2E.FIELDS.consumable.type.other",
} as const
type ConsumableType = keyof typeof CONSUMABLE_TYPES;
const ConsumableExtension = HasEmbed(HasMigrations(HasTraits(HasDescription(HasSlug(HasContainer(HasGearData(foundry.abstract.TypeDataModel)))))), "consumable");

/**
 * @category Item Data Models
 */
export default abstract class ConsumableSystem extends ConsumableExtension {
  // /**
  //  * @internal
  //  */
  // declare parent: ConsumablePTR2e;

  // /**
  //  * The type of consumable item.
  //  */
  // abstract consumableType: ConsumableType;

  // /**
  //  * The number of charges the consumable has.
  //  */
  // abstract charges: {
  //     value: number;
  //     max: number;
  // }

  // /**
  //  * The Capture Rate Modifier
  //  */
  // abstract modifier: number | null;

  // /**
  //  * @internal
  //  */
  // declare _source: InstanceType<typeof ConsumableExtension>['_source'] & {
  //     consumableType: ConsumableType;
  //     charges: {
  //         value: number;
  //         max: number;
  //     }
  // }

  static override defineSchema(): ConsumableSystemSchema {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema() as ConsumableSystemSchemaExtension,
      consumableType: new fields.StringField({ required: true, initial: "other", choices: CONSUMABLE_TYPES, label: "PTR2E.FIELDS.consumable.type.label", hint: "PTR2E.FIELDS.consumable.type.hint" }),
      stack: new fields.NumberField({ required: true, initial: 1, min: 1, step: 1, label: "PTR2E.FIELDS.consumable.stack.label", hint: "PTR2E.FIELDS.consumable.stack.hint" }),
      modifier: new fields.NumberField({ required: true, nullable: true, initial: null, label: "PTR2E.FIELDS.consumable.modifier.label", hint: "PTR2E.FIELDS.consumable.modifier.hint" }),
      cost: new fields.NumberField({
        required: true,
        nullable: true,
        initial: null,
        validate: (d) => d === null || (d as number) > 0,
        label: "PTR2E.FIELDS.consumable.cost.label",
        hint: "PTR2E.FIELDS.consumable.cost.hint",
      }),
      temporary: new fields.BooleanField({
        required: true,
        initial: false,
        label: "PTR2E.FIELDS.consumable.temporary.label",
        hint: "PTR2E.FIELDS.consumable.temporary.hint",
      }),
    };
  }

  override async _preCreate(data: this["parent"]["_source"], options: DocumentModificationContext<this["parent"]["parent"]>, user: User): Promise<boolean | void> {
    const result = await super._preCreate(data, options, user);
    if (result === false) return false;

    if (!data.img || data.img === "icons/svg/item-bag.svg") {
      this.parent.updateSource({
        img: "systems/ptr2e/img/icons/consumable_icon.webp"
      })
    }
  }
  
  override prepareBaseData() {
    super.prepareBaseData();

    // Add stack value if greater than 1
    if (this.stack! > 1) {
      const stackTraitSlug = `stack-${this.stack}`;
      if (Trait.isValid(stackTraitSlug) && !this.traits.has(stackTraitSlug)) {
        this.addTraitFromSlug(stackTraitSlug, true);
      }
    }
  }
}

export default interface ConsumableSystem extends ModelPropsFromSchema<ConsumableSystemSchema> {
  container: ContainerPTR2e | null;

  _source: SourceFromSchema<ConsumableSystemSchema>;
}

interface ConsumableSystemSchema extends foundry.data.fields.DataSchema, ConsumableSystemSchemaExtension {
  consumableType: foundry.data.fields.StringField<string, ConsumableType, true, false, true>;
  stack: foundry.data.fields.NumberField<number, number, true, true, true>;
  modifier: foundry.data.fields.NumberField<number, number, true, true, true>;
  cost: foundry.data.fields.NumberField<number, number, true, true, true>;
  temporary: foundry.data.fields.BooleanField<boolean, boolean, true, false, true>;
}

type ConsumableSystemSchemaExtension = SlugSchema & MigrationSchema & TraitsSchema & DescriptionSchema & ContainerSchema & GearSchema;

export type ConsumableSource = BaseItemSourcePTR2e<"consumable", ConsumableSystemSource>;

interface ConsumableSystemSource extends Omit<ItemSystemSource, 'actions'> {
  consumableType: ConsumableType;
  charges: {
    value: number;
    max: number;
  }
}