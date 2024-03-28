import { PerkPTR2e } from "@item";
import { HasTraits, HasActions, HasSlug, HasDescription } from "@module/data/index.ts";
import { sluggify } from "@utils";

const NODE_TYPES = ["normal", "root", "ranked"] as const;
type NodeType = typeof NODE_TYPES[number];

const PerkExtension = HasTraits(HasDescription(HasSlug(HasActions(foundry.abstract.TypeDataModel))))

/**
 * @category Item Data Models
 */
export default abstract class PerkSystem extends PerkExtension {
    /**
     * @internal
     */
    declare parent: PerkPTR2e;

    /**
     * The prerequisites for this perk before it can be taken.
     */
    abstract prerequisites: string[];

    /**
     * The cost of this perk.
     */
    abstract cost: number;

    /**
     * The node data for this perk.
     */
    abstract node: {
        /**
         * The angle of the node.
         * @defaultValue `0`
         * @remarks
         * This is a value between 0 and 360. 
         */
        angle: number;
        /**
         * The distance of the node from the center.
         */
        distance: number;
        /**
         * The type of the node.
         * @defaultValue `normal`
         * @remarks
         * This is one of `normal`, `root`, or `ranked`.
         */
        type: NodeType;
        /**
         * The nodes that this node is connected to.
         */
        connected: Set<string>
        /**
         * The texture of the node.
         */
        texture: string;
        /**
         * Whether the node's visibility has been toggled by the GM.
         */
        visible: boolean;
    }

    /**
     * @internal
     */
    declare _source: InstanceType<typeof PerkExtension>['_source'] & {
        prerequisites: string[];
        cost: number;

        node: {
            angle: number;
            distance: number;
            type: NodeType;
            connected: Set<string>;
            texture: string;
            visible: boolean;
        }
    }

    static override defineSchema(): foundry.data.fields.DataSchema {
        const fields = foundry.data.fields;
        return {
            ...super.defineSchema(),

            prerequisites: new fields.ArrayField(new fields.StringField()),
            cost: new fields.NumberField({ required: true, initial: 1 }),

            node: new fields.SchemaField({
                angle: new fields.AngleField({ required: true, initial: 0 }),
                distance: new fields.NumberField({ required: true, initial: 100, validate: (d) => d as number >= 0 }),
                type: new fields.StringField({ choices: NODE_TYPES, required: true, initial: NODE_TYPES.at(0) }),
                connected: new fields.SetField(new fields.StringField(), { validate: (d ) => {
                    return Array.from(d as string[]).every((slug) => sluggify(slug) == slug);
                }, validationError: "Invalid slug in connection set."}),
                texture: new fields.FilePathField({ required: true, categories: ["IMAGE"], initial: "/systems/ptr2e/img/icons/feat_icon.webp" }),
                visible: new fields.BooleanField({ required: true, initial: true }),
            }),
        };
    }

    override async _preCreate(data: this["parent"]["_source"], options: DocumentModificationContext<this["parent"]["parent"]>, user: User): Promise<boolean | void> {
        const result = await super._preCreate(data, options, user);
        if (result === false) return false;

        if(!data.img || data.img === "icons/svg/item-bag.svg") {
            this.parent.updateSource({
                img: "/systems/ptr2e/img/icons/feat_icon.webp"
            })
        }
    }
}

export type { NodeType }