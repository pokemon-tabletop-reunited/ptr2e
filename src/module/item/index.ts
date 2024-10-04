/** @module item */
import { ItemPTR2e } from "./document.ts";
import * as data from "./data/index.ts";
import { ActorPTR2e } from "@actor";

// Items
type AbilityPTR2e<TParent extends ActorPTR2e | null = ActorPTR2e | null> = ItemPTR2e<data.AbilitySystemModel, TParent>;
type BlueprintPTR2e<TParent extends ActorPTR2e | null = ActorPTR2e | null> = ItemPTR2e<data.BlueprintSystemModel, TParent>;
type ConsumablePTR2e<TParent extends ActorPTR2e | null = ActorPTR2e | null> = ItemPTR2e<data.ConsumableSystemModel, TParent>;
type ContainerPTR2e<TParent extends ActorPTR2e | null = ActorPTR2e | null> = ItemPTR2e<data.ContainerSystemModel, TParent>;
type EquipmentPTR2e<TParent extends ActorPTR2e | null = ActorPTR2e | null> = ItemPTR2e<data.EquipmentSystemModel, TParent>;
type GearPTR2e<TParent extends ActorPTR2e | null = ActorPTR2e | null> = ItemPTR2e<data.GearSystemModel, TParent>;
type MovePTR2e<TParent extends ActorPTR2e | null = ActorPTR2e | null> = ItemPTR2e<data.MoveSystemModel, TParent>;
type PerkPTR2e<TParent extends ActorPTR2e | null = ActorPTR2e | null> = ItemPTR2e<data.PerkSystemModel, TParent>;
type SpeciesPTR2e<TParent extends ActorPTR2e | null = ActorPTR2e | null> = ItemPTR2e<data.SpeciesSystemModel, TParent>;
type WeaponPTR2e<TParent extends ActorPTR2e | null = ActorPTR2e | null> = ItemPTR2e<data.WeaponSystemModel, TParent>;
type PTUItem = ItemPTR2e;
type EffectPTR2e<TParent extends ActorPTR2e | null = ActorPTR2e | null> = ItemPTR2e<data.EffectSystemModel, TParent>;

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
    | data.EffectSystemModel;

export type ItemSystemsWithActions =
    | data.AbilitySystemModel
    | data.EquipmentSystemModel
    | data.GearSystemModel
    | data.MoveSystemModel
    | data.PerkSystemModel
    | data.WeaponSystemModel;

export type ItemSourcePTR2e =
    | data.AbilitySystemSource
    | data.BlueprintSystemSource
    | data.ConsumableSystemSource
    | data.ContainerSystemSource
    | data.EquipmentSystemSource
    | data.GearSystemSource
    | data.MoveSystemSource
    | data.PerkSystemSource
    | data.SpeciesSystemSource
    | data.WeaponSystemSource
    | data.EffectSystemSource;

// Document
export * from "./document.ts";

// Sheets
export * from "./sheet.ts";
export * as sheets from "./sheets/index.ts";

// System Data Models
export * as data from "./data/index.ts";
