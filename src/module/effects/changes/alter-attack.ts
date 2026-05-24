import { ActorPTR2e, AttackAdjustment } from "@actor";
import { BasicChangeSystem, ChangeModel, ChangeSchema, PTRCONSTS, RangePTR2e } from "@data";
import { PredicateField } from "@system/predication/schema-data-fields.ts";
import { CHANGE_MODES } from "./change.ts";

type AttackPropertyOptions = "power" | "accuracy" | "type" | "traits" | "pp-cost" | "range" | "rip" | "offensiveStat" | "defensiveStat" | "category";

export default class AlterAttackChangeSystem extends ChangeModel {
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
    "defensiveStat",
    "category"
  ] as const);

  static override defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      property: new fields.StringField({
        required: true,
        choices: Object.fromEntries(Array.from(this.VALID_PROPERTIES).map((v) => [v, Handlebars.helpers.formatSlug(v)])),
        initial: "power",
        label: "PTR2E.Effect.FIELDS.property.label",
        hint: "PTR2E.Effect.FIELDS.property.hint",
      }),
      definition: new PredicateField({
        label: "PTR2E.Effect.FIELDS.definition.label",
        hint: "PTR2E.Effect.FIELDS.definition.hint",
      }),
    }
  }

  get selector() {
    return this.key;
  }

  override apply(actor: ActorPTR2e): void {
    this.beforePrepareData(actor);
  }

  override beforePrepareData(
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

              const newAccuracy = BasicChangeSystem.getNewValue(this.method, accuracy, change);
              attack.accuracy = Math.max(1, newAccuracy);
              attack.updateSource({ accuracy: attack.accuracy });
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

              const newPower = BasicChangeSystem.getNewValue(this.method, power, change);

              attack.power = Math.max(1, newPower);
              attack.updateSource({ power: attack.power });
            }
          }
        }
        case "type": {
          return {
            adjustAttack: (attack, options) => {
              if (!([CHANGE_MODES.ADD, CHANGE_MODES.REMOVE, CHANGE_MODES.OVERRIDE] as unknown as ActiveEffectChangeMode[]).includes(this.method)) {
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

              if (this.method === CHANGE_MODES.ADD) {
                for (const c of changeArray) {
                  if (!attack.types.has(c)) {
                    attack.types.add(c);
                  }
                }
              }
              else if (this.method === CHANGE_MODES.REMOVE) {
                for (const c of changeArray) {
                  attack.types.delete(c);
                }
              }
              else if (this.method === CHANGE_MODES.OVERRIDE) {
                attack.types = new Set(changeArray);
              }
              attack.updateSource({ types: Array.from(attack.types) });
            },
            adjustTraits: (attack, traits, options) => {
              if (!([CHANGE_MODES.ADD, "subtract", "remove", CHANGE_MODES.OVERRIDE] as unknown as ActiveEffectChangeMode[]).includes(this.method)) {
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

              if (this.method === CHANGE_MODES.ADD) {
                traits.push(...changeArray);
              }
              else if ((["subtract", "remove"] as unknown as ActiveEffectChangeMode[]).includes(this.method)) {
                changeArray.forEach(c => traits.findSplice(s => s === c));
              }
              else if (this.method === CHANGE_MODES.OVERRIDE) {
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
              if (!([CHANGE_MODES.ADD, "subtract", "remove"] as unknown as ActiveEffectChangeMode[]).includes(this.method)) {
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

              if (this.method === CHANGE_MODES.ADD && !traits.includes(change)) {
                traits.push(change);
              } else if ((["subtract", "remove"] as unknown as ActiveEffectChangeMode[]).includes(this.method)) {
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

              const newPpCost = BasicChangeSystem.getNewValue(this.method, ppCost, change);
              attack.cost.powerPoints = newPpCost;
              attack.updateSource({ "cost.powerPoints": attack.cost.powerPoints });
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

              const newRangeIncrement = BasicChangeSystem.getNewValue(this.method, rip, change);
              attack.range!.distance = newRangeIncrement;
              attack.updateSource({ range: attack.range });
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
        case "category": {
          return {
            adjustAttack: (attack, options) => {
              if (!change || typeof change !== "string" || !Object.values(PTRCONSTS.Categories).includes(change as PTRCONSTS.PokemonCategory)) {
                return this.failValidation("An attack alteration of type 'category' must have a supported 'Attack Category' text value.");
              }

              if (!definition.test(options)) {
                return;
              }

              attack.category = change as PTRCONSTS.PokemonCategory;
              attack.updateSource({ category: attack.category });
            }
          }
        }
      }
    });

    actor.synthetics.attackAdjustments ??= {};
    actor.synthetics.attackAdjustments[this.selector] ??= [];
    actor.synthetics.attackAdjustments[this.selector].push(adjustment);
  }
}

export default interface AlterAttackChangeSystem extends ChangeModel, ModelPropsFromSchema<AlterAttackChangeSchema> {
  _source: SourceFromSchema<AlterAttackChangeSchema>;
  value: string;
}

interface AlterAttackChangeSchema extends ChangeSchema {
  property: foundry.data.fields.StringField<AttackPropertyOptions, AttackPropertyOptions, true, false, true>;
  definition: PredicateField;
};