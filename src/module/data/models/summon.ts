import { AttackPTR2e } from "@data";
import ResolvableValueField from "../fields/resolvable-value-field.ts";
import type { AttackStatistic } from "@system/statistics/attack.ts";
import { SummonStatistic } from "@system/statistics/summon.ts";
import type { AttackSchema } from "./attack.ts";
import type { DeepPartial } from "fvtt-types/utils";

const summonActionSchema = {
  targetType: new foundry.data.fields.StringField({
    required: true,
    choices: ["all", "ally", "enemy", "target", "owner"].reduce(
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
  damageType: new foundry.data.fields.StringField({
    required: true,
    choices: ["power", "flat"].reduce(
      (acc, val) => ({ ...acc, [val]: val }),
      {}
    ),
    initial: "power",
    label: "PTR2E.FIELDS.damageType.label",
    hint: "PTR2E.FIELDS.damageType.hint"
  }),
  damageFormula: new foundry.data.fields.StringField({
    required: true,
    blank: true,
    initial: "",
    label: "PTR2E.FIELDS.damageFormula.label",
    hint: "PTR2E.FIELDS.damageFormula.hint"
  }),
  attackStat: new ResolvableValueField({
    required: true,
    initial: "owner",
    label: "PTR2E.FIELDS.attackStat.label",
    hint: "PTR2E.FIELDS.attackStat.hint"
  })
}

export type SummonActionSchema = typeof summonActionSchema & AttackSchema;

class SummonActionPTR2e extends AttackPTR2e<SummonActionSchema> {
  // declare parent: SummonPTR2e['system']

  declare type: "summon";

  static override TYPE = "summon" as const;

  static override defineSchema(): SummonActionSchema {
    return {
      ...super.defineSchema() as AttackSchema,
      ...summonActionSchema,
    }
  }

  override get actor(): Actor.ConfiguredInstance | null {
    const self = this as SummonActionPTR2e;
    //@ts-expect-error - FIXME: Investigate what is wrong here
    if (self.parent instanceof CONFIG.Item.documentClass) return self.parent.system.owner ? fromUuidSync<Actor.ConfiguredInstance>(self.parent.system.owner) as Actor.ConfiguredInstance | null : super.actor;
    //@ts-expect-error - FIXME: Investigate what is wrong here

    return self.parent.owner ? fromUuidSync<Actor.ConfiguredInstance>(self.parent.owner) as Actor.ConfiguredInstance | null : super.actor;
  }

  override prepareDerivedData(this: SummonActionPTR2e): void {
    if (this.damageType === "power" && !this.attackStat) this.attackStat = "owner";
    super.prepareDerivedData();
  }

  override prepareStatistic({ force }: { force?: boolean; } = {}): AttackStatistic | null {
    if (!force && this.statistic) return this.statistic;
    if (!this.actor) return null;
    return new SummonStatistic(this);
  }

  override getAttackStat(this: SummonActionPTR2e, actor: Maybe<Actor.ConfiguredInstance> = this.actor): number {
    if (this.attackStat === "owner") return super.getAttackStat(actor);
    if (typeof this.attackStat === "number") return this.attackStat;
    const value = SummonStatistic.resolveValue(this.attackStat, 0, { actor, item: this.item, attack: this as unknown as AttackPTR2e });
    if (typeof value === "number") return value;
    return 0;
  }

  getFormula(this: SummonActionPTR2e): string {
    if (!this.damageFormula) return "0";
    const formula = SummonStatistic.resolveValue(this.damageFormula, "0", { actor: this.actor, item: this.item, attack: this as unknown as AttackPTR2e }, { evaluate: false });
    return typeof formula === "string" ? formula : typeof formula === "number" ? formula + "" : "0";
  }

  async execute(this: SummonActionPTR2e, summonCombatant: PTR.Combatant.System.Summon.Instance, combatants: Combatant.ConfiguredInstance[]) {
    if (!game.users.activeGM) return;
    if (!this.item._id) return;
    if (!this.statistic) this.statistic = this.prepareStatistic();
    if (!this.statistic) return false;

    const targets = new Set<Actor.ConfiguredInstance>();
    const owner = fromUuidSync(summonCombatant.owner ?? "") as Actor.ConfiguredInstance | null;
    for (const combatant of combatants) {
      if (combatant === summonCombatant.parent) continue;
      if (!combatant.actor) continue;
      const actor = combatant.actor;

      switch (this.targetType) {
        case "ally": {
          if (!owner) {
            targets.add(combatant.actor);
            break
          }
          //@ts-expect-error - FIXME: Issue in the original code logic, this.owner field doesn't exist.
          // Slapping this on here for now, as this code is unfinished anyways.
          if (actor.uuid === this.owner || actor.isAllyOf(owner)) {
            targets.add(combatant.actor);
          }
          break;
        }
        case "enemy": {
          if (!owner) {
            targets.add(combatant.actor);
            break
          }
          if (actor.isEnemyOf(owner)) {
            targets.add(combatant.actor);
          }
          break;
        }
        case "target": {
          if (!this.targetUuid) {
            targets.add(combatant.actor);
            break;
          }
          if (this.targetUuid === actor.uuid) {
            targets.add(combatant.actor);
          }
          break;
        }
        case "owner": {
          if (owner?.uuid === actor.uuid) {
            targets.add(combatant.actor);
          }
          break;
        }
        case "all":
        default: {
          targets.add(combatant.actor);
          break;
        }
      }
    }

    return this.statistic.roll({
      targets: Array.from(targets),
      skipDialog: true
    })
  }

  override prepareUpdate(data: DeepPartial<foundry.data.fields.SchemaField.PersistedType<SummonActionSchema>>): PTR.Models.Action.Source[] {
    const currentActions = super.prepareUpdate(data);

    for (const action of currentActions) {
      if (action.type !== "summon") continue;
      const attack = action as unknown as SummonActionPTR2e;
      if (attack.category === "status") {
        attack.power = null;
      }
      else if (attack.damageType === "flat") {
        attack.power = null;
      }
    }
    return currentActions;
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      itemUuid: this.item.uuid
    };
  }
}

export default SummonActionPTR2e;
export { type SummonActionPTR2e }