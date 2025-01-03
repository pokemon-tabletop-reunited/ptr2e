/** @module item */
import type { ItemPTR2e } from "./document.ts";
import type * as data from "./data/index.ts";
import type { GearDataSchema } from "@module/data/mixins/has-gear-data.ts";
import type { TraitsSchema } from "@module/data/mixins/has-traits.ts";
import type { ActionsSchema } from "@module/data/mixins/has-actions.ts";

// Items
type AbilityPTR2e = ItemPTR2e & { type: "ability", system: data.AbilitySystemModel };
type BlueprintPTR2e = ItemPTR2e & { type: "blueprint", system: data.BlueprintSystemModel };
type ConsumablePTR2e = ItemPTR2e & { type: "consumable", system: data.ConsumableSystemModel };
type ContainerPTR2e = ItemPTR2e & { type: "container", system: data.ContainerSystemModel };
type EquipmentPTR2e = ItemPTR2e & { type: "equipment", system: data.EquipmentSystemModel };
type GearPTR2e = ItemPTR2e & { type: "gear", system: data.GearSystemModel };
type MovePTR2e = ItemPTR2e & { type: "move", system: data.MoveSystemModel };
type PerkPTR2e = ItemPTR2e & { type: "perk", system: data.PerkSystemModel };
type SpeciesPTR2e = ItemPTR2e & { type: "species", system: data.SpeciesSystemModel };
type WeaponPTR2e = ItemPTR2e & { type: "weapon", system: data.WeaponSystemModel };
type PTUItem = ItemPTR2e;
type EffectPTR2e = ItemPTR2e & { type: "effect", system: data.EffectSystemModel };
type SummonPTR2e = ItemPTR2e & { type: "summon", system: data.SummonSystemModel };

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

// Document
export * from "./document.ts";

// Sheets
export * as sheets from "./sheets/index.ts";

// System Data Models
export * as data from "./data/index.ts";

declare global {
  namespace PTR {
    namespace Item {
      type ItemSystemPTR =
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
        | data.SummonSystemModel

      type ItemSystemsWithActions =
        | data.AbilitySystemModel
        | data.EquipmentSystemModel
        | data.GearSystemModel
        | data.MoveSystemModel
        | data.PerkSystemModel
        | data.WeaponSystemModel
        | data.SummonSystemModel;

      type ItemSystemsWithFlingStats =
        | data.ConsumableSystemModel
        | data.EquipmentSystemModel
        | data.GearSystemModel
        | data.WeaponSystemModel;

      type Source = foundry.data.fields.SchemaField.PersistedType<globalThis.Item.Schema>;
      type SystemWithFling = Omit<ItemSystemPTR, "fling"> & foundry.data.fields.SchemaField.InitializedType<Pick<GearDataSchema, "fling">>;
      type ItemWithFling = ItemPTR2e & { system: SystemWithFling };
      type SystemWithTraits = Omit<ItemSystemPTR, "traits"> & foundry.data.fields.SchemaField.InitializedType<TraitsSchema>;
      type ItemWithTraits = ItemPTR2e & { system: SystemWithTraits };
      type SystemWithActions = Omit<ItemSystemPTR, "actions"> & foundry.data.fields.SchemaField.InitializedType<Pick<ActionsSchema, "actions">>;
      type ItemWithActions = ItemPTR2e & { system: SystemWithActions };
      type SystemWithEquippedData = Omit<ItemSystemPTR, "equipped"> & foundry.data.fields.SchemaField.InitializedType<Pick<GearDataSchema, "equipped">>;
      type ItemWithEquippedData = ItemPTR2e & { system: SystemWithEquippedData };

      namespace System {
        namespace Ability {
          type ParentInstance = AbilityPTR2e;
          type ParentSource = PTR.Item.Source & { system: PTR.Item.System.Ability.Source }
        }
        namespace Blueprint {
          type ParentInstance = BlueprintPTR2e;
          type ParentSource = PTR.Item.Source & { system: PTR.Item.System.Blueprint.Source }
        }
        namespace Consumable {
          type ParentInstance = ConsumablePTR2e;
          type ParentSource = PTR.Item.Source & { system: PTR.Item.System.Consumable.Source }
        }
        namespace Container {
          type ParentInstance = ContainerPTR2e;
          type ParentSource = PTR.Item.Source & { system: PTR.Item.System.Container.Source }
        }
        namespace Equipment {
          type ParentInstance = EquipmentPTR2e;
          type ParentSource = PTR.Item.Source & { system: PTR.Item.System.Equipment.Source }
        }
        namespace Gear {
          type ParentInstance = GearPTR2e;
          type ParentSource = PTR.Item.Source & { system: PTR.Item.System.Gear.Source }
        }
        namespace Move {
          type ParentInstance = MovePTR2e;
          type ParentSource = PTR.Item.Source & { system: PTR.Item.System.Move.Source }
        }
        namespace Perk {
          type ParentInstance = PerkPTR2e;
          type ParentSource = PTR.Item.Source & { system: PTR.Item.System.Perk.Source }
        }
        namespace Species {
          type ParentInstance = SpeciesPTR2e;
          type ParentSource = PTR.Item.Source & { system: PTR.Item.System.Species.Source }
        }
        namespace Weapon {
          type ParentInstance = WeaponPTR2e;
          type ParentSource = PTR.Item.Source & { system: PTR.Item.System.Weapon.Source }
        }
        namespace Effect {
          type ParentInstance = EffectPTR2e;
          type ParentSource = PTR.Item.Source & { system: PTR.Item.System.Effect.Source }
        }
        namespace Summon {
          type ParentInstance = SummonPTR2e;
          type ParentSource = PTR.Item.Source & { system: PTR.Item.System.Summon.Source }
        }
      }
    }
  }
}