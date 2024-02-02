import { ActionPTR2e, ContainerPTR2e, ItemPTR2e } from "@item";
import { sluggify } from "@utils";

class ItemSystemPTR2e extends foundry.abstract.TypeDataModel {
    static override defineSchema(): foundry.data.fields.DataSchema {
        const fields = foundry.data.fields;
        return {
            slug: new fields.StringField({ required: true }),
            container: new fields.ForeignDocumentField(ItemPTR2e, { required: false, nullable: true }),
            actions: new fields.ArrayField(new fields.EmbeddedDataField(ActionPTR2e)),
            description: new fields.HTMLField({ required: false, nullable: true }),
            traits: new fields.SetField(new fields.StringField()),
        }
    }

    override prepareBaseData() {
        this.slug ||= sluggify(this.name);
        this.traits = (this._source.traits as string[]).reduce((acc: Map<string, Trait>, traitSlug: string) => {
            const trait = game.ptr.data.traits.get(traitSlug)
            if (trait) acc.set(traitSlug, trait);
            return acc;
        }, new Map<string, Trait>());
    }

    get name() {
        return this.parent.name;
    }
}

interface ItemSystemPTR2e extends foundry.abstract.TypeDataModel {
    slug: string

    actions: Record<string, ActionPTR2e>
    container: ContainerPTR2e
    description: string
    traits: Map<string, Trait>

    parent: ItemPTR2e;
}

export { ItemSystemPTR2e }