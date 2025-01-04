import { formatSlug, sluggify } from "@utils";
import type Trait from "./models/trait.ts";

export default class PTR2eTraits extends Collection<Trait> {
  rawModuleTraits: Trait[] = [];

  constructor() {
    super();
    this.refresh();
  }

  static create() {
    return new PTR2eTraits().refresh();
  }

  refresh() {
    this.clear();

    for (const trait of CONFIG.PTR.data.traits) {
      if (!trait.description) trait.description = "";
      //@ts-expect-error - This is a valid operation
      if(!trait.changes) trait.changes = [];
      this.set(trait.slug, trait as unknown as Trait);
    }

    // Allow custom-defined user Traits from the world
    const settingTraits = game.settings.get("ptr2e", "traits");
    if (settingTraits?.length > 0) {
      settingTraits.forEach((trait: Trait) => {
        if (!trait.slug && !trait.label) return;
        trait.slug ??= sluggify(trait.label);
        trait.label ??= formatSlug(trait.slug);
        trait.description ??= "";
        trait.related ??= [];
        this.set(trait.slug, trait);
      });
    }

    // Allow modules to add and override Traits
    const toAdd: Trait[] = [];
    Hooks.callAll("ptr2e.prepareTraits", toAdd);

    if (toAdd.length > 0) {
      toAdd.forEach((trait: Trait) => {
        if (!trait.slug && !trait.label) return;
        trait.slug ??= sluggify(trait.label);
        trait.label ??= formatSlug(trait.slug);
        trait.description ??= "";
        trait.related ??= [];
        this.set(trait.slug, trait);
      });
    }

    this.rawModuleTraits = foundry.utils.deepClone(toAdd);

    return this;
  }
}