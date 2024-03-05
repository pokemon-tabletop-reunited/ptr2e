import { ActorPTR2e } from "@actor";
import { ItemSheetPTR2e, ItemSystemPTR } from "@item";

/**
 * @extends {PTRItemData}
 */
class ItemPTR2e<TSystem extends ItemSystemPTR = ItemSystemPTR, TParent extends ActorPTR2e | null = ActorPTR2e | null> extends Item<TParent, TSystem> {

    declare _sheet: ItemSheetPTR2e<this> | null;
    override get sheet() {
        return super.sheet as ItemSheetPTR2e<this>;
    }

    get slug() {
        return this.system.slug;
    }

    getRollOptions(): string[] {
        return [];
    }
}

export { ItemPTR2e }