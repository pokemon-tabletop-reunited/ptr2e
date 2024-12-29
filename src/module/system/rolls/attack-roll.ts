import type { AccuracySuccessCategory, AttackPTR2e, SummonAttackPTR2e } from "@data";
import type { CheckRollDataPTR2e } from "./check-roll.ts";
import { CheckRoll } from "./check-roll.ts";
import type { AttackCheckModifier } from "@module/effects/modifiers.ts";
import type { ActorPTR2e } from "@actor";
import type { AccuracyContext, DamageCalc } from "@module/chat/models/data.ts";

// @ts-expect-error - This override is intentional
class AttackRoll extends CheckRoll {
  constructor(formula: string, data: Record<string, unknown>, options: AttackRollDataPTR2e) {
    const type = options.attackType;
    if (!type) throw new Error("AttackRoll must have an attack type.");
    super(formula, data, options);
    this.attackType = type;
  }

  static override createFromData(
    data: AttackRollCreationData,
    options: AttackRollDataPTR2e,
    type: "accuracy" | "crit" | "damage" = "accuracy"
  ): AttackRoll | null {
    options.attackType = type;
    switch (type) {
      case "accuracy":
        return AttackRoll.createAccuracyRoll(data, options);
      case "crit":
        return AttackRoll.createCritRoll(data, options);
      case "damage":
        return AttackRoll.createDamageRoll(data, options);
    }
  }

  static createAccuracyRoll(
    data: AttackRollCreationData,
    options: AttackRollDataPTR2e
  ): AttackRoll | null {
    const attack = data.attack;
    // If the attack has no accuracy, it always hits
    if (attack.accuracy === null && !options.rip) return null;

    options.moveAccuracy = attack.accuracy ?? 100

    const formula = "1d100ms@dc";
    const dc = ((
      baseAccuracy: number,
      accuracyModifiers: { flat: number; stage: number, percentile: number },
      evasionStage: number
    ) => {
      const { flat: accuracyFlat, stage: accuracyStage, percentile: accuracyPercent } = accuracyModifiers;
      const stageBonus = (() => {
        const accuracy = accuracyStage;
        if (Math.abs(accuracy) === Infinity) return -Infinity;
        const evasion = evasionStage;
        const stages = Math.clamp(accuracy - evasion, -6, 6);
        options.adjustedStages = stages;
        return stages >= 0 ? (3 + stages) / 3 : 3 / (3 - stages);
      })();

      options.otherModifiers = accuracyFlat;
      options.stageModifier = stageBonus;
      options.percentileModifier = accuracyPercent ?? 1

      if (stageBonus === -Infinity) return 0;
      if (options.outOfRange) return 0;

      return Math.clamp(Math.floor((baseAccuracy + accuracyFlat) * stageBonus * (accuracyPercent ?? 1) || 1), 1, 100);
    })(
      options.moveAccuracy,
      data.check.total?.accuracy ?? { flat: 0, stage: 0, percentile: 1 },
      data.check.total?.evasion?.stage ?? 0
    );

    options.accuracyDC = dc;

    return new AttackRoll(formula, { dc }, options);
  }

  static createCritRoll(
    data: AttackRollCreationData,
    options: AttackRollDataPTR2e
  ): AttackRoll | null {
    const attack = data.attack;
    // Status moves cannot crit
    if (attack.category === "status") return null;

    options.critStages = Math.clamp(data.check.total?.crit?.stage ?? 0, 0, 4)

    const formula = "1d100ms@dc";
    const dc = ((stage: 0 | 1 | 2 | 3 | 4): number => {
      switch (stage) {
        case 0:
          return Math.floor(100 * (1 / 24));
        case 1:
          return Math.floor(100 * (1 / 8));
        case 2:
          return Math.floor(100 * (1 / 4));
        case 3:
          return Math.floor(100 * (1 / 2));
        case 4:
          return 100;
      }
    })(options.critStages as 0 | 1 | 2 | 3 | 4);

    options.critDC = dc;

    return new AttackRoll(formula, { dc }, options);
  }

  static createDamageRoll(
    data: AttackRollCreationData,
    options: AttackRollDataPTR2e
  ): AttackRoll | null {
    const basePower = data.attack.power;
    if (basePower === null) return null;

    const powerModifier = data.check.total?.power?.percentile ?? 1;
    const powerFlatModifier = data.check.total?.power?.flat ?? 0;
    const power = Math.max(1, Math.floor(basePower * powerModifier) + powerFlatModifier);
    options.power = power;
    options.damageMod = data.check.total?.damage?.percentile ?? 1;

    return new AttackRoll("2d8", { power }, options);
  }

  static successCategory(
    accuracy: Maybe<AttackRoll>,
    crit: Maybe<AttackRoll>
  ): AccuracySuccessCategory {
    if (accuracy?.dice[0].values[0] === 100) return "fumble";
    const isHit = (accuracy?.total ?? 0) <= 0;
    const isCrit = (crit?.total ?? 1) <= 0;
    return isHit ? (isCrit ? "critical" : "hit") : "miss";
  }

  public calculateDamageTotal({
    origin,
    target,
    isCritHit,
    attack,
    isMultiTarget,
    useEnemyStats
  }: {
    origin: ActorPTR2e;
    target: ActorPTR2e;
    isCritHit: boolean;
    attack: AttackPTR2e;
    isMultiTarget: boolean;
    useEnemyStats: boolean;
  }): Maybe<DamageCalc> {
    if (this.attackType !== "damage") return null;

    // Get the modified power of the roll
    // This includes modifiers already calculated during the creation of the roll.
    const power = this.options.power!;

    // Get the randomness of the Roll
    const damageRoll = Number(this.result);

    // Attack & Defense stats of the origin and target
    const attackStat = attack.getAttackStat(useEnemyStats ? target : attack.actor);
    const defenseStat = target.getDefenseStat(attack, isCritHit);

    // Check for Sniper
    const hasSniper = origin.rollOptions.getFromDomain("item")["ability:sniper:active"];

    // Type effectiveness
    const effectivenessStage = parseInt(this.options.effectivenessStage+"");
    const typeEffectiveness = target.getEffectiveness(attack.types, effectivenessStage, this.options.ignoreImmune ?? false);

    // Other modifiers
    const otherModifier = this.options.damageMod ?? 1;

    // Flat damage modifier
    const flatDamage = this.options.flatDamage ?? 0;

    // Attack Stat Modifier
    const attackStatMod = attackStat + (this.options.statMod ?? 0);

    // Calculate the damage
    const context = {
      level: origin.level,
      power,
      attack: attackStatMod,
      defense: defenseStat,
      targets: isMultiTarget ? 0.75 : 1,
      critical: isCritHit ? hasSniper ? 2 : 1.5 : 1,
      random: damageRoll,
      stab: attack.stab,
      type: typeEffectiveness,
      other: otherModifier,
      flatDamage: flatDamage,
    };
    const roll = new Roll(
      "((((((2 * @level) / 5) + 2) * @power * (@attack / (@defense * (4 / 3)))) / 50) + 2 + @flatDamage) * @targets * @critical * ((100 - @random) / 100) * @stab * @type * @other",
      context
    ).evaluateSync();

    function roundToNearestDownOnPoint5(value: number) {
      const decimal = value - Math.floor(value);
      return decimal > 0.5 ? Math.ceil(value) : Math.floor(value);
    }

    return {
      roll,
      value: Math.max(typeEffectiveness === 0 ? 0 : otherModifier > 0 ? 1 : 0, roundToNearestDownOnPoint5(roll.total)),
      context
    };
  }

  static calculateFlatDamage(attack: SummonAttackPTR2e, target: ActorPTR2e): Maybe<DamageCalc> {
    const formula = attack.getFormula()
    const roll = new Roll(
      formula,
      {
        actor: target,
        health: {
          max: target.system.health.max,
          current: target.system.health.value,
        },
        formula: formula
      }
    ).evaluateSync();

    return {
      roll,
      value: Math.floor(roll.total),
      context: {
        "health.max": target.system.health.max,
        "health.current": target.system.health.value,
      }
    }
  }
}

interface AttackRoll extends CheckRoll {
  options: AttackRollDataPTR2e;
  attackType: "accuracy" | "crit" | "damage";
}

interface AttackRollCreationData {
  attack: AttackPTR2e;
  check: AttackCheckModifier;
}

type AttackRollDataPTR2e = CheckRollDataPTR2e & {
  rip: boolean;
  attackType?: "accuracy" | "crit" | "damage";
  power?: number;
  damageMod?: number;
  outOfRange: boolean;
  flatDamage?: number;
  statMod: number;
  effectivenessStage: number;
  ignoreImmune: boolean;
} & AccuracyContext

export { AttackRoll, type AttackRollDataPTR2e, type AttackRollCreationData };
