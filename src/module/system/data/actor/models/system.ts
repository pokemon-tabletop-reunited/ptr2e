import type { EmptyObject } from "fvtt-types/utils";
import type { ActorPTR2e } from "../document";

import fields = foundry.data.fields;
import { CollectionField } from "../../fields/collection-field";
import type { TypeField, TypesFieldOptions } from "./data.d.mts";
import { Natures, type PokemonType } from "../../constants";
import { getTypes } from "../../config/effectiveness";
import { SlugField } from "../../fields/slug-field";
import SkillPTR2e from "../../models/skill";
import { getInitialSkillList } from "../../config/skills";
import { ClockPTR2e } from "../../models/clock";
import { SpeciesSystem } from "../../item/models/species";

const actorSystemSchema = {
  advancement: new fields.SchemaField({
    experience: new fields.SchemaField({
      current: new fields.NumberField({
        required: true,
        nullable: false,
        initial: 0,
        min: 0,
        label: "PTR2E.FIELDS.experience.current.label",
        hint: "PTR2E.FIELDS.experience.current.hint",
      }),
      next: new fields.NumberField({
        required: true,
        nullable: false,
        initial: 0,
        min: 0,
        label: "PTR2E.FIELDS.experience.next.label",
        hint: "PTR2E.FIELDS.experience.next.hint",
      }),
      diff: new fields.NumberField({
        required: true,
        nullable: false,
        initial: 0,
        min: 0,
        label: "PTR2E.FIELDS.experience.diff.label",
        hint: "PTR2E.FIELDS.experience.diff.hint",
      }),
    }),
    level: new fields.NumberField({
      required: true,
      nullable: false,
      initial: 1,
      min: 1,
      max: 100,
      label: "PTR2E.FIELDS.level.label",
      hint: "PTR2E.FIELDS.level.hint",
    }),
  }),
  attributes: new fields.SchemaField({}),
  battleStats: new fields.SchemaField({}),
  skills: new CollectionField(new fields.EmbeddedDataField(SkillPTR2e), "slug", {
    initial: getInitialSkillList
  }),
  biology: new fields.ObjectField(),
  capabilities: new fields.ObjectField(),
  type: new fields.SchemaField({
    types: new fields.SetField<TypeField, TypesFieldOptions>(
      new fields.StringField({
        required: true,
        nullable: false,
        choices: getTypes().reduce<Record<PokemonType, string>>(
          (acc, type) => ({ ...acc, [type]: type }),
          {} as Record<PokemonType, string>
        ),
        initial: "untyped",
        label: "PTR2E.FIELDS.PokemonType.Label",
        hint: "PTR2E.FIELDS.PokemonType.Hint",
      }) as TypeField,
      {
        initial: ["untyped"],
        label: "PTR2E.FIELDS.PokemonType.LabelPlural",
        hint: "PTR2E.FIELDS.PokemonType.HintPlural",
        required: true,
        validate: (d: Iterable<string>) =>
          d instanceof Set ? d.size > 0 : Array.isArray(d) ? d.length > 0 : false,
        validationError: "PTR2E.Errors.PokemonType",
        nullable: false
      }
    ),
  }),
  powerPoints: new fields.SchemaField({
    value: new fields.NumberField({
      required: true,
      initial: 0,
      min: 0,
      label: "PTR2E.FIELDS.powerPoints.value.label",
      hint: "PTR2E.FIELDS.powerPoints.value.hint",
    }),
    max: new fields.NumberField({
      required: true,
      initial: 0,
      min: 0,
      label: "PTR2E.FIELDS.powerPoints.max.label",
      hint: "PTR2E.FIELDS.powerPoints.max.hint",
    }),
  }),
  health: new fields.SchemaField({
    value: new fields.NumberField({
      required: true,
      initial: 0,
      min: 0,
      label: "PTR2E.FIELDS.health.value.label",
      hint: "PTR2E.FIELDS.health.value.hint",
    }),
    max: new fields.NumberField({
      required: true,
      initial: 0,
      min: 0,
      label: "PTR2E.FIELDS.health.max.label",
      hint: "PTR2E.FIELDS.health.max.hint",
    }),
  }),
  shield: new fields.SchemaField({
    value: new fields.NumberField({
      required: true,
      initial: 0,
      min: 0,
      label: "PTR2E.FIELDS.shield.value.label",
      hint: "PTR2E.FIELDS.shield.value.hint",
    }),
    max: new fields.NumberField({
      required: true,
      initial: 0,
      min: 0,
      label: "PTR2E.FIELDS.shield.max.label",
      hint: "PTR2E.FIELDS.shield.max.hint",
    })
  }),
  money: new fields.NumberField({ required: true, initial: 0 }),
  species: new fields.SchemaField(SpeciesSystem.defineSchema(), {
    required: false,
    nullable: true,
    initial: null,
  }),
  shiny: new fields.BooleanField({ required: true, initial: false }),
  nature: new fields.StringField({
    required: true,
    choices: Natures,
    initial: "hardy",
    label: "PTR2E.FIELDS.nature.label",
  }),
  gender: new fields.StringField({
    required: true,
    choices: {
      "genderless": "PTR2E.ActorSystem.FIELDS.gender.genderless",
      "male": "PTR2E.ActorSystem.FIELDS.gender.male",
      "female": "PTR2E.ActorSystem.FIELDS.gender.female"
    },
    initial: "genderless"
  }),
  slots: new fields.NumberField({
    required: true,
    initial: 6,
    integer: true,
    positive: true,
    label: "PTR2E.FIELDS.slots.label",
    hint: "PTR2E.FIELDS.slots.hint",
  }),
  inventoryPoints: new fields.SchemaField({
    current: new fields.NumberField({
      required: true,
      initial: 0,
      min: 0,
      label: "PTR2E.FIELDS.inventoryPoints.current.label",
      hint: "PTR2E.FIELDS.inventoryPoints.current.hint",
    }),
  }),
  party: new fields.SchemaField({
    ownerOf: new fields.DocumentIdField({ required: false }),
    partyMemberOf: new fields.DocumentIdField({ required: false }),
    teamMemberOf: new fields.ArrayField(new fields.DocumentIdField(), { initial: [] }),
  }),
  clocks: new CollectionField(
    new fields.EmbeddedDataField(ClockPTR2e),
    "id",
    { required: true, initial: [] }
  ),
  immunities: new fields.SetField(new SlugField(), { required: true, initial: [] }),
  details: new fields.SchemaField({
    alliance: new fields.StringField({
      choices: {
        "party": "party",
        "opposition": "opposition"
      },
      required: true,
      nullable: true,
      initial: "",
      blank: true,
      label: "PTR2E.FIELDS.details.alliance.label",
      hint: "PTR2E.FIELDS.details.alliance.hint",
    }),
    size: new fields.SchemaField({
      height: new fields.NumberField({ required: true, initial: 0, label: "PTR2E.FIELDS.size.height.label", hint: "PTR2E.FIELDS.size.height.hint" }),
      weight: new fields.NumberField({ required: true, initial: 0, label: "PTR2E.FIELDS.size.weight.label", hint: "PTR2E.FIELDS.size.weight.hint" }),
      heightClass: new fields.NumberField({ required: true, initial: 0, min: 0, max: 7 }),
      weightClass: new fields.NumberField({ required: true, initial: 1, min: 1, max: 16 }),
    }),
    biography: new fields.HTMLField({ required: true, initial: "", label: "PTR2E.FIELDS.details.biography.label", hint: "PTR2E.FIELDS.details.biography.hint" }),
    dex: new CollectionField(new fields.SchemaField({
      slug: new fields.StringField({ required: true, nullable: false }),
      state: new fields.StringField({ required: true, nullable: false, initial: "unknown", choices: ["unknown", "seen", "caught", "shiny"] }),
    })),
    device: new fields.StringField({ required: true, blank: true, initial: "", label: "PTR2E.FIELDS.details.device.label", hint: "PTR2E.FIELDS.details.device.hint" }),
  }),
  inventory: new fields.SchemaField({
    held: new fields.SchemaField({
      max: new fields.NumberField({ required: true, initial: 0, min: 0, label: "PTR2E.FIELDS.inventory.held.max.label", hint: "PTR2E.FIELDS.inventory.held.max.hint" }),
    }),
    worn: new fields.SchemaField({
      max: new fields.NumberField({ required: true, initial: 0, min: 0, label: "PTR2E.FIELDS.inventory.worn.max.label", hint: "PTR2E.FIELDS.inventory.worn.max.hint" }),
    }),
    accessory: new fields.SchemaField({
      max: new fields.NumberField({ required: true, initial: 0, min: 0, label: "PTR2E.FIELDS.inventory.accessory.max.label", hint: "PTR2E.FIELDS.inventory.accessory.max.hint" }),
    }),
    belt: new fields.SchemaField({
      max: new fields.NumberField({ required: true, initial: 0, min: 0, label: "PTR2E.FIELDS.inventory.belt.max.label", hint: "PTR2E.FIELDS.inventory.belt.max.hint" }),
    }),
    backpack: new fields.SchemaField({
      max: new fields.NumberField({ required: true, initial: 0, min: 0, label: "PTR2E.FIELDS.inventory.backpack.max.label", hint: "PTR2E.FIELDS.inventory.backpack.max.hint" }),
    })
  })
}

declare namespace ActorSystem {
  type Schema = typeof actorSystemSchema;

  type BaseData = EmptyObject
  type DerivedData = EmptyObject
}

class ActorSystem extends foundry.abstract.TypeDataModel<ActorSystem.Schema, ActorPTR2e> {
  static override defineSchema(): fields.DataSchema {
    return actorSystemSchema;
  }

  test(this: ActorSystem) {
    return {
      level: this.advancement.experience.current,
      test: this.skills.get("acrobatics")?.value,
      device: this.details.device,
    };
  }
}

export { ActorSystem };