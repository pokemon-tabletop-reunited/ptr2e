import { ActorPTR2e } from "@actor";
import { ChangeModel } from "./change.ts";
export class RollOptionChangeSystem extends ChangeModel {
    
    static override TYPE = "rolloption";

    override apply(actor: ActorPTR2e, rollOptions?: string[] | Set<string> | null): void {
        console.log('RollOptionChangeSystem.apply', actor, rollOptions);
    }

}