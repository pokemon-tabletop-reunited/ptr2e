import { CollectionField } from "../fields/collection-field.ts";
import { natures } from "@scripts/config/natures.ts";
import { RecursiveEmbeddedDataField } from "../fields/recursive-embedded-data-field.ts";
import { SlugField } from "../fields/slug-field.ts";
import { ItemPTR2e } from "@item";
import { DataUnionField } from "../fields/data-union-field.ts";
import { StrictStringField } from "../fields/strict-primitive-fields.ts";
import { HabitatRollTable } from "@system/habitat-table.ts";
import type { ActorPTR2e } from "@actor";

function defineSchema() {
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
    id: new fields.DocumentIdField({ initial: foundry.utils.randomID(), required: true, nullable: false }),
    species: new DataUnionField([
      new fields.DocumentUUIDField({
        required: true, nullable: true, initial: null, embedded: false, validate: (value: string) => {
          const uuid = foundry.utils.parseUuid(String(value));
          return uuid && uuid.documentType && (uuid.documentType === "RollTable" || uuid.documentType === "Item" || uuid.documentType === "Actor");
        }, validationError: "The species must be a valid (Species) Item, Actor, Rolltable UUID or null.",
      }),
      new StrictStringField({ required: true, nullable: true, initial: null, validate: (value: string): boolean => CONFIG.PTR.data.habitats[value as keyof typeof CONFIG.PTR.data.habitats] !== undefined})
    ], {
      required: true,
      nullable: true,
      initial: null,
      label: "PTR2E.Blueprint.FIELDS.species.label",
      hint: "PTR2E.Blueprint.FIELDS.species.hint"
    }),
    shiny: new fields.NumberField({
      required: true,
      initial: 1,
      nullable: false,
      min: 0,
      max: 100,
      step: 1,
      label: "PTR2E.Blueprint.FIELDS.shiny.label",
      hint: "PTR2E.Blueprint.FIELDS.shiny.hint"
    }),
    level: new fields.StringField({
      required: true, initial: null, nullable: true, trim: true, blank: false, validate: (value: string) => {
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
        const uuid = foundry.utils.parseUuid(value);
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
      required: true, initial: null, nullable: true, blank: false, trim: true, validate: (value: string) => {
        //Natures can either be a valid nature typed out, a UUID to a Rolltable or null
        if (value === null) return true;
        if (typeof value !== "string") return false;

        // Check if the value is a valid nature
        const nature = value.toLowerCase();
        if (natures[nature] !== undefined) return true;

        // Check if the value is a Rolltable UUID
        const uuid = foundry.utils.parseUuid(value);
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
    preventEvolution: new fields.BooleanField({ required: true, initial: false, nullable: false, label: "PTR2E.FIELDS.preventEvolution.label", hint: "PTR2E.FIELDS.preventEvolution.hint" }),
  }
}

const blueprintSchema = defineSchema();

export type BlueprintSchema = typeof blueprintSchema;

export class Blueprint extends foundry.abstract.DataModel<BlueprintSchema, foundry.abstract.DataModel.Any> {
  static override LOCALIZATION_PREFIXES = ["PTR2E.Blueprint"];

  declare name: string;
  declare img: string | null;
  declare doc: ItemPTR2e | HabitatRollTable | RollTable | ActorPTR2e | null;

  static override defineSchema(recursion = 0): BlueprintSchema {
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
      id: new fields.DocumentIdField({ initial: foundry.utils.randomID(), required: true, nullable: false }),
      species: new DataUnionField([
        new fields.DocumentUUIDField({
          required: true, nullable: true, initial: null, embedded: false, validate: (value: string) => {
            const uuid = foundry.utils.parseUuid(String(value));
            return uuid && uuid.documentType && (uuid.documentType === "RollTable" || uuid.documentType === "Item" || uuid.documentType === "Actor");
          }, validationError: "The species must be a valid (Species) Item, Actor, Rolltable UUID or null.",
        }),
        new StrictStringField({ required: true, nullable: true, initial: null, validate: (value: string): boolean => CONFIG.PTR.data.habitats[value as keyof typeof CONFIG.PTR.data.habitats] !== undefined})
      ], {
        required: true,
        nullable: true,
        initial: null,
        label: "PTR2E.Blueprint.FIELDS.species.label",
        hint: "PTR2E.Blueprint.FIELDS.species.hint"
      }),
      shiny: new fields.NumberField({
        required: true,
        initial: 1,
        nullable: false,
        min: 0,
        max: 100,
        step: 1,
        label: "PTR2E.Blueprint.FIELDS.shiny.label",
        hint: "PTR2E.Blueprint.FIELDS.shiny.hint"
      }),
      level: new fields.StringField({
        required: true, initial: null, nullable: true, trim: true, blank: false, validate: (value: string) => {
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
          const uuid = foundry.utils.parseUuid(value);
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
        required: true, initial: null, nullable: true, blank: false, trim: true, validate: (value: string) => {
          //Natures can either be a valid nature typed out, a UUID to a Rolltable or null
          if (value === null) return true;
          if (typeof value !== "string") return false;

          // Check if the value is a valid nature
          const nature = value.toLowerCase();
          if (natures[nature] !== undefined) return true;

          // Check if the value is a Rolltable UUID
          const uuid = foundry.utils.parseUuid(value);
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
      preventEvolution: new fields.BooleanField({ required: true, initial: false, nullable: false, label: "PTR2E.FIELDS.preventEvolution.label", hint: "PTR2E.FIELDS.preventEvolution.hint" }),
      ...(
        recursion < 2
          ? { children: new CollectionField(new RecursiveEmbeddedDataField(this, {}, { recursion }), "id") }
          : {}
      )
    }
  }

  preparedAsyncData = false;

  async prepareAsyncData(): Promise<void> {
    if (this.preparedAsyncData) return;

    const doc = await (async () => {
      if(CONFIG.PTR.data.habitats[this._source.species as keyof typeof CONFIG.PTR.data.habitats] !== undefined) {
        const table = new HabitatRollTable({habitat: this._source.species as keyof typeof CONFIG.PTR.data.habitats});
        await table.init();
        return table;
      }

      return await fromUuid(this._source.species ?? "") as ItemPTR2e
    })();

    const { name, img } = doc ?? { name: "Invalid UUID", img: "icons/svg/hazard.svg" };

    this.name = name;
    this.img = img ?? null;
    this.doc = doc;

    this.preparedAsyncData = true;
  }
}