import type {default as AbilitySystemModel, AbilitySchema } from "./ability.ts";
import type {default as BlueprintSystemModel, BlueprintItemSchema } from "./blueprint.ts";
import type {default as ConsumableSystemModel, ConsumableSchema } from "./consumable.ts";
import type {default as ContainerSystemModel, ContainerSystemSchema } from "./container.ts";
import type {default as EquipmentSystemModel, EquipmentSchema } from "./equipment.ts";
import type {default as GearSystemModel, GearSystemSchema } from "./gear.ts";
import type {default as MoveSystemModel, MoveSchema } from "./move.ts";
import type {default as PerkSystemModel, PerkSchema } from "./perk.ts";
import type {default as SpeciesSystemModel, SpeciesSchema, EvolutionSchema, EvolutionData } from "./species.ts";
import type {default as WeaponSystemModel, WeaponSchema } from "./weapon.ts";
import type {default as EffectSystemModel, EffectSchema } from "./effect.ts";
import type {default as SummonSystemModel, SummonItemSchema } from "./summon.ts";

/** @module data/models/items */
export { default as AbilitySystemModel } from "./ability.ts";
export { default as BlueprintSystemModel } from "./blueprint.ts";
export { default as ConsumableSystemModel } from "./consumable.ts";
export { default as ContainerSystemModel } from "./container.ts";
export { default as EquipmentSystemModel } from "./equipment.ts";
export { default as GearSystemModel } from "./gear.ts";
export { default as MoveSystemModel } from "./move.ts";
export { default as PerkSystemModel } from "./perk.ts";
export { default as SpeciesSystemModel } from "./species.ts";
export { default as WeaponSystemModel } from "./weapon.ts";
export { default as EffectSystemModel } from "./effect.ts";
export { default as SummonSystemModel } from "./summon.ts";

declare global {
  namespace PTR {
    namespace Item {
      namespace System {
        namespace Ability {
          type Schema = AbilitySchema;
          type Instance = AbilitySystemModel;
          type Source = foundry.data.fields.SchemaField.PersistedType<AbilitySchema>;
        }
        namespace Blueprint {
          type Schema = BlueprintItemSchema;
          type Instance = BlueprintSystemModel;
          type Source = foundry.data.fields.SchemaField.PersistedType<BlueprintItemSchema>;
        }
        namespace Consumable {
          type Schema = ConsumableSchema;
          type Instance = ConsumableSystemModel;
          type Source = foundry.data.fields.SchemaField.PersistedType<ConsumableSchema>;
        }
        namespace Container {
          type Schema = ContainerSystemSchema;
          type Instance = ContainerSystemModel;
          type Source = foundry.data.fields.SchemaField.PersistedType<ContainerSystemSchema>;
        }
        namespace Equipment {
          type Schema = EquipmentSchema;
          type Instance = EquipmentSystemModel;
          type Source = foundry.data.fields.SchemaField.PersistedType<EquipmentSchema>;
        }
        namespace Gear {
          type Schema = GearSystemSchema;
          type Instance = GearSystemModel;
          type Source = foundry.data.fields.SchemaField.PersistedType<GearSystemSchema>;
        }
        namespace Move {
          type Schema = MoveSchema;
          type Instance = MoveSystemModel;
          type Source = foundry.data.fields.SchemaField.PersistedType<MoveSchema>;
        }
        namespace Perk {
          type Schema = PerkSchema;
          type Instance = PerkSystemModel;
          type Source = foundry.data.fields.SchemaField.PersistedType<PerkSchema>;
        }
        namespace Species {
          type Schema = SpeciesSchema;
          type Instance = SpeciesSystemModel;
          type Source = foundry.data.fields.SchemaField.PersistedType<SpeciesSchema>;
          namespace Evolution {
            type Schema = EvolutionSchema;
            type Instance = EvolutionData;
            type Source = foundry.data.fields.SchemaField.PersistedType<EvolutionSchema>;
          }
        }
        namespace Weapon {
          type Schema = WeaponSchema;
          type Instance = WeaponSystemModel;
          type Source = foundry.data.fields.SchemaField.PersistedType<WeaponSchema>;
        }
        namespace Effect {
          type Schema = EffectSchema;
          type Instance = EffectSystemModel;
          type Source = foundry.data.fields.SchemaField.PersistedType<EffectSchema>;
        }
        namespace Summon {
          type Schema = SummonItemSchema;
          type Instance = SummonSystemModel;
          type Source = foundry.data.fields.SchemaField.PersistedType<SummonItemSchema>;
        }
      }
    }
  }
}