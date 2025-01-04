import type { PokemonType } from "@data";
import { PTRCONSTS } from "@data";
import type { TemplateConstructor } from "./data-template.ts";
import { getTypes } from "@scripts/config/effectiveness.ts";
import { SlugField } from "../fields/slug-field.ts";

const gearDataSchema = {
  /**
   * The crafting skill and time required to create the item.
   * @defaultValue `{ skill: 'accounting', time: { value: 1, unit: 'hours' } }`
   * @remarks
   * This is the skill and time required to create the item.
   * @example
   * ```typescript
   * const item = new CONFIG.Item.documentClass({ name: 'Flashlight', "system.crafting": { skill: 'crafting', time: { value: 1, unit: 'hours' } });
   * console.log(item.system.crafting); // { skill: 'crafting', time: { value: 1, unit: 'hours' } }
   * ```
   */
  crafting: new foundry.data.fields.SchemaField({
    /**
     * The skill required to craft the item.
     * @see {@link Skill}
     */
    skill: new foundry.data.fields.StringField({
      required: false,
      nullable: true,
      initial: null,
      label: "PTR2E.FIELDS.gear.crafting.skill.label",
      hint: "PTR2E.FIELDS.gear.crafting.skill.hint",
    }),
    /**
     * The number of spans required to craft the item.
     */
    spans: new foundry.data.fields.NumberField({
      required: true,
      nullable: true,
      initial: null,
      validate: (d: number) => d === null || (d as number) > 0,
      label: "PTR2E.FIELDS.gear.crafting.spans.label",
      hint: "PTR2E.FIELDS.gear.crafting.spans.hint",
    }),
    /**
     * The materials required to craft the item.
     */
    materials: new foundry.data.fields.SetField(new SlugField(), { required: true, initial: [], label: "PTR2E.FIELDS.gear.crafting.materials.label", hint: "PTR2E.FIELDS.gear.crafting.materials.hint" }),
  }),
  /**
   * The equipment data for the item.
   * @defaultValue `{carryType: 'stowed', handsHeld: null}`
   * @remarks
   * Tracks how the item is carried and how many hands are required to hold it.
   * @example
   * ```typescript
   * const item = new CONFIG.Item.documentClass({ name: 'Flashlight', "system.equipped": {carryType: 'held', handsHeld: 1} });
   * console.log(item.system.equipped); // {carryType: 'held', handsHeld: 1}
   * ```
   */
  equipped: new foundry.data.fields.SchemaField({
    carryType: new foundry.data.fields.StringField({ required: true, initial: "stowed", choices: PTRCONSTS.CarryTypes, label: "PTR2E.FIELDS.gear.equipped.carryType.label", hint: "PTR2E.FIELDS.gear.equipped.carryType.hint"}),
    handsHeld: new foundry.data.fields.NumberField({ required: false, nullable: true, min: 0, integer: true, label: "PTR2E.FIELDS.gear.equipped.handsHeld.label", hint: "PTR2E.FIELDS.gear.equipped.handsHeld.hint"}),
    slot: new foundry.data.fields.StringField({ required: true, nullable: false, choices: {
        held: "PTR2E.FIELDS.gear.equipped.slot.held",
        worn: "PTR2E.FIELDS.gear.equipped.slot.worn",
        accessory: "PTR2E.FIELDS.gear.equipped.slot.accessory",
        belt: "PTR2E.FIELDS.gear.equipped.slot.belt",
        backpack: "PTR2E.FIELDS.gear.equipped.slot.backpack"
    }, initial:"held", label: "PTR2E.FIELDS.gear.equipped.slot.label", hint: "PTR2E.FIELDS.gear.equipped.slot.hint"}),
  }),
  /**
   * The grade of the item.
   * @defaultValue `'E'`
   * @remarks
   * This is the grade of the item.
   * @example
   * ```typescript
   * const item = new CONFIG.Item.documentClass({ name: 'Flashlight', "system.grade": 'A' });
   * console.log(item.system.grade); // 'A'
   * ```
   */
  grade: new foundry.data.fields.StringField({
    required: true,
    nullable: true,
    initial: null,
    choices: PTRCONSTS.Grades.reduce((acc, grade) => ({ ...acc, [grade]: grade }), {}),
    label: "PTR2E.FIELDS.gear.grade.label",
    hint: "PTR2E.FIELDS.gear.grade.hint",
  }),
  fling: new foundry.data.fields.SchemaField({
    type: new foundry.data.fields.StringField({
      required: true,
      choices: getTypes().reduce<Record<PokemonType, string>>((acc, type) => ({ ...acc, [type]: type }), {} as Record<PokemonType, string>),
      initial: PTRCONSTS.Types.UNTYPED,
      label: "PTR2E.FIELDS.gear.fling.pokemonType.label",
      hint: "PTR2E.FIELDS.gear.fling.pokemonType.hint",
    }),
    power: new foundry.data.fields.NumberField({
      required: true,
      nullable: true,
      initial: null,
      min: 0,
      max: 250,
      label: "PTR2E.FIELDS.gear.fling.power.label",
      hint: "PTR2E.FIELDS.gear.fling.power.hint",
    }),
    accuracy: new foundry.data.fields.NumberField({
      required: true,
      nullable: false,
      initial: 100,
      min: 10,
      max: 100,
      label: "PTR2E.FIELDS.gear.fling.accuracy.label",
      hint: "PTR2E.FIELDS.gear.fling.accuracy.hint",
    }),
    hide: new foundry.data.fields.BooleanField({
      required: true,
      nullable: true,
      initial: null,
      label: "PTR2E.FIELDS.gear.fling.hide.label",
      hint: "PTR2E.FIELDS.gear.fling.hide.hint",
    }),
  }),
  /**
   * The quantity of the item.
   * @defaultValue `1`
   * @remarks
   * This is the quantity of the item.
   * @example
   * ```typescript
   * const item = new CONFIG.Item.documentClass({ name: 'Flashlight', "system.quantity": 5 });
   * console.log(item.system.quantity); // 5
   * ```
   */
  quantity: new foundry.data.fields.NumberField({
    required: true,
    nullable: false,
    initial: 1,
    validate: (d: number) => (d as number) >= 0,
    label: "PTR2E.FIELDS.gear.quantity.label",
    hint: "PTR2E.FIELDS.gear.quantity.hint",
  }),
  /**
   * The rarity of the item.
   * @defaultValue `'common'`
   * @remarks
   * This is the rarity of the item.
   * @example
   * ```typescript
   * const item = new CONFIG.Item.documentClass({ name: 'Flashlight', "system.rarity": 'rare' });
   * console.log(item.system.rarity); // 'rare'
   * ```
   */
  rarity: new foundry.data.fields.StringField({
    required: true,
    initial: "common",
    choices: {
      common: "PTR2E.FIELDS.gear.rarity.common",
      uncommon: "PTR2E.FIELDS.gear.rarity.uncommon",
      rare: "PTR2E.FIELDS.gear.rarity.rare",
      unique: "PTR2E.FIELDS.gear.rarity.unique",
    },
    label: "PTR2E.FIELDS.gear.rarity.label",
    hint: "PTR2E.FIELDS.gear.rarity.hint",
  }),
}

export type GearDataSchema = typeof gearDataSchema & foundry.data.fields.DataSchema;

/**
 * Extracted data properties from the Gear data model, so that they can be used in other data models that don't need the full Gear data model.
 * @group Mixins
 */
export default function HasGearData<BaseClass extends TemplateConstructor>(baseClass: BaseClass) {
  abstract class TemplateClass extends baseClass {
    static override defineSchema(): GearDataSchema {
      return {
        ...super.defineSchema(),
        ...gearDataSchema
      };
    }

    override prepareDerivedData(): void {
      super.prepareDerivedData();

      // Pokeballs should never be hidden from fling dialog
      if ('consumableType' in this && this.consumableType == "pokeball") {
        this.fling.hide = false;
        return;
      }
      // If the fling 'hide' mode is not set, and the values are the default fling values, set 'hide' to true
      if (this.fling?.hide === null && (!this.fling.power || this.fling.power === 25) && (!this.fling.accuracy || this.fling.accuracy === 100) && (!this.fling.type || this.fling.type === PTRCONSTS.Types.UNTYPED)) {
        this.fling.hide = true;
      }
    }
  }

  interface TemplateClass extends foundry.data.fields.SchemaField.InitializedType<GearDataSchema> {
    _source: foundry.data.fields.SchemaField.PersistedType<GearDataSchema>
  }

  return TemplateClass;
}