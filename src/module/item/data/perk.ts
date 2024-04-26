import { PerkPTR2e } from "@item";
import { HasTraits, HasActions, HasSlug, HasDescription, HasEmbed } from "@module/data/index.ts";
import { BaseItemSourcePTR2e, ItemSystemSource } from "./system.ts";
import { PerkNodeConfig } from "@module/canvas/perk-tree/perk-node.ts";
import { SlugField } from "@module/data/fields/slug-field.ts";

const PerkExtension = HasEmbed(
    HasTraits(HasDescription(HasSlug(HasActions(foundry.abstract.TypeDataModel)))),
    "perk"
);

/**
 * @category Item Data Models
 */
export default abstract class PerkSystem extends PerkExtension {
    /**
     * @internal
     */
    declare parent: PerkPTR2e;

    declare _source: InstanceType<typeof PerkExtension>[`_source`] & SourceFromSchema<PerkSchema>;

    static override defineSchema(): PerkSchema {
        const fields = foundry.data.fields;
        return {
            ...super.defineSchema(),

            prerequisites: new fields.ArrayField(new fields.StringField()),
            cost: new fields.NumberField({ required: true, initial: 1 }),

            node: new fields.SchemaField({
                i: new fields.NumberField({ required: true, nullable: true, initial: null }),
                j: new fields.NumberField({ required: true, nullable: true, initial: null }),
                connected: new fields.SetField<SlugField<true, boolean, boolean>, (string|null)[], Set<string | null>, true>(new SlugField(), { required: true, initial: [] }),
                config: new fields.SchemaField({
                    alpha: new fields.NumberField({ required: false, min: 0, max: 1}),
                    backgroundColor: new fields.ColorField({ required: false}),
                    borderColor: new fields.ColorField({ required: false}),
                    borderWidth: new fields.NumberField({ required: false, min: 0}),
                    texture: new fields.FilePathField({categories: ["IMAGE"], required: false}),
                    tint: new fields.ColorField({ required: false}),
                    scale: new fields.NumberField({ required: false, min: 0.5, max: 2}),
                }, {required: false})
            }),
        };
    }

    override prepareBaseData() {
        super.prepareBaseData();

        if(this.node.config) {
            if(this.node.config.backgroundColor) this.node.config.backgroundColor = Color.fromString(this._source.node.config.backgroundColor);
            if(this.node.config.borderColor) this.node.config.borderColor = Color.fromString(this._source.node.config.borderColor);
            if(this.node.config.tint) this.node.config.tint = Color.fromString(this._source.node.config.tint);
            for(const key of Object.keys(this.node.config)) {
                if(this.node.config[key as keyof typeof this.node.config] === null) delete this.node.config[key as keyof typeof this.node.config];
            }
        }
    }

    override async _preCreate(
        data: this["parent"]["_source"],
        options: DocumentModificationContext<this["parent"]["parent"]>,
        user: User
    ): Promise<boolean | void> {
        const result = await super._preCreate(data, options, user);
        if (result === false) return false;

        if (!data.img || data.img === "icons/svg/item-bag.svg") {
            this.parent.updateSource({
                img: "/systems/ptr2e/img/icons/feat_icon.webp",
            });
        }
    }

    override _onCreate(data: object, options: object, userId: string): void {
        super._onCreate(data, options, userId);
    
        if(game.ptr.perks.initialized) {
            game.ptr.perks.perks.set(this.slug, this.parent);
            if(game.ptr.web.actor) game.ptr.web.refresh({nodeRefresh: true})
        }
    }
}

export default interface PerkSystem extends ModelPropsFromSchema<PerkSchema> {
}

type PerkSchema = {
    prerequisites: foundry.data.fields.ArrayField<foundry.data.fields.StringField, string[], string[], true, false, true>;
    cost: foundry.data.fields.NumberField<number, number, true, false, true>;

    node: foundry.data.fields.SchemaField<{
        i: foundry.data.fields.NumberField<number, number, true, true, true>;
        j: foundry.data.fields.NumberField<number, number, true, true, true>;
        connected: foundry.data.fields.SetField<SlugField<true, boolean, boolean>, (string|null)[], Set<string | null>, true>;
        config: foundry.data.fields.SchemaField<{
            alpha: foundry.data.fields.NumberField<number, number, false, false, false>;
            backgroundColor: foundry.data.fields.ColorField<false, false, false>;
            borderColor: foundry.data.fields.ColorField<false, false, false>;
            borderWidth: foundry.data.fields.NumberField<number, number, false, false, false>;
            texture: foundry.data.fields.FilePathField<ImageFilePath, ImageFilePath, false, false, false>;
            tint: foundry.data.fields.ColorField<false, false, false>;
            scale: foundry.data.fields.NumberField<number, number, false, false, false>;
        }, {
            alpha: number;
            backgroundColor: HexColorString;
            borderColor: HexColorString;
            borderWidth: number;
            texture: ImageFilePath;
            tint: HexColorString;
            scale: number;
        }, {
            alpha: number;
            backgroundColor: number;
            borderColor: number;
            borderWidth: number;
            texture: string;
            tint: number;
            scale: number;
        }, false, false, true>;
    }, {
        i: number | null;
        j: number | null;
        connected: string[];
        config: {
            alpha: number;
            backgroundColor: HexColorString;
            borderColor: HexColorString;
            borderWidth: number;
            texture: ImageFilePath;
            tint: HexColorString;
            scale: number;
        }
    }, {
        i: number | null;
        j: number | null;
        connected: Set<string>;
        config: Partial<PerkNodeConfig> | undefined;
    }>;
}

export type PerkSource = BaseItemSourcePTR2e<"perk", PerkSystemSource>;

interface PerkSystemSource extends Omit<ItemSystemSource, "container"> {
    prerequisites: string[];
    cost: number;

    node: {
        i: number;
        j: number;
        connected: Set<string>;
        config: Partial<PerkNodeConfig> | undefined;
    };
}
