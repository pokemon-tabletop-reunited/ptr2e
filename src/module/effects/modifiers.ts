import { Predicate, RawPredicate } from "@system/predication/predication.ts";
import { DamageAlteration } from "./alterations/damage.ts";
import ChangeModel from "./changes/change.ts";
import { signedInteger, sluggify } from "@utils";
import { ItemPTR2e } from "@item";
import * as R from "remeda";
import { RollNote } from "@system/notes.ts";

interface RawModifier {
    /** An identifier for this modifier; should generally be a localization key (see en.json). */
    slug?: string;
    /** The domains of discourse to which this modifier belongs */
    domains?: string[];
    /** The display name of this modifier; can be a localization key (see en.json). */
    label: string;
    /** The actual numeric benefit/penalty that this modifier provides. */
    modifier: number;
    /** Numeric adjustments to apply */
    adjustments?: ModifierAdjustment[];
    /** If true, these custom dice are being ignored in the damage calculation. */
    ignored?: boolean;
    /** A predicate which determines when this modifier is active. */
    predicate?: RawPredicate;
    /** If true, this modifier is only active on a critical hit. */
    critical?: boolean | null;
    /** The list of traits that this modifier gives to the underlying attack, if any. */
    traits?: string[];
    /** Hide this modifier in UIs if it is disabled */
    hideIfDisabled?: boolean;
    /** If this modifier should not show up in the prompt regardless of whether it's disabled */
    hidden?: boolean;
    /** The method of application of this modifier */
    method?: "base" | "flat" | "percentile" | "stage";
    /** The type of roll this modifier applies to, any if not relevant. */
    type?: "any" | "damage" | "accuracy" | "evasion" | "crit"
}

interface ModifierAdjustment {
    slug: string | null;
    test: (options: Iterable<string>) => boolean;
    relabel?: string;
    suppress?: boolean;
    getNewValue?: (current: number) => number;
}

interface DeferredValueParams {
    /** An object to merge into roll data for `Roll.replaceFormulaData` */
    resolvables?: Record<string, unknown>;
    /** An object to merge into standard options for `RuleElementPTR2e#resolveInjectedProperties` */
    injectables?: Record<string, unknown>;
    /** Roll Options to get against a predicate (if available) */
    test?: string[] | Set<string>;
}

interface TestableDeferredValueParams extends DeferredValueParams {
    test: string[] | Set<string>;
}

type DeferredValue<T> = (options?: DeferredValueParams) => T | null;
type DeferredPromise<T> = (options?: DeferredValueParams) => Promise<T | null>;

class ModifierPTR2e implements RawModifier {
    slug: string;
    label: string;
    domains: string[];
    /** The value of the modifier */
    modifier: number;
    /** The value before adjustments are applied */
    #originalValue: number;

    adjustments: ModifierAdjustment[];
    alterations: DamageAlteration[];
    ignored: boolean;
    /** The originating rule element of this modifier, if any: used to retrieve "parent" item roll options */
    change: ChangeModel | null;
    
    predicate: Predicate;
    critical: boolean | null;
    traits: string[];
    hideIfDisabled: boolean;
    /** If this modifier should not show up in the prompt regardless of whether it's disabled */
    hidden: boolean;
    appliesTo: Map<ActorUUID, boolean>;

    method: "base" | "flat" | "percentile" | "stage";
    type: "any" | "damage" | "accuracy" | "evasion" | "crit"

    /**
     * The "category" of modifier (a misnomer since bonuses and penalties aren't modifiers):
     * Recorded before adjustments in case of adjustment to zero
     */
    kind: "bonus" | "penalty" | "modifier";


    /**
     * Create a new modifier.
     */
    constructor(args: ModifierObjectParams) {
        this.label = game.i18n.localize(args.label)
        this.slug = sluggify(args.slug ?? this.label);

        this.#originalValue = this.modifier = args.modifier;

        this.domains = args.domains ?? [];
        this.adjustments = fu.deepClone(args.adjustments ?? []);
        this.alterations = [args.alterations ?? []].flat();
        this.ignored = args.ignored ?? false;
        this.predicate = new Predicate(args.predicate ?? []);
        this.traits = fu.deepClone(args.traits ?? []);
        this.hideIfDisabled = args.hideIfDisabled ?? false;
        this.critical = args.critical ?? null;
        this.hidden = args.hidden ?? false;
        this.method = args.method ?? "percentile";
        this.type = args.type ?? "any";
        this.appliesTo = args.appliesTo ?? new Map();
        
        this.change = args.change ?? null;
        // Prevent upstream from blindly diving into recursion loops
        Object.defineProperty(this, "change", { enumerable: false });

        this.kind = (() => {
            if(this.modifier >= 0) return "bonus";
            if(this.modifier < 0) return "penalty";
            return "modifier";
        })();
    }

    get value(): number {
        return this.kind === "penalty" && this.modifier === 0 ? -this.modifier : this.modifier;
    }

    get signedValue(): string {
        return this.modifier === 0 && this.kind === "penalty"
            ? signedInteger(-this.modifier)
            : signedInteger(this.modifier);
    }

    /**
     * Apply damage alterations: must be called externally by client code that knows this is a damage modifier.
     * @param options.item An item producing damage as part of an action
     * @param options.test An `Array` or `Set` of roll options for use in predication testing
     */
    applyDamageAlterations(options: { item: ItemPTR2e; test: Iterable<string> }): void {
        for (const alteration of this.alterations) {
            alteration.applyTo(this, options);
        }
    }

    /** Return a copy of this ModifierPTR2e instance */
    clone(options: {test?: Iterable<string>} = {}): ModifierPTR2e {
        const clone = new ModifierPTR2e(fu.mergeObject({...this, modifier: this.#originalValue}));
        if(options.test) clone.test(options.test);

        return clone;
    }

    /**
     * Get roll options for this modifier. The current data structure makes for occasional inability to distinguish
     * bonuses and penalties.
     */
    getRollOptions(): string[] {
        const options = (["slug","value"] as const).map(p => `${this.kind}:${p}:{${this[p]}}`);

        const damageKinds = R.compact([
            this.domains.some((d) => /\bdamage$/.test(d)) ? "damage" : null,
            this.domains.some((d) => /\bhealing$/.test(d)) ? "healing" : null,
        ]);

        for(const kind of damageKinds) {
            options.push(kind);
            options.push(`${this.kind}:${kind}`);
        }

        return options;
    }

    test(options: Iterable<string>): void {
        if(this.predicate.length === 0) return;
        const rollOptions = this.change ? [...options, ...this.change.getRollOptions()] : options;
        this.ignored = !this.predicate.test(rollOptions);
    }

    toObject(): Required<RawModifier> {
        return {
            ...R.omit(this, ["alterations", "predicate", "change"]),
            predicate: this.predicate.toObject()
        }
    }

    toString() {
        return this.label;
    }
}

/**
 * Represents a statistic on an actor and its commonly applied modifiers. Each statistic or check can have multiple
 * modifiers, even of the same type, but the stacking rules are applied to ensure that only a single bonus and penalty
 * of each type is applied to the total modifier.
 */
class StatisticModifier {
    /** The slug of this collection of modifiers for a statistic. */
    slug: string;
    /** The display label of this statistic */
    declare label?: string;
    /** The list of modifiers which affect the statistic. */
    protected _modifiers: ModifierPTR2e[];
    /** The total modifier for the statistic, after applying stacking rules. */
    declare totalModifier: number;
    /** A textual breakdown of the modifiers factoring into this statistic */
    breakdown = "";
    /** Optional notes, which are often added to statistic modifiers */
    notes?: RollNote[];
    /** Total Modifiers for in use with the Attack Statistic. */
    protected totalModifiers: Record<ModifierPTR2e['type'], Record<ModifierPTR2e['method'], number>> | null;

    /**
     * @param slug The name of this collection of statistic modifiers.
     * @param modifiers All relevant modifiers for this statistic.
     * @param rollOptions Roll options used for initial total calculation
     */
    constructor(slug: string, modifiers: ModifierPTR2e[] = [], rollOptions: string[] | Set<string> = new Set()) {
        rollOptions = rollOptions instanceof Set ? rollOptions : new Set(rollOptions);
        this.slug = slug;

        // De-duplication. Prefer higher valued
        const seen = modifiers.reduce((result: Record<string, ModifierPTR2e>, modifier) => {
            const existing = result[modifier.slug];
            if (!existing || existing.ignored || Math.abs(modifier.modifier) > Math.abs(result[modifier.slug].modifier)) {
                result[modifier.slug] = modifier;
            }
            return result;
        }, {});
        this._modifiers = Object.values(seen);

        this.calculateTotal(rollOptions);
    }

    /** Get the list of all modifiers in this collection */
    get modifiers(): ModifierPTR2e[] {
        return [...this._modifiers];
    }

    get signedTotal(): string {
        return signedInteger(this.totalModifier);
    }

    /** Add a modifier to the end of this collection. */
    push(modifier: ModifierPTR2e): number {
        // de-duplication. If an existing one exists, replace if higher valued
        const existingIdx = this._modifiers.findIndex((o) => o.slug === modifier.slug);
        const existing = this._modifiers[existingIdx];
        if (!existing) {
            this._modifiers.push(modifier);
            this.calculateTotal();
        } else if (Math.abs(modifier.modifier) > Math.abs(existing.modifier)) {
            this._modifiers[existingIdx] = modifier;
            this.calculateTotal();
        }

        return this._modifiers.length;
    }

    /** Add a modifier to the beginning of this collection. */
    unshift(modifier: ModifierPTR2e): number {
        // de-duplication
        if (this._modifiers.find((o) => o.slug === modifier.slug) === undefined) {
            this._modifiers.unshift(modifier);
            this.calculateTotal();
        }
        return this._modifiers.length;
    }

    /** Delete a modifier from this collection by name or reference */
    delete(modifierSlug: string | ModifierPTR2e): boolean {
        const toDelete =
            typeof modifierSlug === "object"
                ? modifierSlug
                : this._modifiers.find((modifier) => modifier.slug === modifierSlug);
        const wasDeleted =
            toDelete && this._modifiers.includes(toDelete)
                ? !!this._modifiers.findSplice((modifier) => modifier === toDelete)
                : false;
        if (wasDeleted) this.calculateTotal();

        return wasDeleted;
    }

    /** Obtain the total modifier, optionally retesting predicates, and finally applying stacking rules. */
    calculateTotal(rollOptions: Set<string> = new Set()): void {
        if (rollOptions.size > 0) {
            for (const modifier of this._modifiers) {
                modifier.test(rollOptions);
            }

            adjustModifiers(this._modifiers, rollOptions);
        }
        
        this.totalModifier = this._modifiers.filter((m) => !m.ignored).reduce((total, m) => total + m.modifier, 0);
    }
}

function adjustModifiers(modifiers: ModifierPTR2e[], rollOptions: Set<string>): void {
    for (const modifier of [...modifiers].sort((a, b) => Math.abs(b.value) - Math.abs(a.value))) {
        const allRollOptions = [...rollOptions, ...modifier.getRollOptions()];
        const adjustments = modifier.adjustments.filter((a) => a.test(allRollOptions));
        if (adjustments.some((a) => a.suppress)) {
            modifier.ignored = true;
            continue;
        }

        type ResolvedAdjustment = { value: number; relabel: string | null };
        const resolvedAdjustment = adjustments.reduce(
            (resolved: ResolvedAdjustment, adjustment) => {
                const newValue = adjustment.getNewValue?.(resolved.value) ?? resolved.value;
                if (newValue !== resolved.value) {
                    resolved.value = newValue;
                    resolved.relabel = adjustment.relabel ?? null;
                }
                return resolved;
            },
            { value: modifier.modifier, relabel: null },
        );
        modifier.modifier = resolvedAdjustment.value;

        if (resolvedAdjustment.relabel) {
            modifier.label = game.i18n.localize(resolvedAdjustment.relabel);
        }

        //TODO: Check if we can reuse this for type resolution
        // // If applicable, change the damage type of this modifier, using only the final adjustment found
        // modifier.damageType = adjustments.reduce(
        //     (damageType: DamageType | null, adjustment) => adjustment.getDamageType?.(damageType) ?? damageType,
        //     modifier.damageType,
        // );
    }
}

/**
 * Represents the list of modifiers for a specific check.
 */
class CheckModifier extends StatisticModifier {
    /**
     * @param slug The unique slug of this check modifier
     * @param statistic The statistic modifier to copy fields from
     * @param modifiers Additional modifiers to add to this check
     */
    constructor(
        slug: string,
        statistic: { modifiers: readonly ModifierPTR2e[] },
        modifiers: ModifierPTR2e[] = [],
        rollOptions: string[] | Set<string> = new Set(),
    ) {
        const baseModifiers = statistic.modifiers
            .filter((modifier: unknown) => {
                if (modifier instanceof ModifierPTR2e) return true;
                if (R.isObject(modifier) && "slug" in modifier && typeof modifier.slug === "string") {
                    ui.notifications.error(`Unsupported modifier object (slug: ${modifier.slug}) passed`);
                }
                return false;
            })
            .map((m) => m.clone());
        super(slug, baseModifiers.concat(modifiers), rollOptions);
    }
}

class AttackCheckModifier extends CheckModifier {
    declare protected totalModifiers: Record<ModifierPTR2e['type'], Record<ModifierPTR2e['method'], number>>;
    
    get total() {
        return this.totalModifiers;
    }

    override calculateTotal(rollOptions: Set<string> = new Set()): void {
        if (rollOptions.size > 0) {
            for (const modifier of this._modifiers) {
                modifier.test(rollOptions);
            }

            adjustModifiers(this._modifiers, rollOptions);
        }

        this.totalModifiers = this._modifiers.filter(m => !m.ignored).reduce((acc, modifier) => {
            acc[modifier.type] ??= {
                base: 0,
                flat: 0,
                stage: 0,
                percentile: 1,
            };
            switch(modifier.method) {
                case "base":
                case "flat":
                case "stage":
                    acc[modifier.type][modifier.method] += modifier.modifier;
                    break;
                case "percentile":
                    acc[modifier.type][modifier.method] *= (modifier.modifier >= 1 ? modifier.modifier / 100 : modifier.modifier);
                    break;
            }
            return acc;
        }, {} as Record<ModifierPTR2e['type'], Record<ModifierPTR2e['method'], number>>);
    }
}

interface ModifierObjectParams extends RawModifier {
    change?: ChangeModel | null;
    alterations?: DamageAlteration[];
    /** 
     * In the case of a roll with multiple targets, 
     * this modifier should only be applied to attacks against the specified targets.
     * but is still affecting the attacker.
     * 
     * @remarks 
     * the string key is the target's UUID
     * the boolean value is whether the modifier applies to that target 
     * (like 'ignored' can be toggled with the modifier popup)
     * */
    appliesTo?: Maybe<Map<ActorUUID, boolean>>;
}

export { ModifierPTR2e, StatisticModifier, CheckModifier, AttackCheckModifier, adjustModifiers };
export type {
    ModifierAdjustment,
    RawModifier,
    DeferredValueParams,
    TestableDeferredValueParams,
    DeferredValue,
    DeferredPromise,
};

//@ts-ignore
globalThis.ModifierPTR2e = ModifierPTR2e;
//@ts-ignore
globalThis.CheckModifier = CheckModifier;