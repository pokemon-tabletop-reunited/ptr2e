import { EquipmentPTR2e, GearSystemPTR2e } from "@item";

class EquipmentSystemPTR2e extends GearSystemPTR2e {
}

interface EquipmentSystemPTR2e extends GearSystemPTR2e {
    type: "equipment";

    parent: EquipmentPTR2e;
}

export { EquipmentSystemPTR2e };