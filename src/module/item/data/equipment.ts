import { EquipmentPTR2e } from "@item";
import GearSystem from "./gear.ts";

/**
 * @category Item Data Models
 */
export default abstract class EquipmentSystem extends GearSystem {
    /**
     * @internal
     */
    declare parent: EquipmentPTR2e;
}