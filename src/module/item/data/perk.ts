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

      variant: new fields.StringField({
        required: true,
        nullable: true,
        initial: null,
        choices: ["multi", "tiered"].reduce<Record<string, string>>((acc, variant) => ({ ...acc, [variant]: `PTR2E.FIELDS.perk.variant.${variant}` }), { '': '' }),
        label: "PTR2E.FIELDS.perk.variant.label",
        hint: "PTR2E.FIELDS.perk.variant.hint"
      }) as PerkSchema["variant"],
      mode: new fields.StringField({
        required: true,
        nullable: true,
        initial: null,
        choices: ["shared", "individual", "replace", "coexist"].reduce<Record<string, string>>((acc, mode) => ({ ...acc, [mode]: `PTR2E.FIELDS.perk.mode.${mode}` }), { '': '' }),
        label: "PTR2E.FIELDS.perk.mode.label",
        hint: "PTR2E.FIELDS.perk.mode.hint"
      }) as PerkSchema["mode"],

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
          type: new fields.StringField({ required: true, choices: ["normal", "root", "entry"].reduce<Record<string, string>>((acc, type) => ({ ...acc, [type]: type }), {}), initial: "normal", label: "PTR2E.FIELDS.node.type.label", hint: "PTR2E.FIELDS.node.type.hint" }),
          tier: new fields.SchemaField({
            rank: new fields.NumberField({ required: true, initial: 1, min: 1, label: "PTR2E.FIELDS.node.tier.rank.label", hint: "PTR2E.FIELDS.node.tier.rank.hint" }),
            uuid: new fields.DocumentUUIDField({ required: true, label: "PTR2E.FIELDS.node.tier.uuid.label", hint: "PTR2E.FIELDS.node.tier.uuid.hint", type: "Item" }),
          }, {
            required: true,
            nullable: true,
            initial: null,
          })
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

  get primaryNode() {
    return this.nodes.length ? this.nodes[0] : null;
  }

  static override validateJoint(data: PerkSystem["_source"]) {
    switch (data.variant) {
      case "multi": {
        if (!["shared", "individual"].includes(data.mode!)) {
          throw new Error(`Invalid mode for perk variant ${data.variant}: ${data.mode}. Must be "shared" or "individual".`);
        }
        break;
      }
      case "tiered": {
        if (!["replace", "coexist"].includes(data.mode!)) {
          throw new Error(`Invalid mode for perk variant ${data.variant}: ${data.mode}. Must be "replace" or "coexist".`);
        }
        break;
      }
      default: {
        if (data.mode) {
          throw new Error(`Invalid mode for perk variant ${data.variant}: ${data.mode}. Must be null.`);
        }
        break;
      }
    }
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

  override _preUpdate(
    changed: DeepPartial<this["parent"]["_source"]>,
    options: DocumentUpdateContext<this["parent"]["parent"]>,
    user: User
  ) {
    if (changed.system?.variant !== undefined) {
      switch (changed.system.variant) {
        case "multi": {
          if (!["shared", "individual"].includes(changed.system.mode as string)) changed.system.mode = "shared";
          break;
        }
        case "tiered": {
          if (!["replace", "coexist"].includes(changed.system.mode as string)) changed.system.mode = "replace";
          break;
        }
        default: {
          changed.system.mode = null;
          break;
        }
      }
      if (changed.system.variant !== "tiered") {
        if (changed.system.nodes?.length) {
          for (const node of changed.system.nodes as unknown as SourceFromSchema<NodeSchema>[]) {
            node.tier = null;
          }
        }
      }
    }

    return super._preUpdate(changed, options, user);
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
  variant: foundry.data.fields.StringField<"multi" | "tiered", "multi" | "tiered", true, true, true>;
  mode: foundry.data.fields.StringField<"shared" | "individual" | "replace" | "coexist", "shared" | "individual" | "replace" | "coexist", true, true, true>;
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
  tier: foundry.data.fields.SchemaField<
    NodeTierSchema,
    SourceFromSchema<NodeTierSchema>,
    ModelPropsFromSchema<NodeTierSchema>,
    true,
    true,
    true
  >
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

interface NodeTierSchema extends foundry.data.fields.DataSchema {
  rank: foundry.data.fields.NumberField<number, number, true, false, true>;
  uuid: foundry.data.fields.DocumentUUIDField<string, true, false, true>;
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
