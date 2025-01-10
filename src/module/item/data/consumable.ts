import { HasContainer, HasDescription, HasEmbed, HasGearData, HasMigrations, HasSlug, HasTraits, Trait } from "@module/data/index.ts";
import type { MigrationSchema } from "@module/data/mixins/has-migrations.ts";
import type { TraitsSchema } from "@module/data/mixins/has-traits.ts";
import type { DescriptionSchema } from "@module/data/mixins/has-description.ts";
import type { SlugSchema } from "@module/data/mixins/has-slug.ts";
import type { ContainerSchema } from "@module/data/mixins/has-container.ts";
import type { GearDataSchema } from "@module/data/mixins/has-gear-data.ts";

const CONSUMABLE_TYPES = {
  ammo: "PTR2E.FIELDS.consumable.type.ammo",
  boosters: "PTR2E.FIELDS.consumable.type.boosters",
  "evolution-item": "PTR2E.FIELDS.consumable.type.evolution-item",
  food: "PTR2E.FIELDS.consumable.type.food",
  pokeball: "PTR2E.FIELDS.consumable.type.pokeball",
  restorative: "PTR2E.FIELDS.consumable.type.restorative",
  other: "PTR2E.FIELDS.consumable.type.other",
} as const
export type ConsumableType = keyof typeof CONSUMABLE_TYPES;

const consumableSchema = {
  consumableType: new foundry.data.fields.StringField({ required: true, initial: "other", choices: CONSUMABLE_TYPES, label: "PTR2E.FIELDS.consumable.type.label", hint: "PTR2E.FIELDS.consumable.type.hint" }),
  stack: new foundry.data.fields.NumberField({ required: true, initial: 1, min: 1, step: 1, label: "PTR2E.FIELDS.consumable.stack.label", hint: "PTR2E.FIELDS.consumable.stack.hint" }),
  modifier: new foundry.data.fields.NumberField({ required: true, nullable: true, initial: null, label: "PTR2E.FIELDS.consumable.modifier.label", hint: "PTR2E.FIELDS.consumable.modifier.hint" }),
  cost: new foundry.data.fields.NumberField({
    required: true,
    nullable: true,
    initial: null,
    validate: (d: number | null) => d === null || (d as number) > 0,
    label: "PTR2E.FIELDS.consumable.cost.label",
    hint: "PTR2E.FIELDS.consumable.cost.hint",
  }),
}

export type ConsumableSchema = typeof consumableSchema & MigrationSchema & TraitsSchema & DescriptionSchema & SlugSchema & ContainerSchema & GearDataSchema;

/**
 * @category Item Data Models
 */
export default abstract class ConsumableSystem extends HasEmbed(HasMigrations(HasTraits(HasDescription(HasSlug(HasContainer(HasGearData(foundry.abstract.TypeDataModel)))))), "consumable")<ConsumableSchema, Item.ConfiguredInstance> {
  // /**
  //  * @internal
  //  */
  // declare parent: ConsumablePTR2e;

  static override defineSchema(): ConsumableSchema {
    return {
      ...super.defineSchema() as MigrationSchema & TraitsSchema & DescriptionSchema & SlugSchema & ContainerSchema & GearDataSchema,
      ...consumableSchema,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async _preCreate(data: foundry.abstract.TypeDataModel.ParentAssignmentType<ConsumableSchema, Item.ConfiguredInstance>, options: foundry.abstract.Document.PreCreateOptions<any>, user: User.ConfiguredInstance): Promise<boolean | void> {
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