import { ActorPTR2e } from "@actor";
import { ChangeModel } from "@data";

export default class RollOptionChangeSystem extends ChangeModel {
    static override TYPE = "rolloption";

    override apply(actor: ActorPTR2e, rollOptions?: string[] | Set<string> | null): void {
        console.debug('RollOptionChangeSystem.apply', actor, rollOptions);
    }
}