import { ActionPTR2e, AttackPTR2e, PassivePTR2e, BasicChangeSystem, RollOptionChangeSystem, FlatModifierChangeSystem, GrantItemChangeSystem, StageModifierSystem, PercentileModifierSystem, GrantEffectChangeSystem, EphemeralEffectChangeSystem, RollNoteChangeSystem, EffectRollChangeSystem, ChoiceSetChangeSystem, AddTraitChangeSystem, RemoveTraitChangeSystem } from "@data";

let changeTypes;
export function ChangeModelTypes() {
  return changeTypes ??= Object.freeze({
    [BasicChangeSystem.TYPE]: BasicChangeSystem,
    [RollOptionChangeSystem.TYPE]: RollOptionChangeSystem,
    [FlatModifierChangeSystem.TYPE]: FlatModifierChangeSystem,
    [GrantItemChangeSystem.TYPE]: GrantItemChangeSystem,
    [GrantEffectChangeSystem.TYPE]: GrantEffectChangeSystem,
    [StageModifierSystem.TYPE]: StageModifierSystem,
    [PercentileModifierSystem.TYPE]: PercentileModifierSystem,
    [EphemeralEffectChangeSystem.TYPE]: EphemeralEffectChangeSystem,
    [RollNoteChangeSystem.TYPE]: RollNoteChangeSystem,
    [EffectRollChangeSystem.TYPE]: EffectRollChangeSystem,
    [ChoiceSetChangeSystem.TYPE]: ChoiceSetChangeSystem,
    [AddTraitChangeSystem.TYPE]: AddTraitChangeSystem,
    [RemoveTraitChangeSystem.TYPE]: RemoveTraitChangeSystem
  });
}

let actionTypes;
export function ActionModelTypes() {
  return actionTypes ??= Object.freeze({
    [ActionPTR2e.TYPE]: ActionPTR2e,
    [AttackPTR2e.TYPE]: AttackPTR2e,
    [PassivePTR2e.TYPE]: PassivePTR2e,
    "exploration": ActionPTR2e,
    "downtime": ActionPTR2e,
    "camping": ActionPTR2e,
  });
}