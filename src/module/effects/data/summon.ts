import { ActorPTR2e } from "@actor";
import { ActiveEffectSystemSchema } from "../system.ts";
import AfflictionActiveEffectSystem from "./affliction.ts";
import { ChangeModel } from "@data";

class SummonActiveEffectSystem extends AfflictionActiveEffectSystem {
  static override defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      targetType: new fields.StringField({
        required: true,
        choices: ["all", "ally", "enemy", "target", "owner"].reduce<Record<string, string>>(
          (acc, val) => ({ ...acc, [val]: val }),
          {}
        ),
        initial: "all",
        label: "PTR2E.FIELDS.targetType.label",
        hint: "PTR2E.FIELDS.targetType.hint"
      }),
      targetUuid: new fields.DocumentUUIDField({
        required: true,
        nullable: true,
        initial: null,
        label: "PTR2E.FIELDS.targetUuid.label",
        hint: "PTR2E.FIELDS.targetUuid.hint",
        type: "Actor"
      }),
    }
  }

  override get remainingActivations() {
    return Infinity;
  }

  override apply(actor: ActorPTR2e, change: ChangeModel, options?: string[]) {
    if(this.formula) {
      const afflictions = (actor.synthetics.afflictions ??= { data: [], ids: new Set() });
      if (!afflictions.ids.has(this.parent.id)) {
        afflictions.data.push(this);
        afflictions.ids.add(this.parent.id);
      }
    }

    const result = change.apply(actor, options);
    if (result === false) return result;

    return result;
  }
}

interface SummonActiveEffectSystem
  extends AfflictionActiveEffectSystem,
  ModelPropsFromSchema<SummonActiveEffectSchema> { }

interface SummonActiveEffectSchema extends ActiveEffectSystemSchema {
  priority: foundry.data.fields.NumberField<number, number, true, false, true>;
  formula: foundry.data.fields.StringField<string, string, true, true, true>;
  type: foundry.data.fields.StringField<
    "damage" | "healing",
    "damage" | "healing",
    true,
    true,
    true
  >;
  targetType: foundry.data.fields.StringField<
    "all" | "ally" | "enemy" | "target" | "owner",
    "all" | "ally" | "enemy" | "target" | "owner",
    true,
    true,
    true
    >;
  targetUuid: foundry.data.fields.DocumentUUIDField<string, true, true, true>;
}

export default SummonActiveEffectSystem;