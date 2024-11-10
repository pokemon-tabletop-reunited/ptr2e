import ResolvableValueField from "@module/data/fields/resolvable-value-field.ts";
import ChangeModel from "../changes/change.ts";
import { ItemPTR2e, ItemSourcePTR2e } from "@item";
import { StringField } from "types/foundry/common/data/fields.js";
import { BasicChangeSystem, ResolveValueParams } from "@data";
import { BracketedValue, RuleValue } from "../data.ts";
import { isBracketedValue, isObject } from "@utils";
import * as R from "remeda";

class AttackAlteration extends foundry.abstract.DataModel<ChangeModel> {

  static VALID_PROPERTIES = new Set([
    "power",
    "accuracy",
    "type",
    "traits",
    "pp-cost",
    "range",
    "rip"
] as const);

  static override defineSchema() {
    const fields = foundry.data.fields;
    return {
      mode: new fields.NumberField({
        required: true,
        initial: CONST.ACTIVE_EFFECT_MODES.ADD,
        choices: Object.fromEntries(Object.entries(CONST.ACTIVE_EFFECT_MODES).map(([k, v]) => [v, k])),
      }),
      property: new fields.StringField({
        required: true,
        choices: Array.from(this.VALID_PROPERTIES),
        initial: undefined,
      }),
      value: new ResolvableValueField<true,false,true>({
        required: true,
        nullable: false,
        initial: "",
      })
    }
  }

  get change(): ChangeModel {
    return this.parent;
  }

  get effect() {
    return this.change.effect;
  }

  get actor() {
    return this.change.actor;
  }

  applyTo(item: ItemPTR2e | ItemSourcePTR2e): void {
    if(item instanceof ItemPTR2e) {
      return this.applyToItem(item);
    }

    const property = item.type === "effect" && !this.property.startsWith("effects.") ? `effects.0.${this.property}` : this.property;
    const current = fu.getProperty(item, property);
    const value = typeof this.value === "boolean" ? this.value : this.resolveInjectedProperties(this.value);
    const change = BasicChangeSystem.getNewValue(this.mode, current, value, false)
    fu.setProperty(item, property, change);
  }

  applyToItem(item: ItemPTR2e): void {
    const source = item.toObject();

    let field: ReturnType<foundry.abstract.DataModel["schema"]["getField"]>;
    const changes: Record<string, unknown> = {};

    const property = item.type === "effect" && !this.property.startsWith("effects.") ? `effects.0.${this.property}` : this.property;

    if(property.startsWith("system.")) {
      if(item.system instanceof foundry.abstract.DataModel) {
        field = item.system.schema.getField(property.slice(7));
      }
    } else field = item.schema.getField(property);
    if(field) changes[property] = this.applyField(source, item, property, field);
    
    if(Object.keys(changes).length > 0) item.update(changes);
  }

  applyField(source: ItemPTR2e['_source'], item: ItemPTR2e, property: string, field: ReturnType<foundry.abstract.DataModel["schema"]["getField"]>): unknown {
    field ??= item.schema.getField(property);
    const current = fu.getProperty(source, property);
    const value = typeof this.value === "boolean" ? this.value : this.resolveInjectedProperties(this.value);
    const update = field?.applyChange(current, item, {key: property, mode: this.mode, value, priority: 0});
    fu.setProperty(source, property, update);
    return update;
  }

  /** Send a deferred warning to the console indicating that a rule element's validation failed */
  public failValidation(...message: string[]): void {
    const fullMessage = message.join(" ");
    const { name, uuid } = this.change;
    if (!this.suppressWarnings) {
      const ruleName = game.i18n.localize(`PTR2E.RuleElement.${this.effect.type}`);
      this.actor?.synthetics.preparationWarnings.add(
        `PTR2e System | ${ruleName} rules element on effect ${name} (${uuid}) failed to validate: ${fullMessage}`
      );
      const { DataModelValidationFailure } = foundry.data.validation;
      this.validationFailures.joint ??= new DataModelValidationFailure({
        message: fullMessage,
        unresolved: true,
      });
    }
    this.ignored = true;
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
  resolveInjectedProperties<T extends string | number | object | null | undefined>(
    source: T,
    options?: { warn?: boolean }
  ): T;
  resolveInjectedProperties(
    source: string | number | object | null | undefined,
    { warn = true } = {}
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
        source[i] = this.resolveInjectedProperties(source[i], { warn });
      }
    } else if (R.isPlainObject(source)) {
      for (const [key, value] of Object.entries(source)) {
        if (typeof value === "string" || isObject(value)) {
          source[key] = this.resolveInjectedProperties(value, { warn });
        }
      }
      return source;
    } else if (typeof source === "string") {
      return source.replace(
        /{(actor|item|change|effect)\|(.*?)}/g,
        (_match, key: string, prop: string) => {
          const data =
            key === "change"
              ? this
              : key === "actor" || key === "item" || key === "effect"
                ? this[key]
                : this.effect;
          const value = fu.getProperty(data ?? {}, prop);
          if (value === undefined) {
            this.ignored = true;
            if (warn)
              this.failValidation(`Failed to resolve injected property "${source}"`);
          }
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
  resolveValue(
    value: unknown,
    defaultValue: Exclude<RuleValue, BracketedValue> = 0,
    { evaluate = true, resolvables = {}, warn = true }: ResolveValueParams = {}
  ): number | string | boolean | object | null {
    value ??= defaultValue ?? null;
    if (typeof value === "number" || typeof value === "boolean" || value === null) {
      return value;
    }
    value = this.resolveInjectedProperties(value, { warn });

    const resolvedFromBracket = this.isBracketedValue(value)
      ? this.#resolveBracketedValue(value, defaultValue)
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
            const shouldWarn =
              warn &&
              !unresolveds.every(
                (u) =>
                  u.startsWith("@target.") || u.startsWith("@actor.conditions.")
              );
            this.ignored = true;
            if (shouldWarn) {
              this.failValidation(`unable to resolve formula, "${formula}"`);
            }
            return Number(defaultValue);
          }
          return Roll.safeEval(formula);
        } catch {
          this.failValidation(`unable to evaluate formula, "${formula}"`);
          return 0;
        }
      };

      const trimmed = resolvedFromBracket.trim();
      return (trimmed.includes("@") || /^-?\d+$/.test(trimmed)) && evaluate
        ? saferEval(
          Roll.replaceFormulaData(trimmed, {
            ...(this.actor?.getRollData() ?? []),
            item: this.item,
            ...resolvables,
          })
        )
        : trimmed;
    }

    return defaultValue;
  }

  protected isBracketedValue(value: unknown): value is BracketedValue {
    return isBracketedValue(value);
  }

  #resolveBracketedValue(
    value: BracketedValue,
    defaultValue: Exclude<RuleValue, BracketedValue>
  ): Exclude<RuleValue, BracketedValue> {
    const bracketNumber = ((): number => {
      if (!value.field) return this.actor?.level ?? 0;
      const field = String(value.field);
      const separator = field.indexOf("|");
      const source = field.substring(0, separator);
      const { actor, item } = this;

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

interface AttackAlteration extends foundry.abstract.DataModel<ChangeModel>, ModelPropsFromSchema<AttackAlterationSchema> { }

interface AttackAlterationSchema extends foundry.data.fields.DataSchema {
  mode: foundry.data.fields.NumberField<ActiveEffectChangeMode, ActiveEffectChangeMode, false, false, true>
  property: StringField<string, string, true, false, true>;
  value: ResolvableValueField<true, false, true>;
}

export { AttackAlteration }
export type { AttackAlterationSchema }