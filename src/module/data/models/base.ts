import { ActionPTR2e, AttackPTR2e, PassivePTR2e, BasicChangeSystem, RollOptionChangeSystem, FlatModifierChangeSystem, GrantItemChangeSystem, StageModifierSystem, PercentileModifierSystem, GrantEffectChangeSystem, EphemeralEffectChangeSystem, RollNoteChangeSystem, EffectRollChangeSystem, ChoiceSetChangeSystem, AddTraitChangeSystem, RemoveTraitChangeSystem, AlterAttackChangeSystem, SummonAttackPTR2e, EphemeralModifierChangeSystem, SuppresAbilityChangeSystem, TokenAlterationsChangeSystem, StatsAlterationChangeSystem, AuraChangeSystem, TokenTagChangeSystem } from "@data";

let changeTypes;
export function ChangeModelTypes(): foundry.data.fields.TypedSchemaField.Types {
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
    [SuppresAbilityChangeSystem.TYPE]: SuppresAbilityChangeSystem,
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

let actionTypes;
export function ActionModelTypes(): foundry.data.fields.TypedSchemaField.Types {
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