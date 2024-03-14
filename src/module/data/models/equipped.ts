import { PTRCONSTS } from "@data";

class EquipmentData extends foundry.abstract.DataModel {
    static override defineSchema() {
        const fields = foundry.data.fields;
        return {
            carryType: new fields.StringField({ required: true, initial: PTRCONSTS.CarryTypes.STOWED, choices: Object.values(PTRCONSTS.CarryTypes) }),
            handsHeld: new fields.NumberField({ required: false, nullable: true, min: 0, integer: true }),
        }
    }
}

interface EquipmentData extends foundry.abstract.DataModel {
    carryType: PTRCONSTS.CarryType;
    handsHeld: number;
}

export default EquipmentData;