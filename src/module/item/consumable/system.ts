import { ConsumablePTR2e, ItemSystemPTR2e } from "@item";

class ConsumableSystemPTR2e extends ItemSystemPTR2e {
    static override defineSchema() {
        const fields = foundry.data.fields;
        const schema = Object.assign(super.defineSchema(), {
            consumableType: new fields.StringField({ required: true, initial: "other", choices: ["food", "restorative", "boosters", "ammo", "evolution-item", "pokeball", "other"] }),
            charges: new fields.NumberField({ required: true, initial: 1 }),
        })
        delete schema["actions"];
        return schema;
    }
}

type ConsumableType = "food" | "restorative" | "boosters" | "ammo" | "evolution-item" | "pokeball" | "other"

interface ConsumableSystemPTR2e extends ItemSystemPTR2e {
    type: "consumable";
    
    consumableType: ConsumableType;
    charges: {
        value: number;
        max: number;
    }

    parent: ConsumablePTR2e;

    // Remove fields
    actions: never;
}

export { ConsumableSystemPTR2e };