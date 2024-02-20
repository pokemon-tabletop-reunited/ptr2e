import { ItemPTR2e } from "./base/document.ts";
import { AbilitySystem } from "./ability/system.ts";
import { ConsumableSystem } from "./consumable/system.ts";
import { ContainerSystem } from "./container/system.ts";
import { EquipmentSystem } from "./equipment/system.ts";
import { GearSystem } from "./gear/system.ts";
import { MoveSystem } from "./move/system.ts";
import { PerkSystem } from "./perk/system.ts";
import { SpeciesSystem } from "./species/system.ts";
import { WeaponSystem } from "./weapon/system.ts";
import { ItemSystemPTR2e } from "./base/system.ts";

// Base
export * from "./base/document.ts";

// Items
type AbilityPTR2e = ItemPTR2e<AbilitySystem>;
type ConsumablePTR2e = ItemPTR2e<ConsumableSystem>;
type ContainerPTR2e = ItemPTR2e<ContainerSystem>;
type GearPTR2e = ItemPTR2e<GearSystem>;
type EquipmentPTR2e = ItemPTR2e<EquipmentSystem>;
type MovePTR2e = ItemPTR2e<MoveSystem>;
type PerkPTR2e = ItemPTR2e<PerkSystem>;
type SpeciesPTR2e = ItemPTR2e<SpeciesSystem>;
type WeaponPTR2e = ItemPTR2e<WeaponSystem>;

export type {
    AbilityPTR2e,
    ConsumablePTR2e,
    ContainerPTR2e,
    EquipmentPTR2e,
    GearPTR2e,
    MovePTR2e,
    PerkPTR2e,
    SpeciesPTR2e,
    WeaponPTR2e,
}

export type ItemSystemPTR = AbilitySystem | ConsumableSystem | ContainerSystem | EquipmentSystem | GearSystem | MoveSystem | PerkSystem | SpeciesSystem | WeaponSystem | ItemSystemPTR2e;

// Sheets
export * from "./base/sheet.ts";
export { AbilitySheetPTR2e } from "./ability/sheet.ts";
export { ConsumableSheetPTR2e } from "./consumable/sheet.ts";
export { GearSheetPTR2e } from "./gear/sheet.ts";
export { PerkSheetPTR2e } from "./perk/sheet.ts";
export { SpeciesSheetPTR2e } from "./species/sheet.ts";

// Systems
export * from "./base/system.ts";
export { AbilitySystem } from "./ability/system.ts";
export { ContainerSystem } from "./container/system.ts";
export { GearSystem } from "./gear/system.ts";
export { EquipmentSystem } from "./equipment/system.ts";
export { MoveSystem } from "./move/system.ts";
export { PerkSystem } from "./perk/system.ts";
export { SpeciesSystem } from "./species/system.ts";
export { WeaponSystem } from "./weapon/system.ts";

// Other Data Models
export { ActionPTR2e, RangePTR2e } from "../action.ts";

export * as data from "./base/data.ts";