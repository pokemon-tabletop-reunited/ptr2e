import type { ChangeModelSchema, ChangeModel } from "./change.ts";
import type { BasicChangeSystem } from "./basic.ts";
import type { FlatModifierChangeSchema, FlatModifierChangeSystem} from "./flat-modifier.ts";
import type { StageModifierSystem } from "./stage-modifier.ts";
import type { PercentileModifierSystem } from "./percentile-modifier.ts";
import type { EphemeralModifierChangeSchema, EphemeralModifierChangeSystem } from "./ephemeral-modifier.ts";
import type { GrantItemChangeSchema, GrantItemChangeSystem } from "./grant-item.ts";
import type { GrantEffectChangeSystem } from "./grant-effect.ts";
import type { AddTraitChangeSystem } from "./add-trait.ts";
import type { RemoveTraitChangeSystem } from "./remove-trait.ts";
import type { SuppressAbilityChangeSystem } from "./suppress-ability.ts";
import type { StatsAlterationChangeSchema, StatsAlterationChangeSystem } from "./stats-alteration.ts";
import type { RollNoteChangeSchema, RollNoteChangeSystem } from "./roll-note.ts";
import type { RollOptionChangeSchema, RollOptionChangeSystem } from "./roll-option.ts";
import type { EffectRollChangeSchema, EffectRollChangeSystem } from "./effect-roll.ts";
import type { ChoiceSetChangeSchema, ChoiceSetChangeSystem } from "./choice-set/change-model.ts";
import type { AlterAttackChangeSchema, AlterAttackChangeSystem } from "./alter-attack.ts";
import type { AuraChangeSchema, AuraChangeSystem } from "./aura.ts";
import type { TokenTagChangeSystem } from "./token-tag/token-tag.ts";
import type { TokenAlterationsChangeSchema, TokenAlterationsChangeSystem } from "./token-alterations.ts";
import type { EphemeralEffectChangeSchema, EphemeralEffectChangeSystem } from "./ephemeral-effect.ts";

export { default as ChangeModel } from "./change.ts";
export { default as RollOptionChangeSystem } from "./roll-option.ts";
export { default as BasicChangeSystem } from "./basic.ts";
export { default as FlatModifierChangeSystem } from "./flat-modifier.ts";
export { default as GrantItemChangeSystem } from "./grant-item.ts";
export { default as GrantEffectChangeSystem } from "./grant-effect.ts";
export { default as StageModifierSystem } from "./stage-modifier.ts";
export { default as PercentileModifierSystem } from "./percentile-modifier.ts";
export { default as EphemeralEffectChangeSystem } from "./ephemeral-effect.ts";
export { default as EphemeralModifierChangeSystem } from "./ephemeral-modifier.ts";
export { default as RollNoteChangeSystem } from "./roll-note.ts";
export { default as EffectRollChangeSystem } from "./effect-roll.ts";
export { default as ChoiceSetChangeSystem } from "./choice-set/change-model.ts";
export { default as AddTraitChangeSystem } from "./add-trait.ts";
export { default as RemoveTraitChangeSystem } from "./remove-trait.ts";
export { default as AlterAttackChangeSystem } from "./alter-attack.ts";
export { default as SuppressAbilityChangeSystem } from "./suppress-ability.ts";
export { default as TokenAlterationsChangeSystem } from "./token-alterations.ts";
export { default as StatsAlterationChangeSystem } from "./stats-alteration.ts";
export { default as AuraChangeSystem } from "./aura.ts";
export { default as TokenTagChangeSystem } from "./token-tag/token-tag.ts";
export type * from "./choice-set/change-model.ts";
export type * from "./data.ts";

declare global {
  namespace PTR {
    namespace ActiveEffect {
      namespace Changes {
        type Schema = ChangeModelSchema;
        type Instance = ChangeModel;
        type Source = foundry.data.fields.SchemaField.PersistedType<ChangeModelSchema>;

        namespace Models {
          namespace Basic {
            type Schema = ChangeModelSchema;
            type Instance = BasicChangeSystem;
            type Source = foundry.data.fields.SchemaField.PersistedType<ChangeModelSchema>;
          }
          namespace FlatModifier {
            type Schema = FlatModifierChangeSchema;
            type Instance = FlatModifierChangeSystem;
            type Source = foundry.data.fields.SchemaField.PersistedType<FlatModifierChangeSchema>;
          }
          namespace StageModifier {
            type Schema = FlatModifierChangeSchema;
            type Instance = StageModifierSystem;
            type Source = foundry.data.fields.SchemaField.PersistedType<FlatModifierChangeSchema>;
          }
          namespace PercentileModifier {
            type Schema = FlatModifierChangeSchema;
            type Instance = PercentileModifierSystem;
            type Source = foundry.data.fields.SchemaField.PersistedType<FlatModifierChangeSchema>;
          }
          namespace EphemeralModifier {
            type Schema = EphemeralModifierChangeSchema;
            type Instance = EphemeralModifierChangeSystem;
            type Source = foundry.data.fields.SchemaField.PersistedType<EphemeralModifierChangeSchema>;
          }
          namespace GrantItem {
            type Schema = GrantItemChangeSchema;
            type Instance = GrantItemChangeSystem;
            type Source = foundry.data.fields.SchemaField.PersistedType<GrantItemChangeSchema>;
          }
          namespace GrantEffect {
            type Schema = GrantItemChangeSchema;
            type Instance = GrantEffectChangeSystem;
            type Source = foundry.data.fields.SchemaField.PersistedType<GrantItemChangeSchema>;
          }
          namespace AddTrait {
            type Schema = ChangeModelSchema;
            type Instance = AddTraitChangeSystem;
            type Source = foundry.data.fields.SchemaField.PersistedType<ChangeModelSchema>;
          }
          namespace RemoveTrait {
            type Schema = ChangeModelSchema;
            type Instance = RemoveTraitChangeSystem;
            type Source = foundry.data.fields.SchemaField.PersistedType<ChangeModelSchema>;
          }
          namespace SuppressAbility {
            type Schema = ChangeModelSchema;
            type Instance = SuppressAbilityChangeSystem;
            type Source = foundry.data.fields.SchemaField.PersistedType<ChangeModelSchema>;
          }
          namespace StatsAlteration {
            type Schema = StatsAlterationChangeSchema;
            type Instance = StatsAlterationChangeSystem;
            type Source = foundry.data.fields.SchemaField.PersistedType<StatsAlterationChangeSchema>;
          }
          namespace RollNote {
            type Schema = RollNoteChangeSchema;
            type Instance = RollNoteChangeSystem;
            type Source = foundry.data.fields.SchemaField.PersistedType<RollNoteChangeSchema>;
          }
          namespace RollOption {
            type Schema = RollOptionChangeSchema;
            type Instance = RollOptionChangeSystem;
            type Source = foundry.data.fields.SchemaField.PersistedType<RollOptionChangeSchema>;
          }
          namespace EffectRoll {
            type Schema = EffectRollChangeSchema;
            type Instance = EffectRollChangeSystem;
            type Source = foundry.data.fields.SchemaField.PersistedType<EffectRollChangeSchema>;
          }
          namespace ChoiceSet {
            type Schema = ChoiceSetChangeSchema;
            type Instance = ChoiceSetChangeSystem;
            type Source = foundry.data.fields.SchemaField.PersistedType<ChoiceSetChangeSchema>;
          }
          namespace AlterAttack {
            type Schema = AlterAttackChangeSchema;
            type Instance = AlterAttackChangeSystem;
            type Source = foundry.data.fields.SchemaField.PersistedType<AlterAttackChangeSchema>;
          }
          namespace Aura {
            type Schema = AuraChangeSchema;
            type Instance = AuraChangeSystem;
            type Source = foundry.data.fields.SchemaField.PersistedType<AuraChangeSchema>;
          }
          namespace TokenTag {
            type Schema = ChangeModelSchema;
            type Instance = TokenTagChangeSystem;
            type Source = foundry.data.fields.SchemaField.PersistedType<ChangeModelSchema>;
          }
          namespace TokenAlterations {
            type Schema = TokenAlterationsChangeSchema;
            type Instance = TokenAlterationsChangeSystem;
            type Source = foundry.data.fields.SchemaField.PersistedType<TokenAlterationsChangeSchema>;
          }
          namespace EphemeralEffect {
            type Schema = EphemeralEffectChangeSchema;
            type Instance = EphemeralEffectChangeSystem;
            type Source = foundry.data.fields.SchemaField.PersistedType<EphemeralEffectChangeSchema>;
          }
        }
      }
    }
  }
}