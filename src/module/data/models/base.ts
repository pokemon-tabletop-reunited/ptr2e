// import { ActorPTR2e } from "@actor";
// import { ChangeModel } from "./change.ts";

import { BasicChangeSystem } from "./basic.ts";
import { RollOptionChangeSystem } from "./rolloption.ts";

// export abstract class BaseChangeSystem extends foundry.abstract.TypeDataModel {
//     declare parent: ChangeModel;
//     abstract apply(actor: ActorPTR2e, rollOptions?: string[] | Set<string>): unknown;

//     get effect() {
//         return this.parent.effect;
//     }
// }

let types;

export function ChangeTypes() {    
    return types ??= Object.freeze({
        [BasicChangeSystem.TYPE]: BasicChangeSystem,
        [RollOptionChangeSystem.TYPE]: RollOptionChangeSystem
    });
}