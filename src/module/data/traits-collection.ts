import { formatSlug, sluggify } from "@utils";
import Trait from "./models/trait.ts";

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

        for(const trait of CONFIG.PTR.data.traits) {
            if(!trait.description) trait.description = "";
            this.set(trait.slug, trait as Trait);
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