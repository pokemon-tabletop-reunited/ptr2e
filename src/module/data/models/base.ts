import { ActionPTR2e, AttackPTR2e, BasicChangeSystem, RollOptionChangeSystem, FlatModifierChangeSystem, GrantItemChangeSystem } from "@data";

let changeTypes;
export function ChangeModelTypes() {    
    return changeTypes ??= Object.freeze({
        [BasicChangeSystem.TYPE]: BasicChangeSystem,
        [RollOptionChangeSystem.TYPE]: RollOptionChangeSystem,
        [FlatModifierChangeSystem.TYPE]: FlatModifierChangeSystem,
        [GrantItemChangeSystem.TYPE]: GrantItemChangeSystem,
    });
}

let actionTypes;
export function ActionModelTypes() {
    return actionTypes ??= Object.freeze({
        [ActionPTR2e.TYPE]: ActionPTR2e,
        [AttackPTR2e.TYPE]: AttackPTR2e,
        "passive": ActionPTR2e,
        "exploration": ActionPTR2e,
        "downtime": ActionPTR2e,
        "camping": ActionPTR2e,
    });
}