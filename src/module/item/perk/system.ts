import { ItemSystemPTR2e, PerkPTR2e } from "@item";
import { PTRNode } from "@item/base/data.ts";
import { PTRPerkTreeNodeData } from "@module/canvas/perk-tree/perk-tree-node.mjs";

class PerkSystemPTR2e extends ItemSystemPTR2e {
    static override defineSchema() {
        const fields = foundry.data.fields;
        return Object.assign(super.defineSchema(), {
            node: new fields.SchemaField({
                id: new fields.StringField({ required: true, blank: false, initial: () => foundry.utils.randomID() }),
                angle: new fields.AngleField({ required: true, initial: 0 }),
                distance: new fields.NumberField({ required: true, initial: 100, validate: (d) => d as number >= 0 }),
                type: new fields.StringField({ choices: ["normal", "root", "ranked"], required: true, initial: "normal" }),
                connected: new fields.ArrayField(new fields.StringField()),
                texture: new fields.FilePathField({ required: true, categories: ["IMAGE", "MEDIA", "VIDEO"], initial: "systems/ptu/css/images/types2/UntypedIC_Icon.png" }),
                visible: new fields.BooleanField({ required: true, initial: true }),
            }),
            cost: new fields.NumberField(),
            prerequisites: new fields.ArrayField(new fields.StringField()),
        })
    }

    override prepareBaseData() {
        super.prepareBaseData();

        this.node = PTRPerkTreeNodeData.fromPerk(this);
    }

    async toEmbed() {
        const container = document.createElement("div");
        container.innerHTML = `<h2>Perk: ${this.name}</h2><p>Effect: ${this.description}</p>`;
        return container;
    }
}

interface PerkSystemPTR2e extends ItemSystemPTR2e {
    type: "perk"

    node: PTRNode

    /** Perk point cost */
    cost: number
    prerequisites: Trait[]

    get fromNode(): Node | null;

    parent: PerkPTR2e;
}

export { PerkSystemPTR2e };