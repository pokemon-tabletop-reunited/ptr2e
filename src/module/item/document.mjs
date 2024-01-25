import { sluggify } from "../../util/misc.mjs";
import { PTRAction } from "../action.mjs";
import { PTRItem } from "./base.mjs";

/**
 * @extends {ItemSystemSource}
 */
export default class ItemSystemBase extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            slug: new fields.StringField({ required: true}),
            container: new fields.ForeignDocumentField(PTRItem, { required: false, nullable: true }),
            actions: new fields.ArrayField(new fields.EmbeddedDataField(PTRAction)),
            description: new fields.HTMLField({ required: false, nullable: true }),
            traits: new fields.ArrayField(new fields.StringField()),
        }
    }

    prepareBaseData() {
        this.slug ??= sluggify(this.name ?? "");
    }

    get name() {
        return this.parent.name;
    }
}