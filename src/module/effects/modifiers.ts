import { Predicate, RawPredicate } from "@system/predication/predication.ts";
import { DamageAlteration } from "./alteration.ts";
import ChangeModel from "./changes/change.ts";
import { signedInteger, sluggify } from "@utils";
import { ItemPTR2e } from "@item";
import * as R from "remeda";

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
    /** If true, this modifier will be applied to the final roll; if false, it will be ignored. */
    enabled?: boolean;
    /** If true, these custom dice are being ignored in the damage calculation. */
    ignored?: boolean;
    /** The source from which this modifier originates, if any. */
    source?: string | null;
    /** A predicate which determines when this modifier is active. */
    predicate?: RawPredicate;
    /** If true, this modifier is only active on a critical hit. */
    critical?: boolean | null;
    /** The list of traits that this modifier gives to the underlying attack, if any. */
    traits?: string[];
    /** Hide this modifier in UIs if it is disabled */
    hideIfDisabled?: boolean;
}

interface ModifierAdjustment {
    slug: string | null;
    test: (options: Iterable<string>) => boolean;
    relabel?: string;
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
    enabled: boolean;
    ignored: boolean;
    /** The originating rule element of this modifier, if any: used to retrieve "parent" item roll options */
    change: ChangeModel | null;
    source: string | null;
    
    predicate: Predicate;
    critical: boolean | null;
    traits: string[];
    hideIfDisabled: boolean;

    /**
     * The "category" of modifier (a misnomer since bonuses and penalties aren't modifiers):
     * Recorded before adjustments in case of adjustment to zero
     */
    kind: "bonus" | "penalty" | "modifier";


    /**
     * Create a new modifier.
     * Legacy parameters:
     * @param name The name for the modifier; should generally be a localization key.
     * @param modifier The actual numeric benefit/penalty that this modifier provides.
     * @param type The type of the modifier - modifiers of the same type do not stack (except for `untyped` modifiers).
     * @param enabled If true, this modifier will be applied to the result; otherwise, it will not.
     * @param source The source from which this modifier originates, if any.
     * @param notes Any notes about this modifier.
     */
    constructor(args: ModifierObjectParams) {
        this.label = game.i18n.localize(args.label ?? args.name)
        this.slug = sluggify(args.slug ?? this.label);

        this.#originalValue = this.modifier = args.modifier;

        this.domains = args.domains ?? [];
        this.adjustments = fu.deepClone(args.adjustments ?? []);
        this.alterations = [args.alterations ?? []].flat();
        this.enabled = args.enabled ?? true;
        this.ignored = args.ignored ?? false;
        this.source = args.source ?? null;
        this.predicate = new Predicate(args.predicate ?? []);
        this.traits = fu.deepClone(args.traits ?? []);
        this.hideIfDisabled = args.hideIfDisabled ?? false;
        this.critical = args.critical ?? null;
        
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
    clone(data: Partial<ModifierObjectParams> = {}, options: {test?: Iterable<string>} = {}): ModifierPTR2e {
        const clone = new ModifierPTR2e(fu.mergeObject({...this, modifier: this.#originalValue, ...data}));
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
        this.enabled = this.predicate.test(rollOptions);
        this.ignored = !this.enabled;
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

interface ModifierObjectParams extends RawModifier {
    name?: string;
    change?: ChangeModel | null;
    alterations?: DamageAlteration[];
}

export { ModifierPTR2e };
export type {
    ModifierAdjustment,
    RawModifier,
    DeferredValueParams,
    TestableDeferredValueParams,
    DeferredValue,
    DeferredPromise,
};
