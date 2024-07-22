import { PerkPTR2e } from "@item";
import { HasTraits, HasActions, HasSlug, HasDescription, HasEmbed, HasMigrations } from "@module/data/index.ts";
import { BaseItemSourcePTR2e, ItemSystemSource } from "./system.ts";
import { PerkNodeConfig } from "@module/canvas/perk-tree/perk-node.ts";
import { SlugField } from "@module/data/fields/slug-field.ts";
import { SetField } from "@module/data/fields/set-field.ts";

const PerkExtension = HasEmbed(
    HasTraits(HasMigrations(HasDescription(HasSlug(HasActions(foundry.abstract.TypeDataModel))))),
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

            prerequisites: new SetField(new fields.StringField(), {label: "PTR2E.FIELDS.prerequisites.label", hint: "PTR2E.FIELDS.prerequisites.hint"}),
            cost: new fields.NumberField({ required: true, initial: 1, label: "PTR2E.FIELDS.apCost.label", hint: "PTR2E.FIELDS.apCost.hint"}),
            originSlug: new SlugField({required: true, nullable: true, initial: null}),
            
            design: new fields.SchemaField({
                arena: new fields.StringField({required: true, nullable: true, initial: null, choices: ["physical", "mental", "social"].reduce<Record<string,string>>((acc, arena) => ({...acc, [arena]: arena}), {}), label: "PTR2E.FIELDS.design.arena.label", hint: "PTR2E.FIELDS.design.arena.hint"}),
                approach: new fields.StringField({required: true, nullable: true, initial: null, choices: ["power", "finesse", "resilience"].reduce<Record<string,string>>((acc, approach) => ({...acc, [approach]: approach}), {}), label: "PTR2E.FIELDS.design.approach.label", hint: "PTR2E.FIELDS.design.approach.hint"}),
                archetype: new fields.StringField({required: true, nullable: true, initial: null, label: "PTR2E.FIELDS.design.archetype.label", hint: "PTR2E.FIELDS.design.archetype.hint"}),
            }),

            node: new fields.SchemaField({
                i: new fields.NumberField({ required: true, nullable: true, initial: null, label: "PTR2E.FIELDS.node.i.label", hint: "PTR2E.FIELDS.node.i.hint"}),
                j: new fields.NumberField({ required: true, nullable: true, initial: null, label: "PTR2E.FIELDS.node.j.label", hint: "PTR2E.FIELDS.node.j.hint"}),
                connected: new fields.SetField<SlugField<true, boolean, boolean>,(string)[],Set<string | null>,true>(new SlugField(), { required: true, initial: [], label: "PTR2E.FIELDS.node.connected.label", hint: "PTR2E.FIELDS.node.connected.hint" }),
                config: new fields.SchemaField(
                    {
                        alpha: new fields.NumberField({ required: false, min: 0, max: 1, label: "PTR2E.FIELDS.node.config.alpha.label", hint: "PTR2E.FIELDS.node.config.alpha.hint" }),
                        backgroundColor: new fields.ColorField({ required: false, label: "PTR2E.FIELDS.node.config.backgroundColor.label", hint: "PTR2E.FIELDS.node.config.backgroundColor.hint" }),
                        borderColor: new fields.ColorField({ required: false, label: "PTR2E.FIELDS.node.config.borderColor.label", hint: "PTR2E.FIELDS.node.config.borderColor.hint" }),
                        borderWidth: new fields.NumberField({ required: false, min: 0, label: "PTR2E.FIELDS.node.config.borderWidth.label", hint: "PTR2E.FIELDS.node.config.borderWidth.hint" }),
                        texture: new fields.FilePathField({
                            categories: ["IMAGE"],
                            required: false,
                            label: "PTR2E.FIELDS.node.config.texture.label",
                            hint: "PTR2E.FIELDS.node.config.texture.hint",
                        }),
                        tint: new fields.ColorField({ required: false, label: "PTR2E.FIELDS.node.config.tint.label", hint: "PTR2E.FIELDS.node.config.tint.hint" }),
                        scale: new fields.NumberField({ required: false, min: 0.5, max: 1.6, label: "PTR2E.FIELDS.node.config.scale.label", hint: "PTR2E.FIELDS.node.config.scale.hint" }),
                    },
                    { required: false }
                ),
                hidden: new fields.BooleanField({ required: true, initial: false, label: "PTR2E.FIELDS.node.hidden.label", hint: "PTR2E.FIELDS.node.hidden.hint" }),
                type: new fields.StringField({ required: true, choices: ["normal", "root", "ranked"].reduce<Record<string,string>>((acc, type) => ({...acc, [type]: type}), {}), initial: "normal" })
            }),
        };
    }

    override prepareBaseData() {
        super.prepareBaseData();

        if (this.node.config) {
            if (this.node.config.backgroundColor)
                this.node.config.backgroundColor = Color.fromString(
                    this._source.node.config.backgroundColor
                );
            if (this.node.config.borderColor)
                this.node.config.borderColor = Color.fromString(
                    this._source.node.config.borderColor
                );
            if (this.node.config.tint)
                this.node.config.tint = Color.fromString(this._source.node.config.tint);
            for (const key of Object.keys(this.node.config)) {
                if (this.node.config[key as keyof typeof this.node.config] === null)
                    delete this.node.config[key as keyof typeof this.node.config];
            }
        }

        switch(this.node.type) {
            case "root": {
                //this.node.hidden = false; TODO: Discuss need of this?
                this.node.config = fu.mergeObject(this.node.config ?? {}, {
                    borderWidth: 3,
                    scale: 1.6,
                })
                break;
            }
            case "ranked": {
                break;
            }
        }
    }

    override prepareDerivedData(): void {
        super.prepareDerivedData();

        if(this.parent.actor) {
            this.parent.actor.system.advancement.advancementPoints.spent += this.cost;
        }
    }

    get visible() {
        if(game.user.isGM) {
            return this.hidden
                ? game.ptr.web.editMode || false //TODO: Replace false with the toggle for hidden nodes in the UI
                    ? true
                    : false
                : true;
        }

        // if(!this.parent.visible) return false;

        return !this.hidden;
    }

    get hidden() {
        return this.node.hidden;
    }

    override async _preUpdate(changed: DeepPartial<this["parent"]["_source"]>, options: DocumentUpdateContext<this["parent"]["parent"]>, user: User): Promise<boolean | void> {
        if(this.node.type === "root") {
            const node = changed?.system?.node;
            if(!node) return super._preUpdate(changed, options, user);

            if((node.i || node.j || node.hidden) && (!node.type || node.type === "root")) {
                ui.notifications.error("Root nodes cannot be moved or hidden");
                return false;
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

        if (game.ptr.perks.initialized && !this.parent.actor) {
            game.ptr.perks.perks.set(this.slug, this.parent);
            if (game.ptr.web.actor) game.ptr.web.refresh({ nodeRefresh: true });
        }
    }
}

export default interface PerkSystem extends ModelPropsFromSchema<PerkSchema> {}

type PerkSchema = {
    prerequisites: foundry.data.fields.SetField<
        foundry.data.fields.StringField,
        string[],
        Set<string>,
        true,
        false,
        true
    >;
    cost: foundry.data.fields.NumberField<number, number, true, false, true>;
    originSlug: SlugField<true, true, true>;
    design: foundry.data.fields.SchemaField<
        {
            arena: foundry.data.fields.StringField<string, string, true, true, true>;
            approach: foundry.data.fields.StringField<string, string, true, true, true>;
            archetype: foundry.data.fields.StringField<string, string, true, true, true>;
        },
        {
            arena: string | null;
            approach: string | null;
            archetype: string | null;
        },
        {
            arena: string | null;
            approach: string | null;
            archetype: string | null;
        },
        true,
        false,
        true
    >;
    node: foundry.data.fields.SchemaField<
        {
            i: foundry.data.fields.NumberField<number, number, true, true, true>;
            j: foundry.data.fields.NumberField<number, number, true, true, true>;
            connected: foundry.data.fields.SetField<
                SlugField<true, boolean, boolean>,
                (string | null)[],
                Set<string | null>,
                true
            >;
            config: foundry.data.fields.SchemaField<
                {
                    alpha: foundry.data.fields.NumberField<number, number, false, false, false>;
                    backgroundColor: foundry.data.fields.ColorField<false, false, false>;
                    borderColor: foundry.data.fields.ColorField<false, false, false>;
                    borderWidth: foundry.data.fields.NumberField<
                        number,
                        number,
                        false,
                        false,
                        false
                    >;
                    texture: foundry.data.fields.FilePathField<
                        ImageFilePath,
                        ImageFilePath,
                        false,
                        false,
                        false
                    >;
                    tint: foundry.data.fields.ColorField<false, false, false>;
                    scale: foundry.data.fields.NumberField<number, number, false, false, false>;
                },
                {
                    alpha: number;
                    backgroundColor: HexColorString;
                    borderColor: HexColorString;
                    borderWidth: number;
                    texture: ImageFilePath;
                    tint: HexColorString;
                    scale: number;
                },
                {
                    alpha: number;
                    backgroundColor: number;
                    borderColor: number;
                    borderWidth: number;
                    texture: string;
                    tint: number;
                    scale: number;
                },
                false,
                false,
                true
            >;
            hidden: foundry.data.fields.BooleanField<boolean, boolean, true, false, true>;
            type: foundry.data.fields.StringField<"normal" | "root" | "ranked", "normal", true, false, true>;
        },
        {
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
            };
            hidden: boolean;
            type: "normal" | "root" | "ranked";
        },
        {
            i: number | null;
            j: number | null;
            connected: Set<string>;
            config: Partial<PerkNodeConfig> | undefined;
            hidden: boolean;
            type: "normal" | "root" | "ranked";
        }
    >;
};

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
