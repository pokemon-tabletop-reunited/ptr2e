import { ActionPTR2e, AttackPTR2e, PassivePTR2e, BasicChangeSystem, RollOptionChangeSystem, FlatModifierChangeSystem, GrantItemChangeSystem, StageModifierSystem, PercentileModifierSystem, GrantEffectChangeSystem, EphemeralEffectChangeSystem, RollNoteChangeSystem, EffectRollChangeSystem, ChoiceSetChangeSystem, AddTraitChangeSystem, RemoveTraitChangeSystem, AlterAttackChangeSystem, SummonAttackPTR2e, EphemeralModifierChangeSystem, SuppressAbilityChangeSystem, TokenAlterationsChangeSystem, StatsAlterationChangeSystem, AuraChangeSystem, TokenTagChangeSystem } from "@data";

export interface _ChangeModelTypes extends foundry.data.fields.TypedSchemaField.Types {
  "basic": PTR.ActiveEffect.Changes.Schema;
  "flat-modifier": PTR.ActiveEffect.Changes.Models.FlatModifier.Schema;
  "stage-modifier": PTR.ActiveEffect.Changes.Models.StageModifier.Schema;
  "percentile-modifier": PTR.ActiveEffect.Changes.Models.PercentileModifier.Schema;
  "ephemeral-modifier": PTR.ActiveEffect.Changes.Models.EphemeralModifier.Schema;
  "grant-item": PTR.ActiveEffect.Changes.Models.GrantItem.Schema;
  "grant-effect": PTR.ActiveEffect.Changes.Models.GrantEffect.Schema;
  "add-trait": PTR.ActiveEffect.Changes.Models.AddTrait.Schema;
  "remove-trait": PTR.ActiveEffect.Changes.Models.RemoveTrait.Schema;
  "suppress-ability": PTR.ActiveEffect.Changes.Models.SuppressAbility.Schema;
  "stats-alteration": PTR.ActiveEffect.Changes.Models.StatsAlteration.Schema;
  "roll-note": PTR.ActiveEffect.Changes.Models.RollNote.Schema;
  "roll-option": PTR.ActiveEffect.Changes.Models.RollOption.Schema;
  "effect-roll": PTR.ActiveEffect.Changes.Models.EffectRoll.Schema;
  "choice-set": PTR.ActiveEffect.Changes.Models.ChoiceSet.Schema;
  "alter-attack": PTR.ActiveEffect.Changes.Models.AlterAttack.Schema;
  "aura": PTR.ActiveEffect.Changes.Models.Aura.Schema;
  "token-tag": PTR.ActiveEffect.Changes.Models.TokenTag.Schema;
  "token-alterations": PTR.ActiveEffect.Changes.Models.TokenAlterations.Schema;
  "ephemeral-effect": PTR.ActiveEffect.Changes.Models.EphemeralEffect.Schema;
}

let changeTypes;
export function ChangeModelTypes(): _ChangeModelTypes {
  return changeTypes ??= Object.freeze({
    [BasicChangeSystem.TYPE]: BasicChangeSystem,
    [FlatModifierChangeSystem.TYPE]: FlatModifierChangeSystem,
    [StageModifierSystem.TYPE]: StageModifierSystem,
    [PercentileModifierSystem.TYPE]: PercentileModifierSystem,
    [EphemeralModifierChangeSystem.TYPE]: EphemeralModifierChangeSystem,
    [GrantItemChangeSystem.TYPE]: GrantItemChangeSystem,
    [GrantEffectChangeSystem.TYPE]: GrantEffectChangeSystem,
    [AddTraitChangeSystem.TYPE]: AddTraitChangeSystem,
    [RemoveTraitChangeSystem.TYPE]: RemoveTraitChangeSystem,
    [SuppressAbilityChangeSystem.TYPE]: SuppressAbilityChangeSystem,
    [StatsAlterationChangeSystem.TYPE]: StatsAlterationChangeSystem,
    [RollNoteChangeSystem.TYPE]: RollNoteChangeSystem,
    [RollOptionChangeSystem.TYPE]: RollOptionChangeSystem,
    [EffectRollChangeSystem.TYPE]: EffectRollChangeSystem,
    [ChoiceSetChangeSystem.TYPE]: ChoiceSetChangeSystem,
    [AlterAttackChangeSystem.TYPE]: AlterAttackChangeSystem,
    [AuraChangeSystem.TYPE]: AuraChangeSystem,
    [TokenTagChangeSystem.TYPE]: TokenTagChangeSystem,
    [TokenAlterationsChangeSystem.TYPE]: TokenAlterationsChangeSystem,
    [EphemeralEffectChangeSystem.TYPE]: EphemeralEffectChangeSystem,
  });
}

export interface _ActionModelTypes extends foundry.data.fields.TypedSchemaField.Types {
  "generic": PTR.Models.Action.Schema;
  "attack": PTR.Models.Action.Models.Attack.Schema;
  "passive": PTR.Models.Action.Models.Passive.Schema;
  "summon-attack": PTR.Models.Action.Models.Summon.Schema;
  "exploration": PTR.Models.Action.Schema;
  "downtime": PTR.Models.Action.Schema;
  "camping": PTR.Models.Action.Schema;
}

let actionTypes;
export function ActionModelTypes(): _ActionModelTypes {
  return actionTypes ??= Object.freeze({
    [ActionPTR2e.TYPE]: ActionPTR2e,
    [AttackPTR2e.TYPE]: AttackPTR2e,
    [PassivePTR2e.TYPE]: PassivePTR2e,
    [SummonAttackPTR2e.TYPE]: SummonAttackPTR2e,
    "exploration": ActionPTR2e,
    "downtime": ActionPTR2e,
    "camping": ActionPTR2e,
  })
}