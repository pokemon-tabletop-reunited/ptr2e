import type { ActorPTR2e, AttackAdjustment } from "@actor";
import { BasicChangeSystem, ChangeModel, PTRCONSTS, RangePTR2e } from "@data";
import { PredicateField } from "@system/predication/schema-data-fields.ts";
import type { ChangeModelSchema } from "./change.ts";

type AttackPropertyOptions = "power" | "accuracy" | "type" | "traits" | "pp-cost" | "range" | "rip" | "offensiveStat" | "defensiveStat";

const alterAttackChangeSchema = {
  property: new foundry.data.fields.StringField<{ required: true, choices: string[], initial: string }, AttackPropertyOptions, AttackPropertyOptions>({
    required: true,
    choices: ["power", "accuracy", "type", "traits", "pp-cost", "range", "rip", "offensiveStat", "defensiveStat"] satisfies AttackPropertyOptions[],
    initial: "power",
  }),
  definition: new PredicateField(),
}

export type AlterAttackChangeSchema = typeof alterAttackChangeSchema & ChangeModelSchema;

export default class AlterAttackChangeSystem extends ChangeModel<AlterAttackChangeSchema> {
  static override TYPE = "alter-attack";

  static VALID_PROPERTIES = new Set<AttackPropertyOptions>([
    "power",
    "accuracy",
    "type",
    "traits",
    "pp-cost",
    "range",
    "rip",
    "offensiveStat",
    "defensiveStat"
  ] as const);

  static override defineSchema() {
    return {
      ...super.defineSchema(),
      ...alterAttackChangeSchema,
    }
  }

  get selector() {
    return this.key;
  }

  override apply(actor: ActorPTR2e): void {
    this.beforePrepareData(actor);
  }

  override beforePrepareData(
    this: AlterAttackChangeSystem,
    actor: ActorPTR2e | null = this.actor
  ): void {
    if (!actor) return;
    if (!this.test()) return;

    const change = this.resolveValue(this.value);

    const adjustment = ((): AttackAdjustment => {
      if (!this.property) throw Error("Unexpected missing property in AlterActionChangeSystem");

      const definition = this.resolveInjectedProperties(this.definition);

      switch (this.property) {
        case "accuracy": {
          return {
            adjustAttack: (attack, options) => {
              if (typeof change !== "number") {
                return this.failValidation("An attack alteration of type 'accuracy' must have a integer value.");
              }

              if (!definition.test(options)) {
                return;
              }

              const accuracy = attack.accuracy;
              if (typeof accuracy !== "number") {
                return this.failValidation("An attack that meets the definition of 'accuracy' must have a range with a distance value.");
              }

              const newAccuracy = BasicChangeSystem.getNewValue(this.mode as ActiveEffectChangeMode, accuracy, change);
              if (typeof newAccuracy === "number") {
                attack.accuracy = Math.max(1, newAccuracy);
                attack.updateSource({ accuracy: attack.accuracy });
              }
            }
          }
        }
        case "power": {
          return {
            adjustAttack: (attack, options) => {
              if (typeof change !== "number") {
                return this.failValidation("An attack alteration of type 'power' must have a integer value.");
              }

              if (!definition.test(options)) {
                return;
              }

              const power = attack.power;
              if (typeof power !== "number") {
                return this.failValidation("An attack that meets the definition of 'power' must have a range with a distance value.");
              }

              const newPower = BasicChangeSystem.getNewValue(this.mode as ActiveEffectChangeMode, power, change);
              if (typeof newPower === "number") {
                attack.power = Math.max(1, newPower);
                attack.updateSource({ power: attack.power });
              }
            }
          }
        }
        case "type": {
          return {
            adjustAttack: (attack, options) => {
              if (!([CONST.ACTIVE_EFFECT_MODES.ADD, "subtract", "remove", CONST.ACTIVE_EFFECT_MODES.OVERRIDE] as unknown as ActiveEffectChangeMode[]).includes(this.mode as ActiveEffectChangeMode)) {
                return this.failValidation(
                  "An attack alteration change of type 'type' must have a mode of 'add', 'subtract', 'remove' or 'override'."
                );
              }

              const changeArray = change ? Array.isArray(change) ? change : [change] : [];
              if (!changeArray.every(c => typeof c === "string" && Object.values(PTRCONSTS.Types).includes(c as PTRCONSTS.PokemonType))) {
                return this.failValidation("An attack alteration of type 'type' must have a lower-case type value.");
              }
              if (!definition.test(options)) {
                return;
              }

              if (this.mode === CONST.ACTIVE_EFFECT_MODES.ADD) {
                for (const c of changeArray) {
                  if (!attack.types.has(c)) {
                    attack.types.add(c);
                  }
                }
              }
              else if ((["subtract", "remove"] as unknown as ActiveEffectChangeMode[]).includes(this.mode as ActiveEffectChangeMode)) {
                for (const c of changeArray) {
                  attack.types.delete(c);
                }
              }
              else if (this.mode === CONST.ACTIVE_EFFECT_MODES.OVERRIDE) {
                attack.types = new Set(changeArray);
              }
              attack.updateSource({ types: Array.from(attack.types) });
            },
            adjustTraits: (attack, traits, options) => {
              if (!([CONST.ACTIVE_EFFECT_MODES.ADD, "subtract", "remove", CONST.ACTIVE_EFFECT_MODES.OVERRIDE] as unknown as ActiveEffectChangeMode[]).includes(this.mode as ActiveEffectChangeMode)) {
                return this.failValidation(
                  "An attack alteration change of type 'type' must have a mode of 'add', 'subtract', 'remove' or 'override'."
                );
              }

              const changeArray = change ? Array.isArray(change) ? change : [change] : [];
              if (!changeArray.every(c => typeof c === "string" && Object.values(PTRCONSTS.Types).includes(c as PTRCONSTS.PokemonType))) {
                return this.failValidation("An attack alteration of type 'type' must have a lower-case type value.");
              }
              if (!definition.test(options)) {
                return;
              }

              if (this.mode === CONST.ACTIVE_EFFECT_MODES.ADD) {
                traits.push(...changeArray);
              }
              else if ((["subtract", "remove"] as unknown as ActiveEffectChangeMode[]).includes(this.mode as ActiveEffectChangeMode)) {
                changeArray.forEach(c => traits.findSplice(s => s === c));
              }
              else if (this.mode === CONST.ACTIVE_EFFECT_MODES.OVERRIDE) {
                for (const type of Object.values(PTRCONSTS.Types)) {
                  traits.findSplice(s => s === type);
                }
                traits.push(...changeArray);
              }
              attack.updateSource({ traits: Array.from(traits) });
            }
          }
        }
        case "traits": {
          return {
            adjustTraits: (attack, traits, options) => {
              if (!([CONST.ACTIVE_EFFECT_MODES.ADD, "subtract", "remove"] as unknown as ActiveEffectChangeMode[]).includes(this.mode as ActiveEffectChangeMode)) {
                return this.failValidation(
                  "An attack alteration change of type 'traits' must have a mode of 'add', 'subtract', or 'remove'."
                );
              }
              if (!change || typeof change !== "string" || change.toLowerCase() != change) {
                return this.failValidation("An attack alteration of type 'traits' must have a lower-case trait value.");
              }
              if (!definition.test(options)) {
                return;
              }

              if (this.mode === CONST.ACTIVE_EFFECT_MODES.ADD && !traits.includes(change)) {
                traits.push(change);
              } else if ((["subtract", "remove"] as unknown as ActiveEffectChangeMode[]).includes(this.mode as ActiveEffectChangeMode)) {
                traits.findSplice(s => s === change);
              }
              attack.updateSource({ traits: Array.from(traits) });
            }
          }
        }
        case "pp-cost": {
          return {
            adjustAttack: (attack, options) => {
              if (typeof change !== "number") {
                return this.failValidation("An attack alteration of type 'pp-cost' must have a integer value.");
              }

              if (!definition.test(options)) {
                return;
              }

              const ppCost = attack.cost.powerPoints;
              if (typeof ppCost !== "number") {
                return this.failValidation("An attack that meets the definition of 'pp-cost' must have a range with a distance value.");
              }

              const newPpCost = BasicChangeSystem.getNewValue(this.mode as ActiveEffectChangeMode, ppCost, change);
              if (typeof newPpCost === "number") {
                attack.cost.powerPoints = newPpCost;
                attack.updateSource({ "cost": { "powerPoints": attack.cost.powerPoints } });
              }
            }
          }
        }
        case "range": {
          return {
            adjustAttack: (attack, options) => {
              if (!change || typeof change !== "string" || !Object.values(PTRCONSTS.TargetOptions).includes(change as PTRCONSTS.TargetOption)) {
                return this.failValidation("An attack alteration of type 'range' must have a supported 'Range' text value.");
              }

              if (!definition.test(options)) {
                return;
              }

              if (!attack.range) {
                attack.range = new RangePTR2e({
                  target: change as PTRCONSTS.TargetOption,
                  distance: 1,
                });
              }
              else {
                attack.range.target = change as PTRCONSTS.TargetOption;
              }
              attack.updateSource({ range: attack.range });
            }
          }
        }
        case "rip": {
          return {
            adjustAttack: (attack, options) => {
              if (typeof change !== "number") {
                return this.failValidation("An attack alteration of type 'rip' must have a integer value.");
              }

              if (!definition.test(options)) {
                return;
              }

              const rip = attack.range?.distance;
              if (typeof rip !== "number") {
                return this.failValidation("An attack that meets the definition of 'rip' must have a range with a distance value.");
              }

              const newRangeIncrement = BasicChangeSystem.getNewValue(this.mode as ActiveEffectChangeMode, rip, change);
              if (typeof newRangeIncrement === "number") {
                attack.range!.distance = newRangeIncrement;
                attack.updateSource({ range: attack.range });
              }
            }
          }
        }
        case "offensiveStat": {
          return {
            adjustAttack: (attack, options) => {
              if (!change || typeof change !== "string" || !Object.values(PTRCONSTS.Stats).includes(change as PTRCONSTS.Stat)) {
                return this.failValidation("An attack alteration of type 'offensiveStat' must have a supported 'Stat' text value.");
              }

              if (!definition.test(options)) {
                return;
              }

              attack.offensiveStat = change as PTRCONSTS.Stat;
              attack.updateSource({ offensiveStat: attack.offensiveStat });
            }
          }
        }
        case "defensiveStat": {
          return {
            adjustAttack: (attack, options) => {
              if (!change || typeof change !== "string" || !Object.values(PTRCONSTS.Stats).includes(change as PTRCONSTS.Stat)) {
                return this.failValidation("An attack alteration of type 'defensiveStat' must have a supported 'Stat' text value.");
              }

              if (!definition.test(options)) {
                return;
              }

              attack.defensiveStat = change as PTRCONSTS.Stat;
              attack.updateSource({ defensiveStat: attack.defensiveStat });
            }
          }
        }
      }
    });

    actor.synthetics.attackAdjustments.push(adjustment);
  }
}

export default interface AlterAttackChangeSystem {
  value: string;
}