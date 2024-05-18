import { ActorPTR2e } from "@actor";
import FlatModifierChangeSystem from "./flat-modifier.ts";

export default class StageModifierSystem extends FlatModifierChangeSystem {
    static override TYPE = "stage-modifier";

    override beforePrepareData(actor: ActorPTR2e | null = this.actor): void {
        return super.beforePrepareData(actor, "stage");
    } 
}