import { GearSystem, WeaponPTR2e } from "@item";

abstract class WeaponSystem extends GearSystem {
    declare parent: WeaponPTR2e;
}

export { WeaponSystem };