// import { ActorPTR2e } from "@actor";
// import { ChangeModel } from "./change.ts";

import { ActionPTR2e } from "./action.ts";
import AttackPTR2e from "./attack.ts";
import { BasicChangeSystem } from "./basic.ts";
import { RollOptionChangeSystem } from "./rolloption.ts";

// export abstract class BaseChangeSystem extends foundry.abstract.TypeDataModel {
//     declare parent: ChangeModel;
//     abstract apply(actor: ActorPTR2e, rollOptions?: string[] | Set<string>): unknown;

//     get effect() {
//         return this.parent.effect;
//     }
// }

let changeTypes;

export function ChangeTypes() {    
    return changeTypes ??= Object.freeze({
        [BasicChangeSystem.TYPE]: BasicChangeSystem,
        [RollOptionChangeSystem.TYPE]: RollOptionChangeSystem
    });
}

let actionTypes;
export function ActionTypes() {
    return actionTypes ??= Object.freeze({
        [ActionPTR2e.TYPE]: ActionPTR2e,
        [AttackPTR2e.TYPE]: AttackPTR2e,
        "passive": ActionPTR2e,
    });
}