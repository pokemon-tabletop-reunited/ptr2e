import { fields } from 'types/foundry/common/data/module.js';
import { PredicateField } from "@system/predication/schema-data-fields.ts";
import { _DataModel } from 'types/foundry/common/abstract/data.js';
import { ActorPTR2e } from '@actor';
import { ItemPTR2e } from '@item';
import { isBracketedValue, isObject } from '@utils';
import { BracketedValue, RuleValue } from '@module/effects/data.ts';
import { BaseActiveEffectSystem } from '@module/effects/models/base.ts';

export type ChangeModelOptions = {
    parent: ActorPTR2e | ItemPTR2e | undefined;
    strict?: boolean | undefined;
    sourceIndex?: number | undefined;
    suppressWarnings?: boolean | undefined;
};

interface ResolveValueParams {
    evaluate?: boolean;
    resolvables?: Record<string, unknown>;
    warn?: boolean;
}

export class ChangeModel extends foundry.abstract.DataModel<_DataModel, ChangeSchema> {
    declare parent: BaseActiveEffectSystem;

    sourceIndex: number | null;

    protected suppressWarnings: boolean;

    constructor(source: ChangeModel['_source'], options: ChangeModelOptions) {
        super(source, options);
        this.suppressWarnings = options.suppressWarnings ?? !this.actor?.id;
        this.sourceIndex = options.sourceIndex ?? null;
    }

    static override defineSchema(): ChangeSchema {
        const fields = foundry.data.fields;
        return {
            // Default Foundry Fields
            key: new fields.StringField({ required: true, label: "EFFECT.ChangeKey" }),
            value: new fields.StringField({ required: true, label: "EFFECT.ChangeValue" }),
            mode: new fields.NumberField({
                integer: true, initial: CONST.ACTIVE_EFFECT_MODES.ADD,
                label: "EFFECT.ChangeMode"
            }),
            priority: new fields.NumberField(),

            // Custom Fields
            predicate: new PredicateField(),
            ignored: new fields.BooleanField({ initial: false })
        }
    }

    /**
     * Unimplemented feature; allows for the merging of override changes.
     * If this ends up being a requirement, add a new field to the schema and remove this getter.
     */
    get merge() {
        return false;
    }

    get effect() {
        return this.parent.parent;
    }
    set effect(_) {
        return;
    }

    get actor() {
        return this.effect.targetsActor() ? this.effect.target : null;
    }

    get item() {
        const effect = this.effect;
        return effect.parent instanceof ItemPTR2e ? effect.parent : null;
    }

    /** Test this rule element's predicate, if present */
    public test(options: Iterable<string> | null) {
        if (this.ignored) return false;
        if (this.predicate.length === 0) return true;

        const optionSet = new Set([
            ...(options ?? this.actor?.getRollOptions() ?? []),
            ...(this.item?.getRollOptions() ?? [])
        ])

        return this.resolveInjectedProperties(this.predicate).test(optionSet);
    }

    /** Send a deferred warning to the console indicating that a rule element's validation failed */
    public failValidation(...message: string[]): void {
        const fullMessage = message.join(" ");
        const { name, uuid } = this.item ?? this.actor ?? {};
        if (!this.suppressWarnings) {
            const ruleName = game.i18n.localize(`PTR2e.RuleElement.${this.effect.type}`);
            this.actor?.synthetics.preparationWarnings.add(
                `PTR2e System | ${ruleName} rules element on item ${name} (${uuid}) failed to validate: ${fullMessage}`,
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
        options?: { warn?: boolean },
    ): T;
    resolveInjectedProperties(
        source: string | number | object | null | undefined,
        { warn = true } = {},
    ): string | number | object | null | undefined {
        if (source === null || typeof source === "number" || (typeof source === "string" && !source.includes("{"))) {
            return source;
        }

        // Walk the object tree and resolve any string values found
        if (Array.isArray(source)) {
            for (let i = 0; i < source.length; i++) {
                source[i] = this.resolveInjectedProperties(source[i], { warn });
            }
        } else if (isObject(source)) {
            for (const [key, value] of Object.entries(source)) {
                if (typeof value === "string" || isObject(value)) {
                    source[key] = this.resolveInjectedProperties(value, { warn });
                }
            }

            return source;
        } else if (typeof source === "string") {
            return source.replace(/{(actor|item|rule)\|(.*?)}/g, (_match, key: string, prop: string) => {
                const data = key === "rule" ? this : key === "actor" || key === "item" ? this[key] : this.item;
                const value = fu.getProperty(data ?? {}, prop);
                if (value === undefined) {
                    this.ignored = true;
                    if (warn) this.failValidation(`Failed to resolve injected property "${source}"`);
                }
                return String(value);
            });
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
        { evaluate = true, resolvables = {}, warn = true }: ResolveValueParams = {},
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
                            !unresolveds.every((u) => u.startsWith("@target.") || u.startsWith("@actor.conditions."));
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
                    }),
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
        defaultValue: Exclude<RuleValue, BracketedValue>,
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

export interface ChangeModel extends foundry.abstract.DataModel<_DataModel, ChangeSchema>, ModelPropsFromSchema<ChangeSchema> {

}

export type ChangeSchema = {
    key: fields.StringField<string, string, true, false, false>
    value: fields.StringField<string, string, true, false, false>
    mode: fields.NumberField<ActiveEffectChangeMode, ActiveEffectChangeMode, false, false, true>
    priority: fields.NumberField;
    predicate: PredicateField;
    ignored: fields.BooleanField;
};