import { CollectionField } from "../fields/collection-field.ts";
import { Nature, natures } from "@scripts/config/natures.ts";
import { RecursiveEmbeddedDataField } from "../fields/recursive-embedded-data-field.ts";
import { SlugField } from "../fields/slug-field.ts";
import { ItemPTR2e } from "@item";
import SpeciesSystem from "@item/data/species.ts";
import { ActorPTR2e } from "@actor";

class Blueprint extends foundry.abstract.DataModel {
  static LOCALIZATION_PREFIXES = ["PTR2E.Blueprint"];

  static override defineSchema(recursion = 0): foundry.data.fields.DataSchema {
    const fields = foundry.data.fields;

    const evsValidation = (value: unknown) => {
      if (value === undefined) return true;
      if (value === null) return false;

      // Check if the value is a number
      const number = Number(value);
      if (!isNaN(number)) {
        if (Number.isInteger(number) && number >= 0 && number <= 200) return true;
        throw new Error("The EVs must be a positive integer between 0 and 200.");
      }
      if (typeof value !== "string") return false;

      // Check if the value is a range
      if (value.match(/^\d+-\d+$/)) {
        const [min, max] = value.split("-").map(Number);
        if (min >= 0 && max >= min && max <= 200) return true;

        throw new Error("The range must be in the format `a-b` where `a` and `b` are integers and `a` is less than or equal to `b`. The values must be between 0 and 200.");
      }

      return false;
    }

    return {
      id: new fields.DocumentIdField({ initial: fu.randomID(), required: true, nullable: false }),
      species: new fields.DocumentUUIDField({
        required: true, nullable: true, initial: null, embedded: false, validate: (value) => {
          const uuid = fu.parseUuid(String(value));
          return uuid && (uuid.documentType === "RollTable" || uuid.documentType === "Item" || uuid.documentType === "Actor");
        }, validationError: "The species must be a valid (Species) Item, Actor, Rolltable UUID or null.",
        label: "PTR2E.Blueprint.FIELDS.species.label",
        hint: "PTR2E.Blueprint.FIELDS.species.hint"
      }),
      level: new fields.StringField({
        required: true, initial: null, nullable: true, trim: true, blank: false, validate: (value) => {
          // Level can be either a integer value, a range in the format `a-b`, a Rolltable UUID or null
          if (value === null) return true;

          // Check if the value is a number
          const number = Number(value);
          if (!isNaN(number)) {
            if (Number.isInteger(number) && number >= 1) return true;
            throw new Error("The level must be a positive integer.");
          }
          if (typeof value !== "string") return false;

          // Check if the value is a range
          if (value.match(/^\d+-\d+$/)) {
            const [min, max] = value.split("-").map(Number);
            if (min >= 1 && max >= min) return true;

            throw new Error("The range must be in the format `a-b` where `a` and `b` are integers and `a` is less than or equal to `b`.");
          }

          // Check if the value is a Rolltable UUID
          const uuid = fu.parseUuid(value);
          if (uuid && uuid.documentId) {
            if (uuid.documentType === "RollTable") return true;
            throw new Error("The UUID must point to a Rolltable.");
          }

          return false;
        }, validationError: "The level must be a positive integer, a range in the format `a-b`, a Rolltable UUID or null.",
        label: "PTR2E.Blueprint.FIELDS.level.label",
        hint: "PTR2E.Blueprint.FIELDS.level.hint"
      }),
      nature: new fields.StringField({
        required: true, initial: null, nullable: true, blank: false, trim: true, validate: (value) => {
          //Natures can either be a valid nature typed out, a UUID to a Rolltable or null
          if (value === null) return true;
          if (typeof value !== "string") return false;

          // Check if the value is a valid nature
          const nature = value.toLowerCase();
          if (natures[nature] !== undefined) return true;

          // Check if the value is a Rolltable UUID
          const uuid = fu.parseUuid(value);
          if (uuid && uuid.documentId) {
            if (uuid.documentType === "RollTable") return true;
            throw new Error("The UUID must point to a Rolltable.");
          }

          return false;
        }, validationError: "The nature must be a valid nature, a UUID to a Rolltable or null.",
        label: "PTR2E.Blueprint.FIELDS.nature.label",
        hint: "PTR2E.Blueprint.FIELDS.nature.hint"
        
      }),
      evs: new fields.SchemaField({
        uuid: new fields.DocumentUUIDField({ required: false, nullable: false, embedded: false, type: "RollTable", initial: undefined }),
        bst: new fields.BooleanField({ required: true, nullable: false, initial: false }),
        percent: new fields.NumberField({ required: false, nullable: false, initial: undefined, min: 0, max: 100, validationError: "The BST Randomness Percentage must be a positive integer between 0 and 100." }),
        hp: new fields.StringField({ required: false, initial: undefined, nullable: false, blank: true, trim: true, validate: evsValidation, validationError: "HP EV must be a positive integer between 0 and 200, or a range in the format `a-b`. " }),
        atk: new fields.StringField({ required: false, initial: undefined, nullable: false, blank: true, trim: true, validate: evsValidation, validationError: "ATK EV must be a positive integer between 0 and 200, or a range in the format `a-b`. " }),
        def: new fields.StringField({ required: false, initial: undefined, nullable: false, blank: true, trim: true, validate: evsValidation, validationError: "DEF EV must be a positive integer between 0 and 200, or a range in the format `a-b`. " }),
        spa: new fields.StringField({ required: false, initial: undefined, nullable: false, blank: true, trim: true, validate: evsValidation, validationError: "SPA EV must be a positive integer between 0 and 200, or a range in the format `a-b`. " }),
        spd: new fields.StringField({ required: false, initial: undefined, nullable: false, blank: true, trim: true, validate: evsValidation, validationError: "SPD EV must be a positive integer between 0 and 200, or a range in the format `a-b`. " }),
        spe: new fields.StringField({ required: false, initial: undefined, nullable: false, blank: true, trim: true, validate: evsValidation, validationError: "SPE EV must be a positive integer between 0 and 200, or a range in the format `a-b`. " }),
      }, {}),
      skills: new fields.SchemaField({
        uuid: new fields.DocumentUUIDField({ required: false, nullable: false, embedded: false, type: "RollTable", initial: undefined }),
        data: new fields.ArrayField(
          new fields.SchemaField({
            slug: new SlugField({ required: true, blank: false }),
            value: new fields.NumberField({ required: true, initial: 1, positive: true }),
            sort: new fields.NumberField({ required: true, nullable: false }),
          },
            {}
          ),
          {}
        )
      }, {}),
      // TODO: Add moves
      abilities: new fields.SchemaField({
        starting: new fields.ArrayField(new fields.SchemaField({
          slug: new SlugField({ blank: false }),
          uuid: new fields.DocumentUUIDField(),
          chance: new fields.NumberField({ required: false, nullable: false, initial: 50, min: 0, max: 100, validationError: "The chance must be a positive integer between 0 and 100." }),
        }), { required: true, initial: [], label: "PTR2E.FIELDS.abilities.starting.label", },),
        basic: new fields.ArrayField(new fields.SchemaField({
          slug: new SlugField({ blank: false }),
          uuid: new fields.DocumentUUIDField(),
          chance: new fields.NumberField({ required: false, nullable: false, initial: 50, min: 0, max: 100, validationError: "The chance must be a positive integer between 0 and 100." }),
        }), { required: true, initial: [], label: "PTR2E.FIELDS.abilities.basic.label", },),
        advanced: new fields.ArrayField(new fields.SchemaField({
          slug: new SlugField({ blank: false }),
          uuid: new fields.DocumentUUIDField(),
          chance: new fields.NumberField({ required: false, nullable: false, initial: 50, min: 0, max: 100, validationError: "The chance must be a positive integer between 0 and 100." }),
        }), { required: true, initial: [], label: "PTR2E.FIELDS.abilities.advanced.label", },),
        master: new fields.ArrayField(new fields.SchemaField({
          slug: new SlugField({ blank: false }),
          uuid: new fields.DocumentUUIDField(),
          chance: new fields.NumberField({ required: false, nullable: false, initial: 50, min: 0, max: 100, validationError: "The chance must be a positive integer between 0 and 100." }),
        }), { required: true, initial: [], label: "PTR2E.FIELDS.abilities.master.label", },),
      }),
      owner: new fields.BooleanField({ required: true, initial: false, nullable: false, label: "PTR2E.FIELDS.owner.label", hint: "PTR2E.FIELDS.owner.hint" }),
      sort: new fields.NumberField({ required: true, initial: 0, nullable: false }),
      ...(
        recursion < 2
          ? { children: new CollectionField(new RecursiveEmbeddedDataField(this, {}, { recursion }), "id") }
          : {}
      )
    }
  }

  prepareBaseData(): void {
    console.log("intellisense func")

  }

  preparedAsyncData = false;

  async prepareAsyncData(): Promise<void> {
    if (this.preparedAsyncData) return;

    // const type = fu.parseUuid(this._source.species).documentType;

    const doc = await fromUuid<ItemPTR2e<SpeciesSystem> | RollTable | ActorPTR2e>(this._source.species);

    const { name, img } = doc ?? { name: "Invalid UUID", img: "icons/svg/hazard.svg" };

    this.name = name;
    this.img = img;


    this.preparedAsyncData = true;
  }
}

interface Blueprint extends foundry.abstract.DataModel, ModelPropsFromSchema<BlueprintSchema> {
  name: string;
  img: ImageFilePath | null;

  _source: SourceFromSchema<BlueprintSchema>;
}

interface BlueprintSchema extends foundry.data.fields.DataSchema {
  id: foundry.data.fields.DocumentIdField<string, true, false, true>;
  children: CollectionField<foundry.data.fields.SchemaField<BlueprintSchema>>;
  species: foundry.data.fields.DocumentUUIDField<SpeciesBlueprint, true, true, true>;
  level: foundry.data.fields.StringField<LevelBlueprint, true, true, false, true>;
  nature: foundry.data.fields.StringField<NatureBlueprint, true, true, false, true>;
  evs: foundry.data.fields.SchemaField<EVSSchema, SourceFromSchema<EVSSchema>, ModelPropsFromSchema<EVSSchema>>;
  skills: foundry.data.fields.SchemaField<SkillsSchema, SourceFromSchema<SkillsSchema>, ModelPropsFromSchema<SkillsSchema>>;
  abilities: foundry.data.fields.SchemaField<AbilitiesSchema, SourceFromSchema<AbilitiesSchema>, ModelPropsFromSchema<AbilitiesSchema>>;
  owner: foundry.data.fields.BooleanField<boolean, boolean, true, false, true>;
  sort: foundry.data.fields.NumberField<number, number, true, false, true>;
}

interface EVSSchema extends foundry.data.fields.DataSchema {
  bst: foundry.data.fields.BooleanField<boolean, boolean, true, false, true>;
  percent: foundry.data.fields.NumberField<number, number, true, false, true>;
  hp: foundry.data.fields.StringField<string, string, false, false, true>;
  atk: foundry.data.fields.StringField<string, string, false, false, true>;
  def: foundry.data.fields.StringField<string, string, false, false, true>;
  spa: foundry.data.fields.StringField<string, string, false, false, true>;
  spd: foundry.data.fields.StringField<string, string, false, false, true>;
  spe: foundry.data.fields.StringField<string, string, false, false, true>;
}

interface SkillsSchema extends foundry.data.fields.DataSchema {
  data: foundry.data.fields.ArrayField<
    foundry.data.fields.SchemaField<SkillSchema>,
    foundry.data.fields.SourcePropFromDataField<foundry.data.fields.SchemaField<SkillSchema>>[],
    foundry.data.fields.SourcePropFromDataField<foundry.data.fields.SchemaField<SkillSchema>>[],
    true, false, true
  >;
  uuid: foundry.data.fields.DocumentUUIDField<DocumentUUID<RollTable>, true, false, true>;
}

interface SkillSchema extends foundry.data.fields.DataSchema {
  slug: SlugField<string, string, true, false, false>;
  value: foundry.data.fields.NumberField<number, number, true, false, true>;
  sort: foundry.data.fields.NumberField<number, number, true, false, true>;
}

interface AbilitiesSchema extends foundry.data.fields.DataSchema {
  starting: foundry.data.fields.ArrayField<foundry.data.fields.SchemaField<AbilitySchema>, foundry.data.fields.SourcePropFromDataField<foundry.data.fields.SchemaField<AbilitySchema>>[], foundry.data.fields.SourcePropFromDataField<foundry.data.fields.SchemaField<AbilitySchema>>[], true, false, true>;
  basic: foundry.data.fields.ArrayField<foundry.data.fields.SchemaField<AbilitySchema>, foundry.data.fields.SourcePropFromDataField<foundry.data.fields.SchemaField<AbilitySchema>>[], foundry.data.fields.SourcePropFromDataField<foundry.data.fields.SchemaField<AbilitySchema>>[], true, false, true>;
  advanced: foundry.data.fields.ArrayField<foundry.data.fields.SchemaField<AbilitySchema>, foundry.data.fields.SourcePropFromDataField<foundry.data.fields.SchemaField<AbilitySchema>>[], foundry.data.fields.SourcePropFromDataField<foundry.data.fields.SchemaField<AbilitySchema>>[], true, false, true>;
  master: foundry.data.fields.ArrayField<foundry.data.fields.SchemaField<AbilitySchema>, foundry.data.fields.SourcePropFromDataField<foundry.data.fields.SchemaField<AbilitySchema>>[], foundry.data.fields.SourcePropFromDataField<foundry.data.fields.SchemaField<AbilitySchema>>[], true, false, true>;
}

interface AbilitySchema extends foundry.data.fields.DataSchema {
  slug: SlugField<string, string, true, false, false>;
  uuid: foundry.data.fields.DocumentUUIDField<DocumentUUID<RollTable>, true, false, true>;
  chance: foundry.data.fields.NumberField<number, number, true, false, true>;
}

type NatureBlueprint = Nature | DocumentUUID<RollTable>;
type LevelBlueprint = `${number}` | `${number}-${number}` | DocumentUUID<RollTable>;
type SpeciesBlueprint = DocumentUUID<Item<null>> | DocumentUUID<RollTable>;

type CompendiumDocumentUUID<T extends WorldDocument> = `Compendium.${string}.${T["documentName"]}.${string}`;
type DocumentUUID<T extends WorldDocument> = WorldDocumentUUID<T> | CompendiumDocumentUUID<T>;

export { Blueprint, type BlueprintSchema };