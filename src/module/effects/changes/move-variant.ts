import { ActorPTR2e, AttackAdjustment } from "@actor";
import { ActionPTR2e, AttackPTR2e, BasicChangeSystem, ChangeModel, ChangeSchema, PTRCONSTS, RangePTR2e } from "@data";
import { PredicateField } from "@system/predication/schema-data-fields.ts";
import { CHANGE_MODES } from "./change.ts";
import { sluggify } from "@utils";

type MoveVariantOptions = "power" | "accuracy" | "type" | "traits" | "pp-cost" | "range" | "rip" | "offensiveStat" | "defensiveStat";

export default class MoveVariantChangeSystem extends ChangeModel {
  static override TYPE = "move-variant";

  static VALID_PROPERTIES = new Set<MoveVariantOptions>([
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

      const key = `${sluggify(this._source.label || this.selector)}`;  
      const getAttackVariant = (attack: AttackPTR2e): AttackPTR2e | null => {
        if(!attack) return null;
        // If this is the correct variant return it
        if(attack.slug.includes(`${key}-move-variant`)) {
          return attack;
        }
        // If this is already a variant, get the parent attack
        if(attack.variant) return getAttackVariant((attack.parent as unknown as {actions: Map<string, AttackPTR2e>}).actions.get(attack.variant)!);
        // Check if any variants exist for this attack
        const exists = (attack.parent as unknown as {actions: Map<string, AttackPTR2e>}).actions.get(`${attack.slug}-${key}-move-variant`);
        if(exists) return exists;

        // Otherwise generate a new variant
        const variant = fu.duplicate(attack) as unknown as AttackPTR2e["_source"];
        variant.slug += `-${key}-move-variant`;
        variant.name += ` (${this.label || this.selector})`;
        variant.variant = attack.slug;
        variant.img = variant.img === ActionPTR2e.baseImg ? attack.item.img ?? "systems/ptr2e/img/icons/untyped_icon.png" : variant.img;
        // const actions = (attack.parent?._source.actions || []) as AttackPTR2e[];
        // attack.parent?.updateSource({ "actions": [...actions, variant] });
        const variantAttack = new AttackPTR2e(variant, { parent: attack.parent });
        variantAttack.prepareDerivedData();
        attack.actor?.actions.set(variant.slug, variantAttack);
        attack.actor?.actions.attack.set(variant.slug, variantAttack);
        attack.item?.actions.set(variant.slug, variantAttack);
        attack.item?.system.actions.set(variant.slug, variantAttack);
        return variantAttack;
      }

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
              const variant = getAttackVariant(attack);
              if (!variant) {
                return this.failValidation("Could not create or find move variant for accuracy adjustment."); 
              }
              if(attack.appliedVariantLabels.get(variant.slug) === this.label) {
                return;
              }
              attack.appliedVariantLabels.set(variant.slug, `${this.label}`);

              const accuracy = variant.accuracy;
              if (typeof accuracy !== "number") {
                return this.failValidation("An attack that meets the definition of 'accuracy' must have a range with a distance value.");
              }

              const newAccuracy = BasicChangeSystem.getNewValue(this.mode, accuracy, change);
              variant.accuracy = Math.max(1, newAccuracy);
              variant.updateSource({ accuracy: variant.accuracy });
              variant.prepareDerivedData();
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

              const variant = getAttackVariant(attack);
              if (!variant) {
                return this.failValidation("Could not create or find move variant for power adjustment.");
              }
              if(attack.appliedVariantLabels.get(variant.slug) === this.label) {
                return;
              }
              attack.appliedVariantLabels.set(variant.slug, `${this.label}`);

              const power = variant.power;
              if (typeof power !== "number") {
                return this.failValidation("An attack that meets the definition of 'power' must have a range with a distance value.");
              }

              const newPower = BasicChangeSystem.getNewValue(this.mode, power, change);

              variant.power = Math.max(1, newPower);
              variant.updateSource({ power: variant.power });
              variant.prepareDerivedData();
            }
          }
        }
        case "type": {
          return {
            adjustAttack: (attack, options) => {
              if (!([CHANGE_MODES.ADD, CHANGE_MODES.REMOVE, CHANGE_MODES.OVERRIDE] as unknown as ActiveEffectChangeMode[]).includes(this.mode)) {
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

              const variant = getAttackVariant(attack);
              if (!variant) {
                return this.failValidation("Could not create or find move variant for type adjustment.");
              }
              if(attack.appliedVariantLabels.get(variant.slug) === `${this.label}-attack`) {
                return;
              }
              attack.appliedVariantLabels.set(variant.slug, `${this.label}-attack`);

              if (this.mode === CHANGE_MODES.ADD) {
                for (const c of changeArray) {
                  if (!variant.types.has(c)) {
                    variant.types.add(c);
                  }
                }
              }
              else if (this.mode === CHANGE_MODES.REMOVE) {
                for (const c of changeArray) {
                  variant.types.delete(c);
                }
              }
              else if (this.mode === CHANGE_MODES.OVERRIDE) {
                variant.types = new Set(changeArray);
              }
              variant.updateSource({ types: Array.from(variant.types) });
              variant.prepareDerivedData();
            },
            adjustTraits: (attack, traits, options) => {
              if (!([CHANGE_MODES.ADD, "subtract", "remove", CHANGE_MODES.OVERRIDE] as unknown as ActiveEffectChangeMode[]).includes(this.mode)) {
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

              const variant = getAttackVariant(attack);
              if (!variant) {
                return this.failValidation("Could not create or find move variant for type adjustment.");
              }
              if(attack.appliedVariantLabels.get(variant.slug) === `${this.label}-traits`) {
                return;
              }
              attack.appliedVariantLabels.set(variant.slug, `${this.label}-traits`);

              const newTraits = variant === attack ? traits : Array.from(new Set(variant._source.traits));

              if (this.mode === CHANGE_MODES.ADD) {
                newTraits.push(...changeArray);
              }
              else if ((["subtract", "remove"] as unknown as ActiveEffectChangeMode[]).includes(this.mode)) {
                changeArray.forEach(c => newTraits.findSplice(s => s === c));
              }
              else if (this.mode === CHANGE_MODES.OVERRIDE) {
                for (const type of Object.values(PTRCONSTS.Types)) {
                  newTraits.findSplice(s => s === type);
                }
                newTraits.push(...changeArray);
              }
              variant.updateSource({ traits: Array.from(newTraits) });
              variant.prepareDerivedData();
            }
          }
        }
        case "traits": {
          return {
            adjustTraits: (attack, traits, options) => {
              if (!([CHANGE_MODES.ADD, "subtract", "remove"] as unknown as ActiveEffectChangeMode[]).includes(this.mode)) {
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

              const variant = getAttackVariant(attack);
              if (!variant) {
                return this.failValidation("Could not create or find move variant for traits adjustment.");
              }
              if(attack.appliedVariantLabels.get(variant.slug) === `${this.label}`) {
                return;
              }
              attack.appliedVariantLabels.set(variant.slug, `${this.label}`);

              const newTraits = variant === attack ? traits : Array.from(variant._source.traits);

              if (this.mode === CHANGE_MODES.ADD && !newTraits.includes(change)) {
                newTraits.push(change);
              } else if ((["subtract", "remove"] as unknown as ActiveEffectChangeMode[]).includes(this.mode)) {
                newTraits.findSplice(s => s === change);
              }
              variant.updateSource({ traits: Array.from(newTraits) });
              variant.prepareDerivedData();
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

              const variant = getAttackVariant(attack);
              if (!variant) {
                return this.failValidation("Could not create or find move variant for pp-cost adjustment.");
              }
              if(attack.appliedVariantLabels.get(variant.slug) === `${this.label}`) {
                return;
              }
              attack.appliedVariantLabels.set(variant.slug, `${this.label}`);

              const ppCost = variant.cost.powerPoints;
              if (typeof ppCost !== "number") {
                return this.failValidation("An attack that meets the definition of 'pp-cost' must have a range with a distance value.");
              }

              const newPpCost = BasicChangeSystem.getNewValue(this.mode, ppCost, change);
              variant.cost.powerPoints = newPpCost;
              variant.updateSource({ "cost.powerPoints": variant.cost.powerPoints });
              variant.prepareDerivedData();
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

              const variant = getAttackVariant(attack);
              if (!variant) {
                return this.failValidation("Could not create or find move variant for range adjustment.");
              }
              if(attack.appliedVariantLabels.get(variant.slug) === `${this.label}`) {
                return;
              }
              attack.appliedVariantLabels.set(variant.slug, `${this.label}`);

              if (!variant.range) {
                variant.range = new RangePTR2e({
                  target: change as PTRCONSTS.TargetOption,
                  distance: 1,
                });
              }
              else {
                variant.range.target = change as PTRCONSTS.TargetOption;
              }
              variant.updateSource({ range: variant.range });
              variant.prepareDerivedData();
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

              const variant = getAttackVariant(attack);
              if (!variant) {
                return this.failValidation("Could not create or find move variant for rip adjustment.");
              }
              if(attack.appliedVariantLabels.get(variant.slug) === `${this.label}`) {
                return;
              }
              attack.appliedVariantLabels.set(variant.slug, `${this.label}`);

              const rip = variant.range?.distance;
              if (typeof rip !== "number") {
                return this.failValidation("An attack that meets the definition of 'rip' must have a range with a distance value.");
              }

              const newRangeIncrement = BasicChangeSystem.getNewValue(this.mode, rip, change);
              variant.range!.distance = newRangeIncrement;
              variant.updateSource({ range: variant.range });
              variant.prepareDerivedData();
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

              const variant = getAttackVariant(attack);
              if (!variant) {
                return this.failValidation("Could not create or find move variant for offensiveStat adjustment.");
              }
              if(attack.appliedVariantLabels.get(variant.slug) === `${this.label}`) {
                return;
              }
              attack.appliedVariantLabels.set(variant.slug, `${this.label}`);

              variant.offensiveStat = change as PTRCONSTS.Stat;
              variant.updateSource({ offensiveStat: variant.offensiveStat });
              variant.prepareDerivedData();
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

              const variant = getAttackVariant(attack);
              if (!variant) {
                return this.failValidation("Could not create or find move variant for defensiveStat adjustment.");
              }
              if(attack.appliedVariantLabels.get(variant.slug) === `${this.label}`) {
                return;
              }
              attack.appliedVariantLabels.set(variant.slug, `${this.label}`);

              variant.defensiveStat = change as PTRCONSTS.Stat;
              variant.updateSource({ defensiveStat: variant.defensiveStat });
              variant.prepareDerivedData();
            }
          }
        }
      }
    });

    actor.synthetics.moveVariants ??= {};
    actor.synthetics.moveVariants[this.selector] ??= [];
    actor.synthetics.moveVariants[this.selector].push(adjustment);
  }
}

export default interface MoveVariantChangeSystem extends ChangeModel, ModelPropsFromSchema<AlterAttackChangeSchema> {
  _source: SourceFromSchema<AlterAttackChangeSchema>;
  value: string;
}

interface AlterAttackChangeSchema extends ChangeSchema {
  property: foundry.data.fields.StringField<MoveVariantOptions, MoveVariantOptions, true, false, true>;
  definition: PredicateField;
};