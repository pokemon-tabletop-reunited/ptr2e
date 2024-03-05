import { WeaponPTR2e } from "@item";
import GearSystem from "./gear.ts";

/**
 * @category Item Data Models
 */
export default abstract class WeaponSystem extends GearSystem {
    /**
     * @internal
     */
    declare parent: WeaponPTR2e;
}