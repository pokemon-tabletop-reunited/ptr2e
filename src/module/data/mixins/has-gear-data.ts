import { EquipmentData } from "@data";
import { TemplateConstructor } from "./data-template.ts";

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

                cost: new fields.NumberField({
                    required: true,
                    initial: 0,
                    validate: (d) => (d as number) >= 0,
                    label: "PTR2E.FIELDS.gear.cost.label",
                    hint: "PTR2E.FIELDS.gear.cost.hint",
                }),
                crafting: new fields.SchemaField({
                    skill: new fields.StringField({
                        required: true,
                        initial: "accounting",
                        label: "PTR2E.FIELDS.gear.crafting.skill.label",
                        hint: "PTR2E.FIELDS.gear.crafting.skill.hint",
                    }),
                    time: new fields.SchemaField({
                        value: new fields.NumberField({
                            required: true,
                            initial: 1,
                            validate: (d) => (d as number) >= 0,
                            label: "PTR2E.FIELDS.gear.crafting.time.value.label",
                            hint: "PTR2E.FIELDS.gear.crafting.time.value.hint",
                        }),
                        unit: new fields.StringField({
                            required: true,
                            initial: "hours",
                            choices: [
                                "seconds",
                                "minutes",
                                "hours",
                                "days",
                                "weeks",
                                "months",
                                "years",
                            ].reduce<Record<string,string>>((acc, unit) => ({...acc, [unit]: unit}), {}),
                            label: "PTR2E.FIELDS.gear.crafting.time.unit.label",
                            hint: "PTR2E.FIELDS.gear.crafting.time.unit.hint",
                        }),
                    }),
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
