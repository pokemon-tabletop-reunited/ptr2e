import ActionPTR2e from "./action";

import fields = foundry.data.fields;

const attackSchema = {
  ...ActionPTR2e.defineSchema(),

  free: new fields.BooleanField({
    required: true,
    initial: false,
    label: "PTR2E.FIELDS.free.label",
    hint: "PTR2E.FIELDS.free.hint",
  })
};

declare namespace AttackPTR2e {
  type Schema = typeof attackSchema;
}

export default class AttackPTR2e<TSchema extends AttackPTR2e.Schema = AttackPTR2e.Schema> extends ActionPTR2e<TSchema> {
  static override TYPE: "attack" | "summon" = "attack" as const;

  static override defineSchema() {
    return attackSchema;
  }
}
