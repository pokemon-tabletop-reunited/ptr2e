import { BasicChangeSystem } from "../../effects/changes";
import { ActionPTR2e, AttackPTR2e, PassivePTR2e, SummonAttackPTR2e } from "./actions";

let changeTypes: {
  [BasicChangeSystem.TYPE]: typeof BasicChangeSystem;
};
export function ChangeModelTypes() {
  return changeTypes ??= Object.freeze({
    [BasicChangeSystem.TYPE]: BasicChangeSystem,
    // [FlatModifierChangeSystem.TYPE]: FlatModifierChangeSystem,
    // [StageModifierSystem.TYPE]: StageModifierSystem,
    // [PercentileModifierSystem.TYPE]: PercentileModifierSystem,
    // [EphemeralModifierChangeSystem.TYPE]: EphemeralModifierChangeSystem,
    // [GrantItemChangeSystem.TYPE]: GrantItemChangeSystem,
    // [GrantEffectChangeSystem.TYPE]: GrantEffectChangeSystem,
    // [AddTraitChangeSystem.TYPE]: AddTraitChangeSystem,
    // [RemoveTraitChangeSystem.TYPE]: RemoveTraitChangeSystem,
    // [SuppresAbilityChangeSystem.TYPE]: SuppresAbilityChangeSystem,
    // [StatsAlterationChangeSystem.TYPE]: StatsAlterationChangeSystem,
    // [RollNoteChangeSystem.TYPE]: RollNoteChangeSystem,
    // [RollOptionChangeSystem.TYPE]: RollOptionChangeSystem,
    // [EffectRollChangeSystem.TYPE]: EffectRollChangeSystem,
    // [ChoiceSetChangeSystem.TYPE]: ChoiceSetChangeSystem,
    // [AlterAttackChangeSystem.TYPE]: AlterAttackChangeSystem,
    // [AuraChangeSystem.TYPE]: AuraChangeSystem,
    // [TokenTagChangeSystem.TYPE]: TokenTagChangeSystem,
    // [TokenAlterationsChangeSystem.TYPE]: TokenAlterationsChangeSystem,
    // [EphemeralEffectChangeSystem.TYPE]: EphemeralEffectChangeSystem,
    // [CreateClockChangeSystem.TYPE]: CreateClockChangeSystem,
    // [IncrementClockChangeSystem.TYPE]: IncrementClockChangeSystem,
  });
}

let actionTypes: {
  [ActionPTR2e.TYPE]: typeof ActionPTR2e;
  [AttackPTR2e.TYPE]: typeof AttackPTR2e;
  [PassivePTR2e.TYPE]: typeof PassivePTR2e;
  [SummonAttackPTR2e.TYPE]: typeof SummonAttackPTR2e;
  "exploration": typeof ActionPTR2e;
  "downtime": typeof ActionPTR2e;
  "camping": typeof ActionPTR2e;
};
export function ActionModelTypes() {
  return actionTypes ??= Object.freeze({
    [ActionPTR2e.TYPE]: ActionPTR2e,
    [AttackPTR2e.TYPE]: AttackPTR2e,
    [PassivePTR2e.TYPE]: PassivePTR2e,
    [SummonAttackPTR2e.TYPE]: SummonAttackPTR2e,
    "exploration": ActionPTR2e,
    "downtime": ActionPTR2e,
    "camping": ActionPTR2e,
  });
}