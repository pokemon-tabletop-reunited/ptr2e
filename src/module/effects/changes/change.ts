import { isBracketedValue, isObject, reduceItemName, sluggify } from "@utils";
import { BracketedValue, RuleValue } from "@module/effects/data.ts";
import { ActiveEffectSystem, EffectSourcePTR2e } from "@effects";
import { PredicateField } from "@system/predication/schema-data-fields.ts";
import { EffectPTR2e, ItemPTR2e, ItemSourcePTR2e } from "@item";
import { ActorPTR2e } from "@actor";
import { ChangeModelOptions, ChangeSchema, ChangeSource, ResolveValueParams } from "./data.ts";
import { DataModelValidationOptions } from "types/foundry/common/abstract/data.js";
import * as R from "remeda";
import ResolvableValueField from "@module/data/fields/resolvable-value-field.ts";
import { ChangeModelTypes } from "@data";

class ChangeModel<TSchema extends ChangeSchema = ChangeSchema> extends foundry.abstract.DataModel<
    ActiveEffectSystem,
    TSchema
> {
    static TYPE = "";

    static get label() {
        return "PTR2E.Effect.FIELDS.ChangeType."+this.TYPE;
    }

    get sourceIndex(): number | null {
        return this.#sourceIndex ?? this.effect.changes.indexOf(this);
    }

    #sourceIndex: number | null = null;

    protected suppressWarnings = false;

    constructor(source: ChangeSource, options: ChangeModelOptions) {
        super(source, options);

        if (this.invalid) {
            this.ignored = true;
            return;
        }

        // Always suppress warnings if the actor has no ID (and is therefore a temporary clone)
        this.suppressWarnings = options.suppressWarnings ?? !this.actor?.id;
        this.#sourceIndex = options.sourceIndex ?? null;

        this.label = this.label
            ? game.i18n.format(this.resolveInjectedProperties(this.label), {
                  actor: this.actor?.name ?? null,
                  item: this.item?.name ?? null,
              })
            : this.effect.name;
    }

    static override defineSchema(): ChangeSchema {
        const fields = foundry.data.fields;
        return {
            // Default Foundry Fields
            key: new fields.StringField({
                required: true,
                label: "PTR2E.Effect.FIELDS.ChangeKey.label",
                hint: "PTR2E.Effect.FIELDS.ChangeKey.hint",
                initial: ""
            }),
            value: new ResolvableValueField({
                required: true,
                nullable: false,
                initial: "",
                label: "PTR2E.Effect.FIELDS.ChangeValue.label",
                hint: "PTR2E.Effect.FIELDS.ChangeValue.hint",
            }),
            mode: new fields.NumberField({
                integer: true,
                initial: CONST.ACTIVE_EFFECT_MODES.ADD,
                choices: Object.fromEntries(Object.entries(CONST.ACTIVE_EFFECT_MODES).map(([k, v]) => [v, k])),
                label: "PTR2E.Effect.FIELDS.ChangeMode.label",
                hint: "PTR2E.Effect.FIELDS.ChangeMode.hint",
            }),
            priority: new fields.NumberField({}),

            // Type field
            type: new fields.StringField({
                required: true,
                blank: false,
                initial: this.TYPE,
                choices: ChangeModelTypes,
                validate: (value) => value === this.TYPE,
                validationError: `must be equal to "${this.TYPE}"`,
                label: "PTR2E.Effect.FIELDS.ChangeType.label",
                // hint: "PTR2E.Effect.FIELDS.ChangeType.hint",
            }),

            // Custom Fields
            label: new fields.StringField({
                required: false,
                nullable: false,
                blank: false,
                initial: undefined,
                label: "PTR2E.Effect.FIELDS.ChangeLabel.label",
                // hint: "PTR2E.Effect.FIELDS.ChangeLabel.hint",
            }),
            predicate: new PredicateField(),
            ignored: new fields.BooleanField({ initial: false }),
        };
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

    get slug() {
        return sluggify(this.getReducedLabel());
    }

    protected getReducedLabel(label = this.label): string {
        return label === this.effect.name ? reduceItemName(label) : label;
    }

    /** Include parent effect name & UUID in `DataModel` validation error messages. */
    override validate(options?: DataModelValidationOptions | undefined): boolean {
        try {
            return super.validate(options);
        } catch (error) {
            if (error instanceof foundry.data.validation.DataModelValidationError) {
                const message = error.message.replace(
                    /validation errors|Joint Validation Error/,
                    `validation errors on effect ${this.effect.name} (${this.effect.uuid})`
                );
                console.warn(message);
                return false;
            } else {
                throw error;
            }
        }
    }

    public apply(_: ActorPTR2e, __?: string[] | Set<string>): unknown {
        throw new Error("The apply method must be implemented by the subclass");
    }

    /** Test this rule element's predicate, if present */
    public test(options?: Iterable<string> | null) {
        if (this.ignored) return false;
        if (this.predicate.length === 0) return true;

        const optionSet = new Set([
            ...(options ?? this.actor?.getRollOptions() ?? []),
            ...(this.item?.getRollOptions() ?? []),
        ]);

        return this.resolveInjectedProperties(this.predicate).test(optionSet);
    }

    /** Send a deferred warning to the console indicating that a rule element's validation failed */
    public failValidation(...message: string[]): void {
        const fullMessage = message.join(" ");
        const { name, uuid } = this.effect;
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
        } else if (R.isObject(source)) {
            for (const [key, value] of Object.entries(source)) {
                if (typeof value === "string" || isObject(value)) {
                    source[key] = this.resolveInjectedProperties(value, { warn });
                }
            }

            return source;
        } else if (typeof source === "string") {
            return source.replace(
                /{(actor|item|rule)\|(.*?)}/g,
                (_match, key: string, prop: string) => {
                    const data =
                        key === "rule"
                            ? this
                            : key === "actor" || key === "item"
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

    getRollOptions(): string[] {
        return this.effect.getRollOptions();
    }
}

interface ChangeModel<TSchema extends ChangeSchema = ChangeSchema>
    extends foundry.abstract.DataModel<ActiveEffectSystem, TSchema>,
        ModelPropsFromSchema<ChangeSchema> {
    constructor: typeof ChangeModel<TSchema>;

    value: string | number;

    /**
     * Run between Actor#applyActiveEffects and Actor#prepareDerivedData. Generally limited to ActiveEffect-Like
     * elements
     */
    onApplyActiveEffects?(): void;

    /**
     * Run in Actor#prepareDerivedData which is similar to an init method and is the very first thing that is run after
     * an actor.update() was called. Use this hook if you want to save or modify values on the actual data objects
     * after actor changes. Those values should not be saved back to the actor unless we mess up.
     *
     * This callback is run for each rule in random order and is run very often, so watch out for performance.
     */
    beforePrepareData?(): void;

    /** Run after all actor preparation callbacks have been run so you should see all final values here. */
    afterPrepareData?(): void;

    /**
     * Run just prior to a check roll, passing along roll options already accumulated
     * @param domains Applicable predication domains for pending check
     * @param rollOptions Currently accumulated roll options for the pending check
     */
    beforeRoll?(domains: string[], rollOptions: Set<string>): void;

    /**
     * Run following a check roll, passing along roll options already accumulated
     * @param domains Applicable selectors for the pending check
     * @param domains Applicable predication domains for pending check
     * @param rollOptions Currently accumulated roll options for the pending check
     */
    afterRoll?(params: ChangeModel.AfterRollParams): Promise<void>;

    /** Runs before the rule's parent effect's owning actor is updated */
    preUpdateActor?(): Promise<{ create: ItemSourcePTR2e[]; delete: string[] }>;

    /**
     * Runs before this rules element's parent effect is created. The effect is temporarilly constructed. A rule element can
     * alter itself before its parent effect is stored on a document; it can also alter the effect source itself in the same
     * manner.
     */
    preCreate?({
        changeSource,
        effectSource,
        pendingItems,
        context,
    }: ChangeModel.PreCreateParams): Promise<void>;

    /**
     * Runs before this rules element's parent item is created. The item is temporarilly constructed. A rule element can
     * alter itself before its parent item is stored on an actor; it can also alter the item source itself in the same
     * manner.
     */
    preDelete?({ pendingItems, context }: ChangeModel.PreDeleteParams): Promise<void>;

    /**
     * Runs before this rules element's parent item is updated */
    preUpdate?(changes: DeepPartial<EffectPTR2e>): Promise<void>;

    /**
     * Runs after an item holding this rule is added to an actor. If you modify or add the rule after the item
     * is already present on the actor, nothing will happen. Rules that add toggles won't work here since this method is
     * only called on item add.
     *
     * @param actorUpdates The first time a rule is run it receives an empty object. After all rules set various values
     * on the object, this object is then passed to actor.update(). This is useful if you want to set specific values on
     * the actor when an item is added. Keep in mind that the object for actor.update() is flattened, e.g.
     * {'data.attributes.hp.value': 5}.
     */
    onCreate?(actorUpdates: Record<string, unknown>): void;

    /**
     * Run at certain encounter events, such as the start of the actor's turn. Similar to onCreate and onDelete, this provides an opportunity to make
     * updates to the actor.
     * @param data.event        The type of event that triggered this callback
     * @param data.actorUpdates A record containing update data for the actor
     */
    onUpdateEncounter?(data: {
        event: "initiative-roll" | "turn-start";
        actorUpdates: Record<string, unknown>;
    }): Promise<void>;

    /**
     * Runs after an item holding this rule is removed from an actor. This method is used for cleaning up any values
     * on the actorData or token objects (e.g., removing temp HP).
     *
     * @param actorData data of the actor that holds the item
     * @param item the removed item data
     * @param actorUpdates see onCreate
     * @param tokens see onCreate
     */
    onDelete?(actorUpdates: Record<string, unknown>): void;
}

namespace ChangeModel {
    export interface PreCreateParams<T extends ChangeSource = ChangeSource> {
        /** The source partial of the rule element's parent effect to be created */
        effectSource: EffectSourcePTR2e;
        /** The source of the change in `effectSource`'s `system.changes` array */
        changeSource: T;
        /** All effects pending creation in a `ActiveEffectPTR2e.createDocuments` call */
        pendingEffects: EffectSourcePTR2e[];
        /** All items pending creation in a `ActiveEffectPTR2e.createDocuments` call */
        pendingItems: ItemSourcePTR2e[];
        /** Items temporarily constructed from pending item source */
        tempItems: ItemPTR2e[];
        /** The context object from the `ItemPTR2e.createDocuments` call */
        context: DocumentModificationContext<ActorPTR2e | ItemPTR2e | null>;
        /** Whether this preCreate run is from a pre-update reevaluation */
        reevaluation?: boolean;
    }

    export interface PreDeleteParams {
        /** All items pending deletion in a `ItemPTR2e.deleteDocuments` call */
        pendingItems: ItemPTR2e[];
        /** The context object from the `ItemPTR2e.deleteDocuments` call */
        context: DocumentModificationContext<ActorPTR2e | null>;
    }

    export interface AfterRollParams {}
}

export default ChangeModel;
