import type { AnyObject, EmptyObject } from "fvtt-types/utils";
import type { ActorPTR2e } from "../base";

import fields = foundry.data.fields;

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
} satisfies foundry.data.fields.DataSchema;

declare namespace ActorSystem {
  type Schema = typeof actorSystemSchema;

  type BaseData = {}
  type DerivedData = {}
}

class ActorSystem<
  Schema extends ActorSystem.Schema,
  BaseData extends ActorSystem.BaseData = ActorSystem.BaseData,
  DerivedData extends ActorSystem.DerivedData = ActorSystem.DerivedData
> extends foundry.abstract.TypeDataModel<Schema, ActorPTR2e, BaseData, DerivedData> {
  value(this: ActorSystem<ActorSystem.Schema>) {
    return this.advancement.level;
  }
}

export { ActorSystem };