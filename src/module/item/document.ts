import { sluggify } from "../../util/misc.ts";
import { PTRAction } from "../action.ts";
import { PTRItem } from "./base.ts";
import { ActionSource, PTRItemData } from "./data.js";

/**
 * @extends {ItemSystemSource}
 */
class ItemSystemBase extends foundry.abstract.TypeDataModel {
    static override defineSchema() {
        const fields = foundry.data.fields;
        return {
            slug: new fields.StringField({ required: true }),
            container: new fields.ForeignDocumentField(PTRItem, { required: false, nullable: true }),
            actions: new fields.ArrayField(new fields.EmbeddedDataField(PTRAction)),
            description: new fields.HTMLField({ required: false, nullable: true }),
            traits: new fields.ArrayField(new fields.StringField()),
        }
    }

    override prepareBaseData() {
        this.slug ??= sluggify(this.name ?? "");
    }

    get name() {
        return this.parent?.name;
    }
}

interface ItemSystemBase extends foundry.abstract.TypeDataModel {
    slug: string

    actions: Record<string, ActionSource>
    container: PTRItemData | null
    description: string
    traits: Trait[]

    parent: PTRItemData | null;
}

export default ItemSystemBase;