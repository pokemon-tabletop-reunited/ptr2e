import { PTRCONSTS } from "@data";

class EquipmentData extends foundry.abstract.DataModel {
    declare _source: InstanceType<typeof foundry.abstract.DataModel>['_source'] & {
        carryType: PTRCONSTS.CarryType;
        handsHeld: number;
    }

    static override defineSchema(): foundry.data.fields.DataSchema {
        const fields = foundry.data.fields;
        return {
            carryType: new fields.StringField({ required: true, initial: "stowed", choices: PTRCONSTS.CarryTypes, label: "PTR2E.FIELDS.gear.equipped.carryType.label", hint: "PTR2E.FIELDS.gear.equipped.carryType.hint"}),
            handsHeld: new fields.NumberField({ required: false, nullable: true, min: 0, integer: true, label: "PTR2E.FIELDS.gear.equipped.handsHeld.label", hint: "PTR2E.FIELDS.gear.equipped.handsHeld.hint"}),
            slot: new fields.StringField({ required: true, nullable: false, choices: {
                held: "held",
                worn: "worn",
                accessory: "accessory",
                belt: "belt",
                backpack: "backpack"
            }, initial:"held", label: "PTR2E.FIELDS.gear.equipped.slot.label", hint: "PTR2E.FIELDS.gear.equipped.slot.hint"}),
        }
    }
}

interface EquipmentData extends foundry.abstract.DataModel {
    carryType: PTRCONSTS.CarryType;
    handsHeld: number;
    slot: string;
}

export default EquipmentData;