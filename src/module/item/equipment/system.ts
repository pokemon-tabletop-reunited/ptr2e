import { EquipmentPTR2e, GearSystem} from "@item";

abstract class EquipmentSystem extends GearSystem {
    declare parent: EquipmentPTR2e;
}

export { EquipmentSystem };