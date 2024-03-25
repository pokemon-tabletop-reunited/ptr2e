/** @module item */
import { ItemPTR2e } from "./document.ts";
import * as data from "./data/index.ts";

// Items
type AbilityPTR2e = ItemPTR2e<data.AbilitySystemModel>;
type ConsumablePTR2e = ItemPTR2e<data.ConsumableSystemModel>;
type ContainerPTR2e = ItemPTR2e<data.ContainerSystemModel>;
type EquipmentPTR2e = ItemPTR2e<data.EquipmentSystemModel>;
type GearPTR2e = ItemPTR2e<data.GearSystemModel>;
type MovePTR2e = ItemPTR2e<data.MoveSystemModel>;
type PerkPTR2e = ItemPTR2e<data.PerkSystemModel>;
type SpeciesPTR2e = ItemPTR2e<data.SpeciesSystemModel>;
type WeaponPTR2e = ItemPTR2e<data.WeaponSystemModel>;
type PTUItem = ItemPTR2e;

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
    PTUItem,
}

export type ItemSystemPTR = data.AbilitySystemModel | data.ConsumableSystemModel | data.ContainerSystemModel | data.EquipmentSystemModel | data.GearSystemModel | data.MoveSystemModel | data.PerkSystemModel | data.SpeciesSystemModel | data.WeaponSystemModel;

// Document
export * from "./document.ts";

// Sheets
export * from "./sheet.ts";
export * as sheets from "./sheets/index.ts";

// System Data Models
export * as data from "./data/index.ts";