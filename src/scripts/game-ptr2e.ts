import PTRPerkTree from "@module/canvas/perk-tree/perk-tree.mjs"
import { formatSlug, sluggify } from "@utils"

const GamePTR = {
    onInit() {
        const initData = {
            tree: new PTRPerkTree(),
            util: {
                sluggify
            },
            data: {
                traits: _prepareTraits()
            }
        }

        game.ptr = fu.mergeObject(game.ptr ?? {}, initData)
    },
    onSetup() { },
    onReady() { }
}

export { GamePTR }

function _prepareTraits() {
    const baseTraits = CONFIG.PTR.data.traits.reduce((acc: Map<string, Trait>, trait: Trait) => {
        acc.set(trait.slug, trait)
        return acc
    }, new Map());

    // Allow custom-defined user Traits from the world 
    // TODO: Implement this

    // Allow modules to add and override Traits
    const toAdd: Trait[] = [];
    Hooks.callAll("ptr2e.prepareTraits", toAdd)

    if(toAdd.length > 0) {
        toAdd.forEach((trait: Trait) => {
            if(!trait.slug && !trait.label) return;
            trait.slug ??= sluggify(trait.label);
            trait.label ??= formatSlug(trait.slug);
            trait.description ??= "";
            trait.related ??= [];
            baseTraits.set(trait.slug, trait);
        });
    }

    return baseTraits
}
