import { PerkManager } from "@module/apps/perk-manager/perk-manager.ts"
import { PerkTree } from "@module/canvas/perk-tree/perk-tree.ts"
import TooltipsPTR2e from "@module/tooltips/tooltips.ts"
import { formatSlug, sluggify } from "@utils"

const GamePTR = {
    onInit() {
        const initData = {
            tree: new PerkTree(),
            util: {
                sluggify
            },
            data: {
                traits: _prepareTraits()
            },
            perks: new PerkManager(),
            tooltips: new TooltipsPTR2e()
        }

        game.ptr = fu.mergeObject(game.ptr ?? {}, initData)
    },
    onSetup() { 
        // Run "delayed" constructor of game.ptr.tooltips
        game.ptr.tooltips.observe();
    },
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

    if (toAdd.length > 0) {
        toAdd.forEach((trait: Trait) => {
            if (!trait.slug && !trait.label) return;
            trait.slug ??= sluggify(trait.label);
            trait.label ??= formatSlug(trait.slug);
            trait.description ??= "";
            trait.related ??= [];
            baseTraits.set(trait.slug, trait);
        });
    }

    return baseTraits
}
