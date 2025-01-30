import { ActorPTR2e } from "@actor";
import { SlugField } from "../fields/slug-field.ts";
import { PerkPTR2e } from "@item";

export class GeneratorConfig extends foundry.abstract.DataModel {
  static LOCALIZATION_PREFIXES = ["PTR2E.GeneratorConfig"];

  static override defineSchema(): GeneratorConfigSchema {
    return {
      mode: new SlugField<PriorityMode, PriorityMode, true, false>({
        required: true,
        initial: "order",
        choices: {
          order: "PTR2E.GeneratorConfig.FIELDS.mode.order",
          species: "PTR2E.GeneratorConfig.FIELDS.mode.species"
        },
        label: "PTR2E.GeneratorConfig.FIELDS.mode.label",
        hint: "PTR2E.GeneratorConfig.FIELDS.mode.hint"
      }),
      cost: new foundry.data.fields.SchemaField({
        priority: new foundry.data.fields.StringField<PriorityCostPriority, PriorityCostPriority, true>({
          required: true,
          initial: "cheapest",
          choices: {
            cheapest: "PTR2E.GeneratorConfig.FIELDS.cost.priority.cheapest",
            shortest: "PTR2E.GeneratorConfig.FIELDS.cost.priority.shortest",
            random: "PTR2E.GeneratorConfig.FIELDS.cost.priority.random"
          },
          label: "PTR2E.GeneratorConfig.FIELDS.cost.priority.label",
          hint: "PTR2E.GeneratorConfig.FIELDS.cost.priority.hint"
        }),
        resolution: new foundry.data.fields.StringField<PriorityCostResolution, PriorityCostResolution, true>({
          required: true,
          initial: "cheapest",
          choices: {
            cheapest: "PTR2E.GeneratorConfig.FIELDS.cost.resolution.cheapest",
            costliest: "PTR2E.GeneratorConfig.FIELDS.cost.resolution.costliest",
            random: "PTR2E.GeneratorConfig.FIELDS.cost.resolution.random"
          },
          label: "PTR2E.GeneratorConfig.FIELDS.cost.resolution.label",
          hint: "PTR2E.GeneratorConfig.FIELDS.cost.resolution.hint"
        }),
      }),
      entry: new foundry.data.fields.SchemaField({
        mode: new foundry.data.fields.StringField<EntryMode, EntryMode, true>({
          required: true,
          initial: "best",
          choices: {
            best: "PTR2E.GeneratorConfig.FIELDS.entry.mode.best",
            random: "PTR2E.GeneratorConfig.FIELDS.entry.mode.random",
            choice: "PTR2E.GeneratorConfig.FIELDS.entry.mode.choice"
          },
          label: "PTR2E.GeneratorConfig.FIELDS.entry.mode.label",
          hint: "PTR2E.GeneratorConfig.FIELDS.entry.mode.hint"
        }),
        choice: new SlugField({
          required: true, nullable: true, initial: null,
          label: "PTR2E.GeneratorConfig.FIELDS.entry.choice.label",
          hint: "PTR2E.GeneratorConfig.FIELDS.entry.choice.hint"
        }),
      }),
      randomness: new foundry.data.fields.NumberField({
        required: true, initial: 0,
        label: "PTR2E.GeneratorConfig.FIELDS.randomness.label",
        hint: "PTR2E.GeneratorConfig.FIELDS.randomness.hint"
      }),
      priorities: new foundry.data.fields.ArrayField(
        new foundry.data.fields.SchemaField({
          slug: new foundry.data.fields.StringField({ required: true }),
          priority: new foundry.data.fields.NumberField({ required: true }),
          type: new SlugField<PriorityOrderType, PriorityOrderType, true, false>({
            required: true,
            choices: {
              arena: "PTR2E.GeneratorConfig.FIELDS.priorities.type.arena",
              approach: "PTR2E.GeneratorConfig.FIELDS.priorities.type.approach",
              archetype: "PTR2E.GeneratorConfig.FIELDS.priorities.type.archetype",
              trait: "PTR2E.GeneratorConfig.FIELDS.priorities.type.trait",
              perk: "PTR2E.GeneratorConfig.FIELDS.priorities.type.perk"
            },
          }),
        })
      ),
      label: new foundry.data.fields.StringField({
        required: true, initial: "", blank: true,
        label: "PTR2E.GeneratorConfig.FIELDS.label.label",
        hint: "PTR2E.GeneratorConfig.FIELDS.label.hint"
      }),
      link: new foundry.data.fields.BooleanField({ required: true, initial: false }),
      id: new foundry.data.fields.StringField({ required: true, initial: fu.randomID() }),
    }
  }

  async toWorkerObject(actor: ActorPTR2e): Promise<PerkWorkerConfig> {
    return {
      ...super.toObject(),
      priorities: await Promise.all(this.priorities.flatMap(async (p) => {
        if(p.type !== "perk") return p;
        const perk = await fromUuid<PerkPTR2e>(p.slug);
        if(!perk) return [];
        return {
          slug: perk.slug,
          priority: p.priority,
          type: p.type,
        }
      })),
      points: {
        ap: actor.system.advancement.advancementPoints.total,
        rv: actor.system.advancement.rvs.total
      }
    }
  }
}

export type PerkWorkerConfig = GeneratorConfig['_source'] & {
  points: {
    ap: number;
    rv: number;
  }
};

export interface GeneratorConfig extends foundry.abstract.DataModel, ModelPropsFromSchema<GeneratorConfigSchema> {
  _source: SourceFromSchema<GeneratorConfigSchema>;
}

interface GeneratorConfigSchema extends foundry.data.fields.DataSchema {
  mode: SlugField<PriorityMode, PriorityMode, true, false, true>;
  cost: foundry.data.fields.SchemaField<PriorityCostSchema, SourceFromSchema<PriorityCostSchema>, ModelPropsFromSchema<PriorityCostSchema>, true, false, true>;
  entry: foundry.data.fields.SchemaField<EntrySchema, SourceFromSchema<EntrySchema>, ModelPropsFromSchema<EntrySchema>, true, false, true>;
  randomness: foundry.data.fields.NumberField<number, number, true, false, true>;
  priorities: foundry.data.fields.ArrayField<
    foundry.data.fields.SchemaField<ConfigPrioritySchema, SourceFromSchema<ConfigPrioritySchema>, ModelPropsFromSchema<ConfigPrioritySchema>, true, false, true>,
    SourceFromSchema<ConfigPrioritySchema>[],
    ModelPropsFromSchema<ConfigPrioritySchema>[],
    true,
    false,
    true
  >;
  label: foundry.data.fields.StringField<string, string, true, false, true>;
  link: foundry.data.fields.BooleanField<boolean, boolean, true, false, true>;
  id: foundry.data.fields.StringField<string, string, true, false, true>;
}

interface ConfigPrioritySchema extends foundry.data.fields.DataSchema {
  slug: foundry.data.fields.StringField<string, string, true, false, false>;
  priority: foundry.data.fields.NumberField<number, number, true, false, true>;
  type: SlugField<PriorityOrderType, PriorityOrderType, true, false, true>;
}

interface PriorityCostSchema extends foundry.data.fields.DataSchema {
  priority: foundry.data.fields.StringField<PriorityCostPriority, PriorityCostPriority, true, false, true>;
  resolution: foundry.data.fields.StringField<PriorityCostResolution, PriorityCostResolution, true, false, true>;
}

interface EntrySchema extends foundry.data.fields.DataSchema {
  mode: foundry.data.fields.StringField<EntryMode, EntryMode, true, false, true>;
  choice: SlugField<string, string, true, true, true>;
}

type PriorityOrderType = "arena" | "approach" | "archetype" | "trait" | "perk";
type PriorityMode = "species" | "order"
type PriorityCostPriority = "cheapest" | "shortest" | "random";
type PriorityCostResolution = "cheapest" | "costliest" | "random";
type EntryMode = "best" | "random" | "choice";