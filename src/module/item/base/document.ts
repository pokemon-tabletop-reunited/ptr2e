import { sluggify } from "@utils";
import { ActorPTR2e } from "@actor";
import { ItemSystemPTR2e } from "@item";
import { ItemSheetPTR2e } from "@item/base/sheet.ts";

/**
 * @extends {PTRItemData}
 */
class ItemPTR2e<TSystem extends ItemSystemPTR2e = ItemSystemPTR2e, TParent extends ActorPTR2e | null = ActorPTR2e | null> extends Item<TParent, TSystem> {
    get slug() {
        return this.system.slug || sluggify(this.name);
    }
}

interface ItemPTR2e<TSystem extends ItemSystemPTR2e = ItemSystemPTR2e, TParent extends ActorPTR2e | null = ActorPTR2e | null> extends Item<TParent, TSystem> {
    constructor: typeof ItemPTR2e;

    _sheet: ItemSheetPTR2e<this> | null;
    get sheet(): ItemSheetPTR2e<this>;
}

export { ItemPTR2e }