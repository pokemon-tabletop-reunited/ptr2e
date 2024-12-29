import type { ActorPTR2e } from "@actor";
import type { CheckRollDataPTR2e } from "./check-roll.ts";
import { CheckRoll } from "./check-roll.ts";
import type { AttackCheckModifier } from "@module/effects/modifiers.ts";
import type { ActiveEffectPTR2e } from "@effects";

class CaptureRoll extends CheckRoll {
  static override createFromData(
    options: CheckRollDataPTR2e,
    data?: CaptureRollCreationData,
    type?: "crit" | "shake1" | "shake2" | "shake3" | "shake4"
  ): CheckRoll | null {
    if (!type) throw new Error("CaptureRoll must have a type.");
    if (!data) throw new Error("CaptureRoll must have data.");

    switch (type) {
      case "crit":
        return CaptureRoll.createCritRoll(data, options);
      case "shake1":
      case "shake2":
      case "shake3":
      case "shake4":
        return CaptureRoll.createShakeRoll(data, options);
    }
  }

  static createCritRoll(
    data: CaptureRollCreationData,
    options: CheckRollDataPTR2e
  ): CaptureRoll | null {
    const formula = "1d100ms@dc";
    const catchRate = this.getCatchRate(data);
    if (!catchRate) return null;

    const dc = new Roll(this.critDcFormula, {
      catchRate: catchRate.total,
      // TODO: Implement
      caught: data.caughtMons || 0,
      bonus: data.critMultiplier || 1,
    }).evaluateSync();

    options.critDC = dc;

    return new CaptureRoll(formula, { dc: dc.total }, options);
  }

  static createShakeRoll(
    data: CaptureRollCreationData,
    options: CheckRollDataPTR2e
  ): CaptureRoll | null {
    const formula = "1d100ms@dc";

    const catchRate = this.getCatchRate(data);
    if (!catchRate) return null;

    const dc = new Roll(
      this.shakeDcFormula,
      { catchRate: catchRate.total },
      { catchRate }
    ).evaluateSync();
    options.shakeDC = dc;

    return new CaptureRoll(formula, { dc: dc.total }, options);
  }

  static getCatchRate(data: CaptureRollCreationData) {
    if (!data.target) return null;

    const effects = data.target.effects as unknown as ActiveEffectPTR2e[];
    return new Roll(this.catchRateFormula, {
      hpMax: data.target.system.health.max,
      hpCurrent: data.target.system.health.value,
      rate: data.target.species?.captureRate || 45,
      bonusBall: data.ballBonus || 1,
      bonusStatus: new Roll(this.bonusStatusFormula, {
        major: effects.filter((effect) => effect.traits.has("major-affliction")).length,
        minor: effects.filter((effect) => effect.traits.has("minor-affliction")).length,
      }).evaluateSync().total,
      bonusStage: new Roll(this.bonusStageFormula, {
        netStages: data.target.netStages,
      }).evaluateSync().total,
      bonusLevel: Math.pow(0.75, (data.target.level - (data.user?.level ?? 0) + 5) / 5 || 0), //Math.max((36 - 2 * (data.target.level || 1)) / 10, 1),
      bonusMisc: data.miscMultiplier || 1,
    }).evaluateSync();
  }

  static readonly shakeDcFormula = "floor(100 * pow((@catchRate / 255), (3/16)))";
  static readonly critDcFormula = "ceil((@catchRate * min(8, 1 + (@caught / 75)) * @bonus) / (357 / 10)) + 1";
  static readonly catchRateFormula = "((3 * @hpMax - 2 * @hpCurrent) / (3 * @hpMax)) * @rate * @bonusBall * @bonusStatus * @bonusStage * @bonusLevel * @bonusMisc";
  static readonly bonusStatusFormula = "pow(1.225, @major) * pow(1.05, @minor)";
  static readonly bonusStageFormula = "pow(1.02, -@netStages)";
}

interface CaptureRollCreationData {
  target: Maybe<ActorPTR2e>;
  user: Maybe<ActorPTR2e>;
  ballBonus: number;
  miscMultiplier: number;
  critMultiplier: number;
  caughtMons: number;
  check: AttackCheckModifier;
}

export { CaptureRoll, type CaptureRollCreationData };
