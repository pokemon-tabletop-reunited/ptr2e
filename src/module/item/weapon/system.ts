import { GearSystemPTR2e, WeaponPTR2e } from "@item";

class WeaponSystemPTR2e extends GearSystemPTR2e {
    
}

/**
 * Weapons can:
 * - Provide an action (move)
 * - Alter an action (move)
 * - It's own PP pool for using certain actions
 * 
 * Figure out later if this needs a seperate item type or just effect based
 */
interface WeaponSystemPTR2e extends GearSystemPTR2e {
    type: "weapon";

    parent: WeaponPTR2e;
}

export { WeaponSystemPTR2e };