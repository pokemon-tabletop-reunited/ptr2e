import { AttackPTR2e, ResolveValueParams, SummonAttackPTR2e } from "@data";
import { AttackStatistic } from "./attack.ts";
import { ModifierPTR2e } from "@module/effects/modifiers.ts";
import * as R from "remeda";
import { isBracketedValue, isObject } from "@utils";
import { ActorPTR2e } from "@actor";
import { ItemPTR2e } from "@item";
import { BracketedValue, RuleValue } from "@effects";

class SummonStatistic extends AttackStatistic {
  constructor(summon: SummonAttackPTR2e) {
    const { actor, item } = summon;
    if (!actor) throw Error("Attack must have an actor for Statistic to be created.");

    const modifiers: ModifierPTR2e[] = [];

    // Power and category based Modifiers
    if (summon.category !== "status") {
      if (summon.damageType === "power" && typeof summon.power === "number") {
        modifiers.push(
          new ModifierPTR2e({
            slug: `power`,
            label: game.i18n.localize("PTR2E.Modifiers.power"),
            modifier: summon.power!,
            method: "base",
            type: "power",
            hidden: true
          })
        );
      }
      else if (summon.damageType === "flat" && summon.damageFormula) {
        const modifier = SummonStatistic.resolveValue(summon.damageFormula, 0, { actor, item, attack: summon });
        if (typeof modifier === "number") {
          modifiers.push(
            new ModifierPTR2e({
              slug: `flat`,
              label: game.i18n.localize("PTR2E.Modifiers.flat"),
              modifier,
              method: "base",
              type: "damage",
              hidden: true
            })
          );
        }
      }
    }

    super(summon, {
      slug: summon.slug,
      label: summon.name,
      check: {
        type: "attack-roll",
      },
      defferedValueParams: {
        resolvables: {
          summon,
          actor,
          item
        },
        injectables: {
          summon,
          actor,
          item
        }
      },
      modifiers,
      domains: [
        `${summon.damageType}-damage-summon`,
        `${summon.targetType}-target-summon`
      ],
      rollOptions: []
    })
  }

  /**
   * Callback used to parse and look up values when calculating rules. Parses strings that look like
   * {actor|x.y.z}, {item|x.y.z} or {rule|x.y.z} where x.y.z is the path on the current actor, item or rule.
   * It's useful if you want to include something like the item's ID in a modifier selector (for applying the
   * modifier only to a specific weapon, for example), or include the item's name in some text.
   *
   * Example:
   * {
   *   "key": "PTR2e.RuleElement.Note",
   *   "selector": "water-attack",
   *   "text": "<b>{item|name}</b> Water attacks push the target 3 meters",
   *   "predicate": {
   *       "and": ["attack:type:water"]
   *   }
   * }
   *
   * @param source The string that is to be resolved
   * @param options.warn Whether to warn on a failed resolution
   * @return the looked up value on the specific object
   */
  static resolveInjectedProperties<T extends string | number | object | null | undefined>(
    source: T,
    injectables: { actor: ActorPTR2e; item: ItemPTR2e; attack: AttackPTR2e }
  ): T;
  static resolveInjectedProperties(
    source: string | number | object | null | undefined,
    injectables: { actor: ActorPTR2e; item: ItemPTR2e; attack: AttackPTR2e }
  ): string | number | object | null | undefined {
    if (
      source === null ||
      typeof source === "number" ||
      (typeof source === "string" && !source.includes("{"))
    ) {
      return source;
    }

    // Walk the object tree and resolve any string values found
    if (Array.isArray(source)) {
      for (let i = 0; i < source.length; i++) {
        source[i] = this.resolveInjectedProperties(source[i], injectables);
      }
    } else if (R.isPlainObject(source)) {
      for (const [key, value] of Object.entries(source)) {
        if (typeof value === "string" || isObject(value)) {
          source[key] = this.resolveInjectedProperties(value, injectables);
        }
      }
      return source;
    } else if (typeof source === "string") {
      return source.replace(
        /{(actor|item|attack)\|(.*?)}/g,
        (_match, key: string, prop: string) => {
          const data =
            key === "actor" || key === "item" || key === "attack"
              ? injectables[key]
              : injectables.attack;
          const value = fu.getProperty(data ?? {}, prop);
          return String(value);
        }
      );
    }

    return source;
  }

  /**
   * Parses the value attribute on a rule.
   *
   * @param valueData can be one of 3 different formats:
   * * {value: 5}: returns 5
   * * {value: "4 + @details.level.value"}: uses foundry's built in roll syntax to evaluate it
   * * {
   *      field: "item|data.level.value",
   *      brackets: [
   *          {start: 1, end: 4, value: 5}],
   *          {start: 5, end: 9, value: 10}],
   *   }: compares the value from field to >= start and <= end of a bracket and uses that value
   * @param defaultValue if no value is found, use that one
   * @return the evaluated value
   */
  static resolveValue(
    value: unknown,
    defaultValue: Exclude<RuleValue, BracketedValue> = 0,
    injectables: { actor: ActorPTR2e; item: ItemPTR2e; attack: AttackPTR2e },
    { evaluate = true, resolvables = {} }: ResolveValueParams = {}
  ): number | string | boolean | object | null {
    value ??= defaultValue ?? null;
    if (typeof value === "number" || typeof value === "boolean" || value === null) {
      return value;
    }
    value = this.resolveInjectedProperties(value, injectables);

    const resolvedFromBracket = isBracketedValue(value)
      ? this.#resolveBracketedValue(value, defaultValue, injectables)
      : value;
    if (typeof resolvedFromBracket === "number") return resolvedFromBracket;

    if (resolvedFromBracket instanceof Object) {
      return defaultValue instanceof Object
        ? fu.mergeObject(defaultValue, resolvedFromBracket, { inplace: false })
        : resolvedFromBracket;
    }

    if (typeof resolvedFromBracket === "string") {
      const saferEval = (formula: string): number => {
        try {
          // If any resolvables were not provided for this formula, return the default value
          const unresolveds = formula.match(/@[a-z0-9.]+/gi) ?? [];
          // Allow failure of "@target" and "@actor.conditions" with no warning
          if (unresolveds.length > 0) {
            return Number(defaultValue);
          }
          return Roll.safeEval(formula);
        } catch {
          return 0;
        }
      };

      const trimmed = resolvedFromBracket.trim();
      return (trimmed.includes("@") || /^-?\d+$/.test(trimmed)) && evaluate
        ? saferEval(
          Roll.replaceFormulaData(trimmed, {
            ...(injectables.actor?.getRollData() ?? []),
            item: injectables.item,
            attack: injectables.attack,
            ...resolvables,
          })
        )
        : trimmed;
    }

    return defaultValue;
  }

  static #resolveBracketedValue(
    value: BracketedValue,
    defaultValue: Exclude<RuleValue, BracketedValue>,
    injectables: { actor: ActorPTR2e; item: ItemPTR2e; attack: AttackPTR2e }
  ): Exclude<RuleValue, BracketedValue> {
    const bracketNumber = ((): number => {
      if (!value.field) return injectables.actor?.level ?? 0;
      const field = String(value.field);
      const separator = field.indexOf("|");
      const source = field.substring(0, separator);
      const { actor, item } = injectables;

      switch (source) {
        case "actor":
          return Number(fu.getProperty(actor ?? {}, field.substring(separator + 1))) || 0;
        case "item":
          return Number(fu.getProperty(item ?? {}, field.substring(separator + 1))) || 0;
        case "rule":
          return Number(fu.getProperty(this, field.substring(separator + 1))) || 0;
        default:
          return Number(fu.getProperty(actor ?? {}, field.substring(0))) || 0;
      }
    })();
    const brackets = value.brackets ?? [];
    // Set the fallthrough (the value set when no bracket matches) to be of the same type as the default value
    const bracketFallthrough = (() => {
      switch (typeof defaultValue) {
        case "number":
        case "boolean":
        case "object":
          return defaultValue;
        case "string":
          return Number.isNaN(Number(defaultValue)) ? defaultValue : Number(defaultValue);
        default:
          return null;
      }
    })();
    return (
      brackets.find((bracket) => {
        const start = bracket.start ?? 0;
        const end = bracket.end ?? Infinity;
        return start <= bracketNumber && end >= bracketNumber;
      })?.value ?? bracketFallthrough
    );
  }
}

export {
  SummonStatistic
}