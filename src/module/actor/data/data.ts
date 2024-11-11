import { ClockPTR2e } from "@data";
import SpeciesSystem, { SpeciesSchema } from "@item/data/species.ts";
import { CollectionField } from "@module/data/fields/collection-field.ts";
import { SlugField } from "@module/data/fields/slug-field.ts";
import { MigrationSchema } from "@module/data/mixins/has-migrations.ts";
import { TraitsSchema } from "@module/data/mixins/has-traits.ts";
import { ClockSchema } from "@module/data/models/clock.ts";
import SkillPTR2e from "@module/data/models/skill.ts";
import { TypeEffectiveness } from "@scripts/config/effectiveness.ts";
import { Nature } from "@scripts/config/natures.ts";

interface Movement { method: string; value: number; type: "primary" | "secondary" }

interface ActorSystemSchema extends TraitsSchema, MigrationSchema, foundry.data.fields.DataSchema {
  species: foundry.data.fields.SchemaField<SpeciesSchema, SourceFromSchema<SpeciesSchema>, SpeciesSystem, false, true, true>;
  advancement: foundry.data.fields.SchemaField<AdvancementSchema, SourceFromSchema<AdvancementSchema>, ModelPropsFromSchema<AdvancementSchema>, true, false, false>;
  attributes: foundry.data.fields.SchemaField<AttributesSchema, SourceFromSchema<AttributesSchema>, ModelPropsFromSchema<AttributesSchema>, true, false, false>;
  battleStats: foundry.data.fields.SchemaField<BattleStatsSchema, SourceFromSchema<BattleStatsSchema>, ModelPropsFromSchema<BattleStatsSchema>, true, false, false>;
  skills: CollectionField<foundry.data.fields.EmbeddedDataField<SkillPTR2e>>;
  biology: foundry.data.fields.ObjectField<object, object, true, false, false>;
  capabilities: foundry.data.fields.ObjectField<object, object, true, false, false>;
  type: foundry.data.fields.SchemaField<TypeSchema, SourceFromSchema<TypeSchema>, ModelPropsFromSchema<TypeSchema>, true, false, false>;
  powerPoints: foundry.data.fields.SchemaField<PowerPointsSchema, SourceFromSchema<PowerPointsSchema>, ModelPropsFromSchema<PowerPointsSchema>, true, false, false>;
  health: foundry.data.fields.SchemaField<HealthSchema, SourceFromSchema<HealthSchema>, ModelPropsFromSchema<HealthSchema>, true, false, false>;
  shield: foundry.data.fields.SchemaField<ShieldSchema, SourceFromSchema<ShieldSchema>, ModelPropsFromSchema<ShieldSchema>, true, false, false>;
  money: foundry.data.fields.NumberField<number, number, true, false, true>;
  shiny: foundry.data.fields.BooleanField<boolean, boolean, true, false, true>;
  nature: foundry.data.fields.StringField<Nature, Nature, true, false, true>;
  gender: foundry.data.fields.StringField<GenderOptions, GenderOptions, true, false, true>;
  slots: foundry.data.fields.NumberField<number, number, true, false, true>;
  inventoryPoints: foundry.data.fields.SchemaField<InventoryPointsSchema, SourceFromSchema<InventoryPointsSchema>, ModelPropsFromSchema<InventoryPointsSchema>, true, false, false>;
  party: foundry.data.fields.SchemaField<PartySchema, SourceFromSchema<PartySchema>, ModelPropsFromSchema<PartySchema>, true, false, false>;
  clocks: CollectionField<
    foundry.data.fields.EmbeddedDataField<ClockPTR2e, true, false, true>,
    SourceFromSchema<ClockSchema>[],
    Collection<ClockPTR2e>,
    true, false, true
  >;
  immunities: foundry.data.fields.SetField<SlugField, string[], Set<string>, true, false, true>;
}

interface PartySchema extends foundry.data.fields.DataSchema {
  ownerOf: foundry.data.fields.DocumentIdField<string, false, false, false>;
  partyMemberOf: foundry.data.fields.DocumentIdField<string, false, false, false>;
  teamMemberOf: foundry.data.fields.ArrayField<foundry.data.fields.DocumentIdField<string, true, false, false>, string[], string[], true, false, true>;
}

interface AdvancementSchema extends foundry.data.fields.DataSchema {
  experience: foundry.data.fields.SchemaField<ExperienceSchema, SourceFromSchema<ExperienceSchema>, ModelPropsFromSchema<ExperienceSchema>, true, false, false>;
  level: foundry.data.fields.NumberField<number, number, true, false, true>;
}

interface ExperienceSchema extends foundry.data.fields.DataSchema {
  current: foundry.data.fields.NumberField<number, number, true, false, true>;
  next: foundry.data.fields.NumberField<number, number, true, false, true>;
  diff: foundry.data.fields.NumberField<number, number, true, false, true>;
}

interface AttributesSchema extends foundry.data.fields.DataSchema {
  hp: foundry.data.fields.SchemaField<Omit<AttributeSchema, 'stage'>, SourceFromSchema<Omit<AttributeSchema, 'stage'>>, ModelPropsFromSchema<Omit<AttributeSchema, 'stage'>>, true, false, false>;
  atk: foundry.data.fields.SchemaField<AttributeSchema, SourceFromSchema<AttributeSchema>, ModelPropsFromSchema<AttributeSchema>, true, false, false>;
  def: foundry.data.fields.SchemaField<AttributeSchema, SourceFromSchema<AttributeSchema>, ModelPropsFromSchema<AttributeSchema>, true, false, false>;
  spa: foundry.data.fields.SchemaField<AttributeSchema, SourceFromSchema<AttributeSchema>, ModelPropsFromSchema<AttributeSchema>, true, false, false>;
  spd: foundry.data.fields.SchemaField<AttributeSchema, SourceFromSchema<AttributeSchema>, ModelPropsFromSchema<AttributeSchema>, true, false, false>;
  spe: foundry.data.fields.SchemaField<AttributeSchema, SourceFromSchema<AttributeSchema>, ModelPropsFromSchema<AttributeSchema>, true, false, false>;
}

interface AttributeSchema extends foundry.data.fields.DataSchema {
  slug: SlugField<string, string, true, false, true>;
  evs: foundry.data.fields.NumberField<number, number, true, false, true>;
  ivs: foundry.data.fields.NumberField<number, number, true, false, true>;
  base: foundry.data.fields.NumberField<number, number, true, false, true>;
  stage: foundry.data.fields.NumberField<number, number, true, false, true>;
}

interface BattleStatsSchema extends foundry.data.fields.DataSchema {
  evasion: foundry.data.fields.SchemaField<StatSchema, SourceFromSchema<StatSchema>, ModelPropsFromSchema<StatSchema>, true, false, false>;
  accuracy: foundry.data.fields.SchemaField<StatSchema, SourceFromSchema<StatSchema>, ModelPropsFromSchema<StatSchema>, true, false, false>;
  critRate: foundry.data.fields.SchemaField<StatSchema, SourceFromSchema<StatSchema>, ModelPropsFromSchema<StatSchema>, true, false, false>;
}

interface StatSchema extends foundry.data.fields.DataSchema {
  slug: SlugField<string, string, true, false, true>;
  stage: foundry.data.fields.NumberField<number, number, true, false, true>;
}

interface TypeSchema extends foundry.data.fields.DataSchema {
  types: foundry.data.fields.SetField<TypeField, foundry.data.fields.SourcePropFromDataField<TypeField>[], Set<foundry.data.fields.SourcePropFromDataField<TypeField>>, true, false, true>;
}

type TypeField = foundry.data.fields.StringField<keyof TypeEffectiveness, keyof TypeEffectiveness, true, false, true>;

interface PowerPointsSchema extends foundry.data.fields.DataSchema {
  value: foundry.data.fields.NumberField<number, number, true, false, true>;
  max: foundry.data.fields.NumberField<number, number, true, false, true>;
}

interface HealthSchema extends foundry.data.fields.DataSchema {
  value: foundry.data.fields.NumberField<number, number, true, false, true>;
  max: foundry.data.fields.NumberField<number, number, true, false, true>;
}

interface ShieldSchema extends foundry.data.fields.DataSchema {
  value: foundry.data.fields.NumberField<number, number, true, false, true>;
  max: foundry.data.fields.NumberField<number, number, true, false, true>;
}

type GenderOptions = "genderless" | "male" | "female";

interface InventoryPointsSchema extends foundry.data.fields.DataSchema {
  current: foundry.data.fields.NumberField<number, number, true, false, true>;
}

export type {
  Movement,
  ActorSystemSchema,
  AdvancementSchema,
  ExperienceSchema,
  AttributesSchema,
  AttributeSchema,
  BattleStatsSchema,
  StatSchema,
  TypeSchema,
  TypeField,
  PowerPointsSchema,
  HealthSchema,
  ShieldSchema,
  GenderOptions,
  InventoryPointsSchema,
}