import { AttackPTR2e } from "@data";
import ResolvableValueField from "../fields/resolvable-value-field.ts";
import { AttackStatistic } from "@system/statistics/attack.ts";
import { SummonStatistic } from "@system/statistics/summon.ts";
import ActionPTR2e, { ActionSchema } from "./action.ts";
import { CombatantPTR2e, SummonCombatantSystem } from "@combat";
import { ActorPTR2e } from "@actor";
import { ItemPTR2e, SummonPTR2e } from "@item";
export default class SummonActionPTR2e extends AttackPTR2e {
  declare parent: SummonPTR2e['system']

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
        hint: "PTR2E.FIELDS.targetUuid.hint",
        type: "Actor"
      }),
      damageType: new fields.StringField({
        required: true,
        choices: ["power", "flat"].reduce<Record<string, string>>(
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

  override get actor() {
    if (this.parent instanceof ItemPTR2e) return this.parent.system.owner ? fromUuidSync<ActorPTR2e>(this.parent.system.owner) : super.actor;
    return this.parent.owner ? fromUuidSync<ActorPTR2e>(this.parent.owner) : super.actor;
  }

  override prepareDerivedData(): void {
    if (this.damageType === "power" && !this.attackStat) this.attackStat = "owner";
    super.prepareDerivedData();
  }

  override prepareStatistic({ force }: { force?: boolean; } = {}): AttackStatistic | null {
    if (!force && this.statistic) return this.statistic;
    if (!this.actor) return null;
    return new SummonStatistic(this);
  }

  override getAttackStat(actor: Maybe<ActorPTR2e> = this.actor): number {
    if (this.attackStat === "owner") return super.getAttackStat(actor);
    if (typeof this.attackStat === "number") return this.attackStat;
    const value = SummonStatistic.resolveValue(this.attackStat, 0, { actor, item: this.item, attack: this });
    if (typeof value === "number") return value;
    return 0;
  }

  getFormula(): string {
    if (!this.damageFormula) return "0";
    const formula = SummonStatistic.resolveValue(this.damageFormula, "0", { actor: this.actor, item: this.item, attack: this }, { evaluate: false });
    return typeof formula === "string" ? formula : typeof formula === "number" ? formula + "" : "0";
  }

  async execute(summonCombatant: SummonCombatantSystem, combatants: CombatantPTR2e[]) {
    if (!game.users.activeGM) return;
    if (!this.item._id) return;
    if (!this.statistic) this.statistic = this.prepareStatistic();
    if (!this.statistic) return false;

    const targets = new Set<ActorPTR2e>();
    const owner = fromUuidSync<ActorPTR2e>(summonCombatant.owner)
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

  override prepareUpdate(data: DeepPartial<SourceFromSchema<ActionSchema>>): ActionPTR2e[] {
    const currentActions = super.prepareUpdate(data);

    for (const action of currentActions) {
      if (action.type !== "summon") continue;
      const attack = action as SummonActionPTR2e;
      if (attack.category === "status") {
        attack.power = null;
      }
      else if (attack.damageType === "flat") {
        attack.power = null;
      }
    }
    return currentActions;
  }

  override toJSON(): this["_source"] {
    return {
      ...super.toJSON(),
      itemUuid: this.item.uuid
    };
  }
}

export default interface SummonActionPTR2e extends AttackPTR2e, ModelPropsFromSchema<SummonActionSchema> {
  _source: SourceFromSchema<SummonActionSchema> & AttackPTR2e['_source'];
}

interface SummonActionSchema extends ActionSchema {
  targetType: foundry.data.fields.StringField<
    "all" | "ally" | "enemy" | "target" | "owner",
    "all" | "ally" | "enemy" | "target" | "owner",
    true,
    true,
    true
  >;
  targetUuid: foundry.data.fields.DocumentUUIDField<string, true, true, true>;
  damageType: foundry.data.fields.StringField<
    "power" | "flat",
    "power" | "flat",
    true,
    true,
    true
  >;
  damageFormula: foundry.data.fields.StringField<string, string, true, true, true>;
  attackStat: ResolvableValueField<true, false, true>;
}
