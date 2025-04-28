import { HasBase, type HasBaseSchema } from "../../mixins/has-base";
import { HasEmbed } from "../../mixins/has-embed";

const abilitySchema = {
  free: new foundry.data.fields.BooleanField({
    required: true,
    initial: false,
    label: "PTR2E.FIELDS.free.label",
    hint: "PTR2E.FIELDS.free.hint",
  }),
  slot: new foundry.data.fields.NumberField({
    required: true,
    nullable: true,
    initial: null,
    label: "PTR2E.FIELDS.slot.label",
    hint: "PTR2E.FIELDS.slot.hint",
  }),
}

declare namespace AbilitySystem {
  type Schema = typeof abilitySchema & HasBaseSchema;
}

class AbilitySystem extends HasEmbed(HasBase(foundry.abstract.TypeDataModel), "ability")<AbilitySystem.Schema, foundry.abstract.Document.Any> {
  static override defineSchema() {
    return {
      ...super.defineSchema(),
      ...abilitySchema,
    };
  }

  get isSuppressed(): boolean {
    return this.suppress ?? false;
  } 
}

interface AbilitySystem {
  suppress?: boolean;
}

export { AbilitySystem };