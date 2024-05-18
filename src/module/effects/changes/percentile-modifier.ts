import { ActorPTR2e } from "@actor";
import FlatModifierChangeSystem from "./flat-modifier.ts";

export default class PercentileModifierSystem extends FlatModifierChangeSystem {
    static override TYPE = "percentile-modifier";

    override beforePrepareData(actor: ActorPTR2e | null = this.actor): void {
        return super.beforePrepareData(actor, "percentile");
    } 
}