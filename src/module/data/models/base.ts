import { ActionPTR2e, AttackPTR2e, BasicChangeSystem, RollOptionChangeSystem } from "@data";

let changeTypes;
export function ChangeModelTypes() {    
    return changeTypes ??= Object.freeze({
        [BasicChangeSystem.TYPE]: BasicChangeSystem,
        [RollOptionChangeSystem.TYPE]: RollOptionChangeSystem
    });
}

let actionTypes;
export function ActionModelTypes() {
    return actionTypes ??= Object.freeze({
        [ActionPTR2e.TYPE]: ActionPTR2e,
        [AttackPTR2e.TYPE]: AttackPTR2e,
        "passive": ActionPTR2e,
    });
}