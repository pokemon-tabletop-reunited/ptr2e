import { formatSlug, sluggify } from "@utils";
import Trait, { PlaceholderTrait } from "./models/trait.ts";

export default class PTR2eTraits extends Collection<Trait> {
  rawModuleTraits: Trait[] = [];
  placeholders: PlaceholderTrait[] = [];

  constructor() {
    super();
    this.refresh();
  }

  static create() {
    return new PTR2eTraits().refresh();
  }

  getTrait(slug: string): Trait | undefined {
    if(!slug) return undefined;
    const early = this.get(slug);
    if (early) return early;

    for (const placeholder of this.placeholders) {
      let gotHit = false;
      const trait: PlaceholderTrait = {...placeholder};
      for (const entry of placeholder.placeholders) {
        const result = slug.match("^"+entry.keyPattern+"$");
        if(!result) continue;

        const value = slug.match(entry.valuePattern);
        if(!value) continue;

        const realValue = value.length > 1 ? value[1] : value[0];

        trait.slug = slug;
        trait.label = trait.label.replace(entry.labelPattern, realValue);
        trait.description = trait.description.replace(entry.descriptionPattern, entry.descriptionReplacement.replaceAll("{{x}}", realValue));
        if(!trait.value) {
          trait.value = realValue + (entry.valueDivisor ? entry.valueDivisor : "");
        } else {
          trait.value += realValue + (entry.valueDivisor ? entry.valueDivisor : "");
        }
        gotHit = true;
      }

      if(gotHit) return trait;
    }

    return undefined;
  }

  refresh() {
    this.clear();

    for (const trait of CONFIG.PTR.data.traits) {
      if (!trait.description) trait.description = "";
      //@ts-expect-error - This is a valid operation
      if (!trait.changes) trait.changes = [];
      if (trait.placeholders && trait.placeholders.length > 0) {
        this.placeholders.push(trait as unknown as PlaceholderTrait);
      }

      this.set(trait.slug, trait as unknown as Trait);
    }

    // Allow custom-defined user Traits from the world
    const settingTraits = game.settings.get<Trait[]>("ptr2e", "traits");
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

    this.rawModuleTraits = fu.deepClone(toAdd);

    return this;
  }
}