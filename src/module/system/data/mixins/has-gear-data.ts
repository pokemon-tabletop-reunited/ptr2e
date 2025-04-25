import { MixableTypeDataModel, mixSchema } from "./data";

import fields = foundry.data.fields;
import { SlugField } from "../fields/slug-field";
import { grades, type GearGrade } from "../item/data";
import type { PokemonType } from "../constants";
import { getTypes } from "../config/effectiveness";
import { PTRCONSTS } from "..";
import { EquipmentData } from "../models/equipped";

const gearSchema = {
  crafting: new fields.SchemaField({
    skill: new fields.StringField({
      required: false,
      nullable: true,
      initial: null,
      label: "PTR2E.FIELDS.gear.crafting.skill.label",
      hint: "PTR2E.FIELDS.gear.crafting.skill.hint",
    }),
    spans: new fields.NumberField({
      required: true,
      nullable: true,
      initial: null,
      validate: (d: number | null) => d === null || d > 0,
      label: "PTR2E.FIELDS.gear.crafting.spans.label",
      hint: "PTR2E.FIELDS.gear.crafting.spans.hint",
    }),
    materials: new fields.SetField(new SlugField(), { required: true, initial: [], label: "PTR2E.FIELDS.gear.crafting.materials.label", hint: "PTR2E.FIELDS.gear.crafting.materials.hint" }),
  }),
  equipped: new fields.EmbeddedDataField(EquipmentData),
  grade: new fields.StringField({
    required: true,
    nullable: true,
    initial: null,
    choices: grades.reduce<Record<GearGrade, string>>((acc, grade) => ({ ...acc, [grade]: grade }), {} as Record<GearGrade, string>),
    label: "PTR2E.FIELDS.gear.grade.label",
    hint: "PTR2E.FIELDS.gear.grade.hint",
  }),
  fling: new fields.SchemaField({
    type: new fields.StringField({
      required: true,
      choices: getTypes().reduce<Record<PokemonType, string>>((acc, type) => ({ ...acc, [type]: type }), {} as Record<PokemonType, string>),
      initial: PTRCONSTS.Types.UNTYPED,
      label: "PTR2E.FIELDS.gear.fling.pokemonType.label",
      hint: "PTR2E.FIELDS.gear.fling.pokemonType.hint",
    }),
    power: new fields.NumberField({
      required: true,
      nullable: true,
      initial: null,
      min: 0,
      max: 250,
      label: "PTR2E.FIELDS.gear.fling.power.label",
      hint: "PTR2E.FIELDS.gear.fling.power.hint",
    }),
    accuracy: new fields.NumberField({
      required: true,
      nullable: false,
      initial: 100,
      min: 10,
      max: 100,
      label: "PTR2E.FIELDS.gear.fling.accuracy.label",
      hint: "PTR2E.FIELDS.gear.fling.accuracy.hint",
    }),
    hide: new fields.BooleanField({
      required: true,
      nullable: true,
      initial: null,
      label: "PTR2E.FIELDS.gear.fling.hide.label",
      hint: "PTR2E.FIELDS.gear.fling.hide.hint",
    }),
  }),
  quantity: new fields.NumberField({
    required: true,
    initial: 1,
    validate: (d: number) => d >= 0,
    label: "PTR2E.FIELDS.gear.quantity.label",
    hint: "PTR2E.FIELDS.gear.quantity.hint",
  }),
  rarity: new fields.StringField({
    required: true,
    initial: "common",
    choices: {
      common: "PTR2E.FIELDS.gear.rarity.common",
      uncommon: "PTR2E.FIELDS.gear.rarity.uncommon",
      rare: "PTR2E.FIELDS.gear.rarity.rare",
      unique: "PTR2E.FIELDS.gear.rarity.unique",
    },
    label: "PTR2E.FIELDS.gear.rarity.label",
    hint: "PTR2E.FIELDS.gear.rarity.hint",
  })
};

export function HasGearData<BaseClass extends typeof MixableTypeDataModel>(baseClass: BaseClass) {
  abstract class TemplateClass extends mixSchema(baseClass, gearSchema) { }

  return TemplateClass;
}

export type GearSchema = typeof gearSchema;