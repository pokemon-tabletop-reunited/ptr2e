import { PerkPTR2e } from "@item";
import { HasTraits, HasActions, HasSlug, HasDescription, HasEmbed, HasMigrations } from "@module/data/index.ts";
import { BaseItemSourcePTR2e, ItemSystemSource } from "./system.ts";
import { SlugField } from "@module/data/fields/slug-field.ts";
import { SetField } from "@module/data/fields/set-field.ts";
import { SlugSchema } from "@module/data/mixins/has-slug.ts";
import ActionPTR2e from "@module/data/models/action.ts";
import { ActionsSchema } from "@module/data/mixins/has-actions.ts";
import { DescriptionSchema } from "@module/data/mixins/has-description.ts";
import { MigrationSchema } from "@module/data/mixins/has-migrations.ts";
import { TraitsSchema } from "@module/data/mixins/has-traits.ts";

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

  static override defineSchema(): PerkSchema {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema() as PerkSystemSchemaExtension,

      prerequisites: new SetField(new fields.StringField(), { label: "PTR2E.FIELDS.prerequisites.label", hint: "PTR2E.FIELDS.prerequisites.hint" }),
      cost: new fields.NumberField({ required: true, initial: 1, label: "PTR2E.FIELDS.apCost.label", hint: "PTR2E.FIELDS.apCost.hint" }),
      originSlug: new SlugField({ required: true, nullable: true, initial: null }),

      design: new fields.SchemaField({
        arena: new fields.StringField({ required: true, nullable: true, initial: null, choices: ["physical", "mental", "social"].reduce<Record<string, string>>((acc, arena) => ({ ...acc, [arena]: arena }), {}), label: "PTR2E.FIELDS.design.arena.label", hint: "PTR2E.FIELDS.design.arena.hint" }),
        approach: new fields.StringField({ required: true, nullable: true, initial: null, choices: ["power", "finesse", "resilience"].reduce<Record<string, string>>((acc, approach) => ({ ...acc, [approach]: approach }), {}), label: "PTR2E.FIELDS.design.approach.label", hint: "PTR2E.FIELDS.design.approach.hint" }),
        archetype: new fields.StringField({ required: true, nullable: true, initial: null, label: "PTR2E.FIELDS.design.archetype.label", hint: "PTR2E.FIELDS.design.archetype.hint" }),
      }),

      nodes: new fields.ArrayField(
        new fields.SchemaField({
          x: new fields.NumberField({ required: true, nullable: true, initial: null, label: "PTR2E.FIELDS.node.x.label", hint: "PTR2E.FIELDS.node.x.hint" }),
          y: new fields.NumberField({ required: true, nullable: true, initial: null, label: "PTR2E.FIELDS.node.y.label", hint: "PTR2E.FIELDS.node.y.hint" }),
          connected: new fields.SetField(new SlugField(), { required: true, initial: [], label: "PTR2E.FIELDS.node.connected.label", hint: "PTR2E.FIELDS.node.connected.hint" }),
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
          type: new fields.StringField({ required: true, choices: ["normal", "root", "entry"].reduce<Record<string, string>>((acc, type) => ({ ...acc, [type]: type }), {}), initial: "normal", label: "PTR2E.FIELDS.node.type.label", hint: "PTR2E.FIELDS.node.type.hint" })
        }),
        {
          label: "PTR2E.FIELDS.nodes.label",
          hint: "PTR2E.FIELDS.nodes.hint",
          required: true,
          initial: [],
        }
      )
    };
  }

  override prepareBaseData() {
    super.prepareBaseData();
  }

  override prepareDerivedData(): void {
    super.prepareDerivedData();

    if (this.parent.actor) {
      this.parent.actor.system.advancement.advancementPoints.spent += this.cost;
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
        img: "systems/ptr2e/img/icons/feat_icon.webp",
      });
    }
  }

  override _onCreate(data: object, options: object, userId: string): void {
    super._onCreate(data, options, userId);

    if (game.ptr.perks.initialized && !this.parent.actor) {
      game.ptr.perks.perks.set(this.slug, this.parent);
    }
  }

  static override migrateData(source: PerkSystem["_source"]) {
    // Migrate node data to new format
    if (source.node && !source.nodes?.length) {
      source.nodes = [source.node as SourceFromSchema<NodeSchema>];
    }

    return super.migrateData(source);
  }
}

export default interface PerkSystem extends ModelPropsFromSchema<PerkSchema> {
  actions: Collection<ActionPTR2e>;

  _source: SourceFromSchema<PerkSchema>;
}

interface PerkSchema extends foundry.data.fields.DataSchema, PerkSystemSchemaExtension {
  prerequisites: foundry.data.fields.SetField<
    foundry.data.fields.StringField,
    string[],
    Set<string>,
    true,
    false,
    true
  >;
  cost: foundry.data.fields.NumberField<number, number, true, false, true>;
  originSlug: SlugField<string, string, true, true, true>;
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
  nodes: foundry.data.fields.ArrayField<
    foundry.data.fields.SchemaField<
      NodeSchema,
      SourceFromSchema<NodeSchema>,
      ModelPropsFromSchema<NodeSchema>
    >,
    SourceFromSchema<NodeSchema>[],
    ModelPropsFromSchema<NodeSchema>[],
    true,
    false,
    true
  >;
};

interface NodeSchema extends foundry.data.fields.DataSchema {
  x: foundry.data.fields.NumberField<number, number, true, true, true>;
  y: foundry.data.fields.NumberField<number, number, true, true, true>;
  connected: foundry.data.fields.SetField<
    SlugField<string, string, true, boolean, boolean>,
    (string)[],
    Set<string>,
    true
  >;
  hidden: foundry.data.fields.BooleanField<boolean, boolean, true, false, true>;
  type: foundry.data.fields.StringField<"normal" | "root" | "entry", "normal" | "root" | "entry", true, false, true>;
  config: foundry.data.fields.SchemaField<
    NodeConfigSchema,
    SourceFromSchema<NodeConfigSchema>,
    ModelPropsFromSchema<NodeConfigSchema>,
    false,
    false,
    true
  >;
}

interface NodeConfigSchema extends foundry.data.fields.DataSchema {
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
}

type PerkSystemSchemaExtension = SlugSchema & ActionsSchema & DescriptionSchema & MigrationSchema & TraitsSchema;

export type PerkSource = BaseItemSourcePTR2e<"perk", PerkSystemSource>;

interface PerkSystemSource extends Omit<ItemSystemSource, "container"> {
  prerequisites: string[];
  cost: number;

  node: {
    y: number;
    x: number;
    connected: Set<string>;
    hidden: boolean;
  };
}
