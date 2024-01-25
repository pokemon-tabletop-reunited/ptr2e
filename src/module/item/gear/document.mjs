import { PTRItem } from "../base.mjs";
import BaseItemSystem from "../document.mjs";

/**
 * @extends {GearSystemSource}
 */
export default class PTRGear extends BaseItemSystem {
    static defineSchema() {
        const fields = foundry.data.fields;
        return Object.assign(super.defineSchema(), {
            cost: new fields.NumberField({ required: true, initial: 0, validate: (d) => d >= 0 }),
            crafting: new fields.ObjectField(),
            equipped: new fields.EmbeddedDataField(EquipmentData),
            grade: new fields.StringField({
                required: true,
                initial: "E",
                choices: ["E", "E+", "D-", "D", "D+", "C-", "C", "C+", "B-", "B", "B+", "A-", "A", "A+", "S-", "S", "S+"]
            }),
            identification: new fields.SchemaField({
                misidentified: new fields.ForeignDocumentField(PTRItem, { required: false, nullable: true }),
                status: new fields.StringField({ required: true, initial: "identified", choices: ["identified", "unidentified", "misidentified"] }),
                unidentified: new fields.SchemaField({
                    name: new fields.StringField({ required: true, initial: "Unidentified Item" }),
                    img: new fields.FilePathField({ required: true, categories: ["IMAGE", "MEDIA", "VIDEO"], initial: "systems/ptu/static/css/images/icons/item_icon.png" }),
                    description: new fields.HTMLField({ required: true, initial: "<p>Unidentified Item</p>" }),
                })
            }),
            quantity: new fields.NumberField({ required: true, initial: 1, validate: (d) => d >= 0 }),
            rarity: new fields.StringField({
                required: true,
                initial: "common",
                choices: ["common", "uncommon", "rare", "unique"]
            }),
        })
    }
}

export class EquipmentData extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            carryType: new fields.StringField({ required: true, initial: "stowed", choices: ["stowed", "held", "worn", "dropped"] }),
            handsHeld: new fields.NumberField({ required: false, nullable: true, validate: (d) => d >= 0 }),
        }
    }
}