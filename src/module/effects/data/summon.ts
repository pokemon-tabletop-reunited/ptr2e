import type { ActorPTR2e } from "@actor";
import type { AfflictionSystemSchema } from "./affliction.ts";
import AfflictionActiveEffectSystem from "./affliction.ts";
import type { ChangeModel } from "@data";

const summonEffectSchema = {
  targetType: new foundry.data.fields.StringField({
    required: true,
    choices: ["all", "ally", "enemy", "target", "owner"].reduce<Record<string, string>>(
      (acc, val) => ({ ...acc, [val]: val }),
      {}
    ),
    initial: "all",
    label: "PTR2E.FIELDS.targetType.label",
    hint: "PTR2E.FIELDS.targetType.hint"
  }),
  targetUuid: new foundry.data.fields.DocumentUUIDField({
    required: true,
    nullable: true,
    initial: null,
    label: "PTR2E.FIELDS.targetUuid.label",
    hint: "PTR2E.FIELDS.targetUuid.hint",
    type: "Actor"
  }),
}

export type SummonEffectSchema = typeof summonEffectSchema & AfflictionSystemSchema;

class SummonActiveEffectSystem extends AfflictionActiveEffectSystem<SummonEffectSchema> {
  static override defineSchema(): SummonEffectSchema {
    return {
      ...super.defineSchema() as AfflictionSystemSchema,
      ...summonEffectSchema,
    }
  }

  override get remainingActivations() {
    return Infinity;
  }

  override apply(actor: ActorPTR2e, change: ChangeModel, options?: string[]) {
    const self = this as SummonActiveEffectSystem;
    if(self.formula) {
      const afflictions = (actor.synthetics.afflictions ??= { data: [], ids: new Set() });
      if (!afflictions.ids.has(self.parent.id)) {
        afflictions.data.push(self);
        afflictions.ids.add(self.parent.id);
      }
    }

    const result = change.apply(actor, options);
    if (result === false) return result;

    return result;
  }
}

export default SummonActiveEffectSystem;