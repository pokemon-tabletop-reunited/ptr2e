import FlatModifierChangeSystem from "./flat-modifier.ts";

class PercentileModifierSystem extends FlatModifierChangeSystem {
  static override TYPE = "percentile-modifier";

  override beforePrepareData(actor: Actor.ConfiguredInstance | null = this.actor): void {
    return super.beforePrepareData(actor, "percentile");
  }
}

export default PercentileModifierSystem;
export type { PercentileModifierSystem };