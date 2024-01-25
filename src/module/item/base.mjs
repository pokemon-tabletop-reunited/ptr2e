import { sluggify } from "../../util/misc.mjs";

/**
 * @extends {PTRItemData}
 */
class PTRItem extends Item {
    get slug() {
        return this.system.slug || sluggify(this.name);
    }
}

export { PTRItem}