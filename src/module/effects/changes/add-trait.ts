import { ChangeModel } from "@data";
import { sluggify } from "@utils";

class AddTraitChangeSystem extends ChangeModel {
  static override TYPE = "add-trait";

  get trait() {
    return this.value;
  }

  override apply(actor: Actor.ConfiguredInstance): void {
    if(this.ignored) return;
    if(!this.actor) return;
    if (!this.test(actor.getRollOptions())) return;

    const trait = sluggify(this.resolveInjectedProperties(this.trait));
    if(!trait || trait === "null") return;

    actor.system.addTraitFromSlug(trait, true);
  }
}

interface AddTraitChangeSystem  {
  value: string;
}

export default AddTraitChangeSystem;
export type { AddTraitChangeSystem };