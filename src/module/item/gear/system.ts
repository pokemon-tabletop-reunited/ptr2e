import { ItemSystemPTR2e, ItemPTR2e, GearPTR2e } from "@item";
import { TimeDuration, ItemGrade, IdentificationSource, ItemRarity, ItemCarryType } from "@item/base/data.ts";

class GearSystemPTR2e extends ItemSystemPTR2e {
    static override defineSchema(): foundry.data.fields.DataSchema {
        const fields = foundry.data.fields;
        return Object.assign(super.defineSchema(), {
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
            identification: new fields.SchemaField({
                misidentified: new fields.ForeignDocumentField(ItemPTR2e, { required: false, nullable: true }),
                status: new fields.StringField({ required: true, initial: "identified", choices: ["identified", "unidentified", "misidentified"] }),
                unidentified: new fields.SchemaField({
                    name: new fields.StringField({ required: true, initial: "Unidentified Item" }),
                    img: new fields.FilePathField({ required: true, categories: ["IMAGE", "MEDIA", "VIDEO"], initial: "systems/ptu/css/images/icons/item_icon.png" }),
                    description: new fields.HTMLField({ required: true, initial: "<p>Unidentified Item</p>" }),
                })
            }),
            quantity: new fields.NumberField({ required: true, initial: 1, validate: (d) => d as number >= 0 }),
            rarity: new fields.StringField({
                required: true,
                initial: "common",
                choices: ["common", "uncommon", "rare", "unique"]
            }),
        })
    }
}

interface GearSystemPTR2e extends ItemSystemPTR2e {
    type: "gear" | string

    cost: number,
    crafting: {
        skill: PTRSkill,
        time: TimeDuration,
    },
    equipped: EquippedData,
    grade: ItemGrade,
    identification: IdentificationSource,
    quantity: number,
    rarity: ItemRarity,

    parent: GearPTR2e;
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

interface EquippedData extends foundry.abstract.DataModel{
    carryType: ItemCarryType,
    handsHeld?: number,
}

export { GearSystemPTR2e, EquipmentData }