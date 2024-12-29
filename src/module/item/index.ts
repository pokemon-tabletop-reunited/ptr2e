/** @module item */
import type { ItemPTR2e } from "./document.ts";
import type * as data from "./data/index.ts";

// Items
type AbilityPTR2e = ItemPTR2e & {type: "ability", system : data.AbilitySystemModel};
type BlueprintPTR2e = ItemPTR2e & {type: "blueprint", system : data.BlueprintSystemModel};
type ConsumablePTR2e = ItemPTR2e & {type: "consumable", system : data.ConsumableSystemModel};
type ContainerPTR2e = ItemPTR2e & {type: "container", system : data.ContainerSystemModel};
type EquipmentPTR2e = ItemPTR2e & {type: "equipment", system : data.EquipmentSystemModel};
type GearPTR2e = ItemPTR2e & {type: "gear", system : data.GearSystemModel};
type MovePTR2e = ItemPTR2e & {type: "move", system : data.MoveSystemModel};
type PerkPTR2e = ItemPTR2e & {type: "perk", system : data.PerkSystemModel};
type SpeciesPTR2e = ItemPTR2e & {type: "species", system : data.SpeciesSystemModel};
type WeaponPTR2e = ItemPTR2e & {type: "weapon", system : data.WeaponSystemModel};
type PTUItem = ItemPTR2e;
type EffectPTR2e = ItemPTR2e & {type: "effect", system : data.EffectSystemModel};
type SummonPTR2e = ItemPTR2e & {type: "summon", system : data.SummonSystemModel};

export type {
  AbilityPTR2e,
  BlueprintPTR2e,
  ConsumablePTR2e,
  ContainerPTR2e,
  EquipmentPTR2e,
  GearPTR2e,
  MovePTR2e,
  PerkPTR2e,
  SpeciesPTR2e,
  WeaponPTR2e,
  PTUItem,
  EffectPTR2e,
  SummonPTR2e,
};

export type ItemSystemPTR =
    | data.AbilitySystemModel
    | data.BlueprintSystemModel
    | data.ConsumableSystemModel
    | data.ContainerSystemModel
    | data.EquipmentSystemModel
    | data.GearSystemModel
    | data.MoveSystemModel
    | data.PerkSystemModel
    | data.SpeciesSystemModel
    | data.WeaponSystemModel
    | data.EffectSystemModel
    | data.SummonSystemModel;

export type ItemSystemsWithActions =
    | data.AbilitySystemModel
    | data.EquipmentSystemModel
    | data.GearSystemModel
    | data.MoveSystemModel
    | data.PerkSystemModel
    | data.WeaponSystemModel
    | data.SummonSystemModel;

export type ItemSystemsWithFlingStats =
    | data.ConsumableSystemModel
    | data.EquipmentSystemModel
    | data.GearSystemModel
    | data.WeaponSystemModel;

// Document
export * from "./document.ts";

// Sheets
export * from "./sheet.ts";
export * as sheets from "./sheets/index.ts";

// System Data Models
export * as data from "./data/index.ts";
