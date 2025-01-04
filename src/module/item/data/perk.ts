import { HasTraits, HasActions, HasSlug, HasDescription, HasEmbed, HasMigrations } from "@module/data/index.ts";
import { SlugField } from "@module/data/fields/slug-field.ts";
import { type SlugSchema } from "@module/data/mixins/has-slug.ts";
import { type ActionsSchema } from "@module/data/mixins/has-actions.ts";
import { type DescriptionSchema } from "@module/data/mixins/has-description.ts";
import { type MigrationSchema } from "@module/data/mixins/has-migrations.ts";
import { type TraitsSchema } from "@module/data/mixins/has-traits.ts";
import { PredicateField } from "@system/predication/schema-data-fields.ts";
import { Predicate, type PredicateStatement, StatementValidator } from "@system/predication/predication.ts";

const perkSchema = {
  prerequisites: new PredicateField({ label: "PTR2E.FIELDS.prerequisites.label", hint: "PTR2E.FIELDS.prerequisites.hint" }),
  autoUnlock: new PredicateField({ label: "PTR2E.FIELDS.autoUnlock.label", hint: "PTR2E.FIELDS.autoUnlock.hint" }),
  cost: new foundry.data.fields.NumberField({ required: true, nullable: false, initial: 1, label: "PTR2E.FIELDS.apCost.label", hint: "PTR2E.FIELDS.apCost.hint" }),
  originSlug: new SlugField({ required: true, nullable: true, initial: null }),

  variant: new foundry.data.fields.StringField({
    required: true,
    nullable: true,
    initial: null,
    choices: ["multi", "tiered"].reduce<Record<string, string>>((acc, variant) => ({ ...acc, [variant]: `PTR2E.FIELDS.perk.variant.${variant}` }), { '': '' }),
    label: "PTR2E.FIELDS.perk.variant.label",
    hint: "PTR2E.FIELDS.perk.variant.hint"
  }),
  mode: new foundry.data.fields.StringField({
    required: true,
    nullable: true,
    initial: null,
    choices: ["shared", "individual", "replace", "coexist"].reduce<Record<string, string>>((acc, mode) => ({ ...acc, [mode]: `PTR2E.FIELDS.perk.mode.${mode}` }), { '': '' }),
    label: "PTR2E.FIELDS.perk.mode.label",
    hint: "PTR2E.FIELDS.perk.mode.hint"
  }),

  global: new foundry.data.fields.BooleanField({ required: true, initial: true, label: "PTR2E.FIELDS.perk.global.label", hint: "PTR2E.FIELDS.perk.global.hint" }),
  webs: new foundry.data.fields.SetField(new foundry.data.fields.DocumentUUIDField({ type: "Item" }), { required: true, initial: [], label: "PTR2E.FIELDS.perk.webs.label", hint: "PTR2E.FIELDS.perk.webs.hint" }),

  nodes: new foundry.data.fields.ArrayField(
    new foundry.data.fields.SchemaField({
      x: new foundry.data.fields.NumberField({ required: true, nullable: true, initial: null, label: "PTR2E.FIELDS.node.x.label", hint: "PTR2E.FIELDS.node.x.hint" }),
      y: new foundry.data.fields.NumberField({ required: true, nullable: true, initial: null, label: "PTR2E.FIELDS.node.y.label", hint: "PTR2E.FIELDS.node.y.hint" }),
      connected: new foundry.data.fields.SetField(new SlugField(), { required: true, initial: [], label: "PTR2E.FIELDS.node.connected.label", hint: "PTR2E.FIELDS.node.connected.hint" }),
      config: new foundry.data.fields.SchemaField(
        {
          alpha: new foundry.data.fields.NumberField({ required: false, min: 0, max: 1, label: "PTR2E.FIELDS.node.config.alpha.label", hint: "PTR2E.FIELDS.node.config.alpha.hint" }),
          backgroundColor: new foundry.data.fields.ColorField({ required: false, label: "PTR2E.FIELDS.node.config.backgroundColor.label", hint: "PTR2E.FIELDS.node.config.backgroundColor.hint" }),
          borderColor: new foundry.data.fields.ColorField({ required: false, label: "PTR2E.FIELDS.node.config.borderColor.label", hint: "PTR2E.FIELDS.node.config.borderColor.hint" }),
          borderWidth: new foundry.data.fields.NumberField({ required: false, min: 0, label: "PTR2E.FIELDS.node.config.borderWidth.label", hint: "PTR2E.FIELDS.node.config.borderWidth.hint" }),
          texture: new foundry.data.fields.FilePathField({
            categories: ["IMAGE"],
            required: false,
            label: "PTR2E.FIELDS.node.config.texture.label",
            hint: "PTR2E.FIELDS.node.config.texture.hint",
          }),
          tint: new foundry.data.fields.ColorField({ required: false, label: "PTR2E.FIELDS.node.config.tint.label", hint: "PTR2E.FIELDS.node.config.tint.hint" }),
          scale: new foundry.data.fields.NumberField({ required: false, min: 0.5, max: 1.6, label: "PTR2E.FIELDS.node.config.scale.label", hint: "PTR2E.FIELDS.node.config.scale.hint" }),
        },
        { required: false }
      ),
      hidden: new foundry.data.fields.BooleanField({ required: true, initial: false, label: "PTR2E.FIELDS.node.hidden.label", hint: "PTR2E.FIELDS.node.hidden.hint" }),
      type: new foundry.data.fields.StringField({ required: true, choices: ["normal", "root", "entry"].reduce<Record<string, string>>((acc, type) => ({ ...acc, [type]: type }), {}), initial: "normal", label: "PTR2E.FIELDS.node.type.label", hint: "PTR2E.FIELDS.node.type.hint" }),
      tier: new foundry.data.fields.SchemaField({
        rank: new foundry.data.fields.NumberField({ required: true, nullable: false, initial: 1, min: 1, label: "PTR2E.FIELDS.node.tier.rank.label", hint: "PTR2E.FIELDS.node.tier.rank.hint" }),
        uuid: new foundry.data.fields.DocumentUUIDField({ required: true, label: "PTR2E.FIELDS.node.tier.uuid.label", hint: "PTR2E.FIELDS.node.tier.uuid.hint", type: "Item" }),
      }, {
        required: true,
        nullable: true,
        initial: null,
      }),
    }),
    {
      label: "PTR2E.FIELDS.nodes.label",
      hint: "PTR2E.FIELDS.nodes.hint",
      required: true,
      initial: [],
    }
  )
}

export type PerkSchema = typeof perkSchema & TraitsSchema & MigrationSchema & DescriptionSchema & SlugSchema & ActionsSchema;

/**
 * @category Item Data Models
 */
export default abstract class PerkSystem extends HasEmbed(
  HasTraits(HasMigrations(HasDescription(HasSlug(HasActions(foundry.abstract.TypeDataModel))))),
  "perk"
)<PerkSchema, Item.ConfiguredInstance> {
  static override defineSchema(): PerkSchema {
    return {
      ...super.defineSchema() as TraitsSchema & MigrationSchema & DescriptionSchema & SlugSchema & ActionsSchema,
      ...perkSchema,
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

  getPredicateStrings(): string[] {
    function handlePredicate(predicate: PredicateStatement | PredicateStatement[] | Predicate | number): string | string[] {
      if (predicate instanceof Predicate) {
        return Array.from(predicate.flatMap(handlePredicate));
      }

      // Handle roll-option array
      if (Array.isArray(predicate)) {
        return Array.from(new Set(predicate.flatMap(handlePredicate)));
      }

      // Handle string
      if (typeof predicate === "string") {
        const number = Number(predicate);
        if (!isNaN(number)) {
          return handlePredicate(number);
        }

        if (predicate.trim().startsWith("#")) {
          return `${predicate.replace("#", "")} (Not Automated)`;
        }

        const itemRollOption = predicate.trim().match(/^(item):(?<type>[-a-z]+):(?<slug>[-a-z0-9]+)$/);
        if (itemRollOption) {
          return `${Handlebars.helpers.formatSlug(itemRollOption.groups?.slug)} (${Handlebars.helpers.formatSlug(itemRollOption.groups?.type)})`;
        }

        const traitRollOption = predicate.trim().match(/^(trait):(?<slug>[-a-z0-9]+)$/);
        if (traitRollOption) {
          return `[${Handlebars.helpers.formatSlug(traitRollOption.groups?.slug)}]`;
        }

        const injected = predicate.trim().match(/^{(?<type>actor|item|effect|change)\|(?<path>[\w.-]+)}$/);
        if (injected) {
          const path = injected.groups?.path;
          if (!path) return predicate.toString();

          if (path.startsWith("skills.") && path.endsWith(".mod")) {
            return `${Handlebars.helpers.formatSlug(path.slice(7, -4))}`;
          }
          switch (path) {
            case "level":
            case "system.advancement.level":
              return "Level";
          }

          return `'${path}'`;
        }

        return predicate.toString();
      }

      if (typeof predicate === "number") {
        return predicate.toString();
      }

      // Handle object
      if (predicate && typeof predicate === "object" && Object.keys(predicate).length > 0) {
        const statement = predicate as object
        if (StatementValidator.isBinaryOp(statement)) {
          if ('eq' in statement) {
            //@ts-expect-error - Could be attempting to evaluate truthy value
            if (statement.eq[1] == true) {
              return handlePredicate(statement.eq[0]);
            }
            //@ts-expect-error - Could be attempting to evaluate falsey value
            if (statement.eq[1] == false) {
              return `Not: ${handlePredicate(statement.eq[0])}`;
            }
            return `${handlePredicate(statement.eq[0])} == ${handlePredicate(statement.eq[1])}`;
          }
          if ('gt' in statement) {
            return `${handlePredicate(statement.gt[0])} > ${handlePredicate(statement.gt[1])}`;
          }
          if ('gte' in statement) {
            return `${handlePredicate(statement.gte[0])} >= ${handlePredicate(statement.gte[1])}`;
          }
          if ('lt' in statement) {
            return `${handlePredicate(statement.lt[0])} < ${handlePredicate(statement.lt[1])}`;
          }
          if ('lte' in statement) {
            return `${handlePredicate(statement.lte[0])} <= ${handlePredicate(statement.lte[1])}`;
          }
        }
        if (StatementValidator.isAnd(statement)) {
          const and = handlePredicate(statement.and);
          if (Array.isArray(and) && and.length === 1) {
            return and[0];
          }

          return `All of: ${Array.isArray(and) ? `<ul><li>${and.join('</li><li>')}</li></ul>` : and}`;
        }
        if (StatementValidator.isOr(statement)) {
          const or = handlePredicate(statement.or);
          if (Array.isArray(or) && or.length === 1) {
            return or[0];
          }
          return `One of: ${Array.isArray(or) ? `<ul><li>${or.join('</li><li>')}</li></ul>` : or}`;
        }
        if (StatementValidator.isNand(statement)) {
          const nand = handlePredicate(statement.nand);
          if (Array.isArray(nand) && nand.length === 1) {
            return `Not: ${nand[0]}`;
          }
          return `None of: ${Array.isArray(nand) ? `<ul><li>${nand.join('</li><li>')}</li></ul>` : nand}`;
        }
        if (StatementValidator.isXor(statement)) {
          const xor = handlePredicate(statement.xor);
          if (Array.isArray(xor) && xor.length === 1) {
            return xor[0];
          }
          return `Exactly one of: ${Array.isArray(xor) ? `<ul><li>${xor.join('</li><li>')}</li></ul>` : xor}`;
        }
        if (StatementValidator.isNor(statement)) {
          const nor = handlePredicate(statement.nor);
          if (Array.isArray(nor) && nor.length === 1) {
            return `Not: ${nor[0]}`;
          }
          return `Not all of: ${Array.isArray(nor) ? `<ul><li>${nor.join('</li><li>')}</li></ul>` : nor}`;
        }
        if (StatementValidator.isNot(statement)) {
          return `Not: ${handlePredicate(statement.not)}`;
        }
        if (StatementValidator.isIf(statement)) {
          return `If: ${handlePredicate(statement.if)} then ${handlePredicate(statement.then)}`;
        }
        if (StatementValidator.isXOf(statement)) {
          if (statement.x === 1) return handlePredicate(statement.xof);
          const xof = handlePredicate(statement.xof);
          return `${statement.x} of: ${Array.isArray(xof) ? `<ul><li>${xof.join('</li><li>')}</li></ul>` : xof}`;
        }
      }

      return predicate.toString();
    }

    return new Predicate(this._source.prerequisites).flatMap(handlePredicate);
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

  override async _preUpdate(
    changed: foundry.abstract.TypeDataModel.ParentAssignmentType<PerkSchema, Item.ConfiguredInstance>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: foundry.abstract.Document.PreUpdateOptions<any>,
    user: string
  ): Promise<boolean | void> {
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
          for (const node of changed.system.nodes) {
            //@ts-expect-error - This is a nullable field.
            node.tier = null;
          }
        }
      }
    }

    return super._preUpdate(changed, options, user);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async _preCreate(data: foundry.abstract.TypeDataModel.ParentAssignmentType<PerkSchema, Item.ConfiguredInstance>, options: foundry.abstract.Document.PreCreateOptions<any>, user: User): Promise<boolean | void> {
    const result = await super._preCreate(data, options, user);
    if (result === false) return false;

    if (!data.img || data.img === "icons/svg/item-bag.svg") {
      this.parent.updateSource({
        img: "systems/ptr2e/img/icons/feat_icon.webp",
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override _onCreate(data: foundry.abstract.TypeDataModel.ParentAssignmentType<PerkSchema, Item.ConfiguredInstance>, options: foundry.abstract.Document.OnCreateOptions<any>, userId: string): void {
    super._onCreate(data, options, userId);

    if (game.ptr.perks.initialized && !this.parent.actor) {
      game.ptr.perks.perks.set(this.slug, this.parent);
    }
  }

  static override migrateData(source: foundry.data.fields.SchemaField.InnerPersistedType<PerkSchema> & { node?: foundry.data.fields.SchemaField.InnerPersistedType<PerkSchema>['nodes'][number] }) {
    // Migrate node data to new format
    if (source.node && !source.nodes?.length) {
      source.nodes = [source.node];
    }

    //@ts-expect-error - FIXME: This is a nullable field.
    source.nodes[0].tier = null

    return super.migrateData(source);
  }
}