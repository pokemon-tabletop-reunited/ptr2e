export class EquipmentData extends foundry.abstract.DataModel {
    static override defineSchema() {
        const fields = foundry.data.fields;
        return {
            carryType: new fields.StringField({ required: true, initial: "stowed", choices: ["stowed", "held", "worn", "dropped"] }),
            handsHeld: new fields.NumberField({ required: false, nullable: true, validate: (d) => d as number >= 0 }),
        }
    }
}