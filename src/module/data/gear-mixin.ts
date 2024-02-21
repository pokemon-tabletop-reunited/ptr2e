import { TemplateConstructor } from './templates/data-template.ts';

/**
 * Extracted data properties from the Gear data model, so that they can be used in other data models that don't need the full Gear data model.
 */
export default function HasGearData<BaseClass extends TemplateConstructor>(baseClass: BaseClass) {
    abstract class TemplateClass extends baseClass {

        /**
         * The cost of the item.
         * @defaultValue `0`
         * @remarks
         * This is the cost of the item in gold pieces.
         * @example
         * ```typescript
         * const item = new ItemPTR2e({ name: 'Longsword' });
         * item.cost = 15;
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
         * const item = new ItemPTR2e({ name: 'Longsword' });
         * item.crafting = { skill: 'blacksmithing', time: { value: 8, unit: 'hours' } };
         * ```
         */
        abstract crafting: {
            skill: string;
            time: {
                value: number;
                unit: string;
            }
        };

        /**
         * The equipment data for the item.
         * @defaultValue `{}`
         * @remarks
         * This is the equipment data for the item.
         * @example
         * ```typescript
         * const item = new ItemPTR2e({ name: 'Longsword' });
         * item.equipped = { slot: 'main-hand' };
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
         * const item = new ItemPTR2e({ name: 'Longsword' });
         * item.grade = 'A+';
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
         * const item = new ItemPTR2e({ name: 'Longsword' });
         * item.quantity = 5;
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
         * const item = new ItemPTR2e({ name: 'Longsword' });
         * item.rarity = 'rare';
         * ```
         */
        abstract rarity: string;

        declare _source: InstanceType<typeof baseClass>['_source'] & {
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
        }

        static override defineSchema(): foundry.data.fields.DataSchema {
            const fields = foundry.data.fields;

            return {
                ...super.defineSchema(),

                cost: new fields.NumberField({ required: true, initial: 0, validate: (d) => d as number >= 0 }),
                crafting: new fields.SchemaField({
                    skill: new fields.StringField({ required: true, initial: "accounting" }),
                    time: new fields.SchemaField({
                        value: new fields.NumberField({ required: true, initial: 1, validate: (d) => d as number >= 0 }),
                        unit: new fields.StringField({ required: true, initial: "hours", choices: ["seconds", "minutes", "hours", "days", "weeks", "months", "years"] })
                    })
                }),
                equipped: new fields.EmbeddedDataField(EquipmentData),
                grade: new fields.StringField({
                    required: true,
                    initial: "E",
                    choices: ["E", "E+", "D-", "D", "D+", "C-", "C", "C+", "B-", "B", "B+", "A-", "A", "A+", "S-", "S", "S+"]
                }),
                quantity: new fields.NumberField({ required: true, initial: 1, validate: (d) => d as number >= 0 }),
                rarity: new fields.StringField({
                    required: true,
                    initial: "common",
                    choices: ["common", "uncommon", "rare", "unique"]
                }),
            };
        }
    }

    return TemplateClass;
}

class EquipmentData extends foundry.abstract.DataModel {
    static override defineSchema() {
        const fields = foundry.data.fields;
        return {
            carryType: new fields.StringField({ required: true, initial: "stowed", choices: ["stowed", "held", "worn", "dropped"] }),
            handsHeld: new fields.NumberField({ required: false, nullable: true, validate: (d) => d as number >= 0 }),
        }
    }
}