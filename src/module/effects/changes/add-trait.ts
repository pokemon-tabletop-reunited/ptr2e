import type { ActorPTR2e } from "@actor";
import { ChangeModel } from "@data";
import { sluggify } from "@utils";

export default class AddTraitChangeSystem extends ChangeModel {
  static override TYPE = "add-trait";

  get trait() {
    return this.value;
  }

  override apply(actor: ActorPTR2e): void {
    if(this.ignored) return;
    if(!this.actor) return;
    if (!this.test(actor.getRollOptions())) return;

    const trait = sluggify(this.resolveInjectedProperties(this.trait));
    if(!trait || trait === "null") return;

    actor.system.addTraitFromSlug(trait, true);
  }
}

export default interface AddTraitChangeSystem  {
  value: string;
}