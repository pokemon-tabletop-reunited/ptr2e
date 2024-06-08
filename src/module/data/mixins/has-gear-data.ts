import { EquipmentData, PTRCONSTS } from "@data";
import { TemplateConstructor } from "./data-template.ts";
import { getTypes } from "@scripts/config/effectiveness.ts";
import { SlugField } from "../fields/slug-field.ts";

/**
 * Extracted data properties from the Gear data model, so that they can be used in other data models that don't need the full Gear data model.
 * @group Mixins
 */
export default function HasGearData<BaseClass extends TemplateConstructor>(baseClass: BaseClass) {
    abstract class TemplateClass extends baseClass {
        /**
         * The cost of the item.
         * @defaultValue `0`
         * @remarks
         * This is the cost of the item in Poké.
         * @example
         * ```typescript
         * const item = new ItemPTR2e({ name: 'Flashlight', "system.cost": 100 });
         * console.log(item.system.cost); // 100
         * ```
         */
        abstract cost: number;

        /**
         * The crafting skill and time required to create the item.
         * @defaultValue `{ skill: 'accounting', time: { value: 1, unit: 'hours' } }`
         * @remarks
         * This is the skill and time required to create the item.
         * @example
         * ```typescript
         * const item = new ItemPTR2e({ name: 'Flashlight', "system.crafting": { skill: 'crafting', time: { value: 1, unit: 'hours' } });
         * console.log(item.system.crafting); // { skill: 'crafting', time: { value: 1, unit: 'hours' } }
         * ```
         */
        abstract crafting: {
            /**
             * The skill required to craft the item.
             * @see {@link Skill}
             */
            skill: string;
            /**
             * @Outdated - Property needs updating
             */
            time: {
                value: number;
                unit: string;
            };
        };

        /**
         * The equipment data for the item.
         * @defaultValue `{carryType: 'stowed', handsHeld: null}`
         * @remarks
         * Tracks how the item is carried and how many hands are required to hold it.
         * @example
         * ```typescript
         * const item = new ItemPTR2e({ name: 'Flashlight', "system.equipped": {carryType: 'held', handsHeld: 1} });
         * console.log(item.system.equipped); // {carryType: 'held', handsHeld: 1}
         * ```
         */
        abstract equipped: EquipmentData;

        /**
         * The grade of the item.
         * @defaultValue `'E'`
         * @remarks
         * This is the grade of the item.
         * @example
         * ```typescript
         * const item = new ItemPTR2e({ name: 'Flashlight', "system.grade": 'A' });
         * console.log(item.system.grade); // 'A'
         * ```
         */
        abstract grade: string;

        /**
         * The quantity of the item.
         * @defaultValue `1`
         * @remarks
         * This is the quantity of the item.
         * @example
         * ```typescript
         * const item = new ItemPTR2e({ name: 'Flashlight', "system.quantity": 5 });
         * console.log(item.system.quantity); // 5
         * ```
         */
        abstract quantity: number;

        /**
         * The rarity of the item.
         * @defaultValue `'common'`
         * @remarks
         * This is the rarity of the item.
         * @example
         * ```typescript
         * const item = new ItemPTR2e({ name: 'Flashlight', "system.rarity": 'rare' });
         * console.log(item.system.rarity); // 'rare'
         * ```
         */
        abstract rarity: string;

        declare _source: InstanceType<typeof baseClass>["_source"] & {
            cost: number;
            crafting: {
                skill: string;
                time: {
                    value: number;
                    unit: string;
                };
            };
            equipped: EquipmentData;
            grade: string;
            quantity: number;
            rarity: string;
        };

        static override defineSchema(): foundry.data.fields.DataSchema {
            const fields = foundry.data.fields;

            return {
                ...super.defineSchema(),

                crafting: new fields.SchemaField({
                    skill: new fields.StringField({
                        required: false,
                        nullable: true,
                        initial: null,
                        label: "PTR2E.FIELDS.gear.crafting.skill.label",
                        hint: "PTR2E.FIELDS.gear.crafting.skill.hint",
                    }),
                    spans: new fields.NumberField({
                        required: true,
                        nullable: true,
                        initial: null,
                        validate: (d) => d === null || (d as number) > 0,
                        label: "PTR2E.FIELDS.gear.crafting.spans.label",
                        hint: "PTR2E.FIELDS.gear.crafting.spans.hint",
                    }),
                    materials: new fields.SetField(new SlugField(), { required: true, initial: [], label: "PTR2E.FIELDS.gear.crafting.materials.label", hint: "PTR2E.FIELDS.gear.crafting.materials.hint"}),
                }),
                equipped: new fields.EmbeddedDataField(EquipmentData),
                grade: new fields.StringField({
                    required: true,
                    nullable: true,
                    initial: null,
                    choices: [
                        "E",
                        "E+",
                        "D-",
                        "D",
                        "D+",
                        "C-",
                        "C",
                        "C+",
                        "B-",
                        "B",
                        "B+",
                        "A-",
                        "A",
                        "A+",
                        "S-",
                        "S",
                        "S+",
                    ].reduce<Record<string,string>>((acc, grade) => ({...acc, [grade]: grade}), {}),
                    label: "PTR2E.FIELDS.gear.grade.label",
                    hint: "PTR2E.FIELDS.gear.grade.hint",
                }),
                fling: new fields.SchemaField({
                    type: new fields.StringField({
                        required: true,
                        choices: getTypes().reduce<Record<string,string>>((acc, type) => ({...acc, [type]: type}), {}),
                        initial: PTRCONSTS.Types.UNTYPED,
                        label: "PTR2E.FIELDS.gear.fling.pokemonType.label",
                        hint: "PTR2E.FIELDS.gear.fling.pokemonType.hint",
                    }),
                    power: new fields.NumberField({
                        required: true,
                        nullable: true,
                        initial: null,
                        min: 0,
                        max: 250,
                        label: "PTR2E.FIELDS.gear.fling.power.label",
                        hint: "PTR2E.FIELDS.gear.fling.power.hint",
                    }),
                    accuracy: new fields.NumberField({
                        required: true,
                        nullable: false,
                        initial: 100,
                        min: 10,
                        max: 100,
                        label: "PTR2E.FIELDS.gear.fling.accuracy.label",
                        hint: "PTR2E.FIELDS.gear.fling.accuracy.hint",
                    }),
                }),
                quantity: new fields.NumberField({
                    required: true,
                    initial: 1,
                    validate: (d) => (d as number) >= 0,
                    label: "PTR2E.FIELDS.gear.quantity.label",
                    hint: "PTR2E.FIELDS.gear.quantity.hint",
                }),
                rarity: new fields.StringField({
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
            };
        }
    }

    return TemplateClass;
}
