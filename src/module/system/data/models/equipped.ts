import { PTRCONSTS } from "..";

const equipmentSchema = {
  carryType: new foundry.data.fields.StringField({ required: true, initial: "stowed", choices: PTRCONSTS.CarryTypes, label: "PTR2E.FIELDS.gear.equipped.carryType.label", hint: "PTR2E.FIELDS.gear.equipped.carryType.hint" }),
  handsHeld: new foundry.data.fields.NumberField({ required: false, nullable: true, min: 0, integer: true, label: "PTR2E.FIELDS.gear.equipped.handsHeld.label", hint: "PTR2E.FIELDS.gear.equipped.handsHeld.hint" }),
  slot: new foundry.data.fields.StringField({
    required: true, nullable: false, choices: {
      held: "PTR2E.FIELDS.gear.equipped.slot.held",
      worn: "PTR2E.FIELDS.gear.equipped.slot.worn",
      accessory: "PTR2E.FIELDS.gear.equipped.slot.accessory",
      belt: "PTR2E.FIELDS.gear.equipped.slot.belt",
      backpack: "PTR2E.FIELDS.gear.equipped.slot.backpack"
    }, initial: "held", label: "PTR2E.FIELDS.gear.equipped.slot.label", hint: "PTR2E.FIELDS.gear.equipped.slot.hint"
  }),
}

declare namespace EquipmentData {
  type Schema = typeof equipmentSchema;
}

class EquipmentData extends foundry.abstract.DataModel<EquipmentData.Schema> {
  static override defineSchema() {
    return equipmentSchema;
  }

  static override migrateData(source: foundry.data.fields.SchemaField.SourceData<EquipmentData.Schema>) {
    if ((source.carryType as string) === "held" || (source.carryType as string) === "worn") {
      source.carryType = "equipped";
    }

    return super.migrateData(source);
  }
}

export {
  EquipmentData
}