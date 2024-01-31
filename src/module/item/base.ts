import { sluggify } from "../../util/misc.ts";
import { PTRActor } from "../actor/base.ts";
import ItemSystemBase from "./document.ts";

/**
 * @extends {PTRItemData}
 */
class PTRItem<TSystem extends ItemSystemBase = ItemSystemBase, TParent extends PTRActor | null = PTRActor | null> extends Item<TParent, TSystem>{
    get slug() {
        return this.system.slug || sluggify(this.name);
    }
}

interface PTRItem<TSystem extends ItemSystemBase = ItemSystemBase, TParent extends PTRActor | null = PTRActor | null> extends Item<TParent, TSystem> {
}

export { PTRItem}