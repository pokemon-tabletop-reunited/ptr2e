import { sluggify } from "@utils";
import { ActorPTR2e } from "@actor";
import { ItemSheetPTR2e, ItemSystemPTR } from "@item";

/**
 * @extends {PTRItemData}
 */
class ItemPTR2e<TSystem extends ItemSystemPTR = ItemSystemPTR, TParent extends ActorPTR2e | null = ActorPTR2e | null> extends Item<TParent, TSystem> {
    get slug() {
        return this.system.slug || sluggify(this.name);
    }
}

interface ItemPTR2e<TSystem extends ItemSystemPTR = ItemSystemPTR, TParent extends ActorPTR2e | null = ActorPTR2e | null> extends Item<TParent, TSystem> {
    constructor: typeof ItemPTR2e;

    _sheet: ItemSheetPTR2e<this> | null;
    get sheet(): ItemSheetPTR2e<this>;
}

export { ItemPTR2e }