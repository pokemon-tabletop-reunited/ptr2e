import type { ActorPTR2e } from "@actor";
import { ChangeModel } from "@data";
import { sluggify } from "@utils";

class RemoveTraitChangeSystem extends ChangeModel {
  static override TYPE = "remove-trait";

  get trait() {
    return this.value;
  }

  override apply(actor: ActorPTR2e): void {
    if (this.ignored) return;
    if (!this.actor) return;
    if (!this.test(actor.getRollOptions())) return;

    const trait = sluggify(this.resolveInjectedProperties(this.trait));
    if (!trait || trait === "null") return;

    actor.system.traits.suppressedTraits.add(trait);
    actor.rollOptions.removeOption("trait", trait);
  }
}

interface RemoveTraitChangeSystem {
  value: string;
}

export default RemoveTraitChangeSystem;
export type { RemoveTraitChangeSystem };