import { AttackPTR2e } from "@data";
import ResolvableValueField from "../fields/resolvable-value-field.ts";
import { AttackStatistic } from "@system/statistics/attack.ts";
import { SummonStatistic } from "@system/statistics/summon.ts";
import ActionPTR2e, { ActionSchema } from "./action.ts";
export default class SummonActionPTR2e extends AttackPTR2e {
  declare type: "summon";

  static override TYPE = "summon" as const;

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
        hint: "PTR2E.FIELDS.targetUuid.hint"
      }),
      damageType: new fields.StringField({
        required: true,
        choices: ["power","flat"].reduce<Record<string, string>>(
          (acc, val) => ({ ...acc, [val]: val }),
          {}
        ),
        initial: "power",
        label: "PTR2E.FIELDS.damageType.label",
        hint: "PTR2E.FIELDS.damageType.hint"
      }),
      damageFormula: new fields.StringField({
        required: true,
        blank: true,
        initial: "",
        label: "PTR2E.FIELDS.damageFormula.label",
        hint: "PTR2E.FIELDS.damageFormula.hint"
      }),
      attackStat: new ResolvableValueField<true, false, true>({
        required: true,
        initial: "owner",
        label: "PTR2E.FIELDS.attackStat.label",
        hint: "PTR2E.FIELDS.attackStat.hint"
      })
    }
  }

  override prepareDerivedData(): void {
    if(this.damageType === "power" && !this.attackStat) this.attackStat = "owner";
    super.prepareDerivedData();
  }

  override prepareStatistic({ force }: { force?: boolean; } = {}): AttackStatistic | null {
    if (!force && this.statistic) return this.statistic;
    if (!this.actor) return null;
    return new SummonStatistic(this);
  }

  override prepareUpdate(data: DeepPartial<SourceFromSchema<ActionSchema>>): ActionPTR2e[] {
    const currentActions = super.prepareUpdate(data);

    for (const action of currentActions) {
      if (action.type !== "summon") continue;
      const attack = action as SummonActionPTR2e;
      if (attack.category === "status") {
        attack.power = null;
      }
      else if(attack.damageType === "flat") {
        attack.power = null;
      }
    }
    return currentActions;
  }
}
