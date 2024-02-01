import { ItemPTR2e } from "./base/document.ts";
import { AbilitySystemPTR2e } from "./ability/system.ts";
import { ConsumableSystemPTR2e } from "./consumable/system.ts";
import { ContainerSystemPTR2e } from "./container/system.ts";
import { EquipmentSystemPTR2e } from "./equipment/system.ts";
import { GearSystemPTR2e } from "./gear/system.ts";
import { MoveSystemPTR2e } from "./move/system.ts";
import { PerkSystemPTR2e } from "./perk/system.ts";
import { SpeciesSystemPTR2e } from "./species/system.ts";
import { WeaponSystemPTR2e } from "./weapon/system.ts";

// Base
export * from "./base/document.ts";

// Items
type AbilityPTR2e = ItemPTR2e<AbilitySystemPTR2e>;
type ConsumablePTR2e = ItemPTR2e<ConsumableSystemPTR2e>;
type ContainerPTR2e = ItemPTR2e<ContainerSystemPTR2e>;
type EquipmentPTR2e = ItemPTR2e<EquipmentSystemPTR2e>;
type GearPTR2e = ItemPTR2e<GearSystemPTR2e>;
type MovePTR2e = ItemPTR2e<MoveSystemPTR2e>;
type PerkPTR2e = ItemPTR2e<PerkSystemPTR2e>;
type SpeciesPTR2e = ItemPTR2e<SpeciesSystemPTR2e>;
type WeaponPTR2e = ItemPTR2e<WeaponSystemPTR2e>;

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

// Sheets
export * from "./base/sheet.ts";
export { AbilitySheetPTR2e } from "./ability/sheet.ts";
export { ConsumableSheetPTR2e } from "./consumable/sheet.ts";
export { GearSheetPTR2e } from "./gear/sheet.ts";
export { PerkSheetPTR2e } from "./perk/sheet.ts";
export { SpeciesSheetPTR2e } from "./species/sheet.ts";

// Systems
export * from "./base/system.ts";
export { AbilitySystemPTR2e } from "./ability/system.ts";
export { ConsumableSystemPTR2e } from "./consumable/system.ts";
export { ContainerSystemPTR2e } from "./container/system.ts";
export { EquipmentSystemPTR2e } from "./equipment/system.ts";
export { GearSystemPTR2e } from "./gear/system.ts";
export { MoveSystemPTR2e } from "./move/system.ts";
export { PerkSystemPTR2e } from "./perk/system.ts";
export { SpeciesSystemPTR2e } from "./species/system.ts";
export { WeaponSystemPTR2e } from "./weapon/system.ts";

// Other Data Models
export { ActionPTR2e, RangePTR2e } from "../action.ts";

export * as data from "./base/data.ts";