import { PredicateField } from "@system/predication/schema-data-fields.ts";
import ChangeModel from "./changes/change.ts";
import ActiveEffectSystem from "./system.ts";

interface RuleElementSource {
    key?: JSONValue;
    value?: JSONValue;
    label?: JSONValue;
    slug?: JSONValue;
    predicate?: JSONValue;
    priority?: JSONValue;
    ignored?: JSONValue;
    requiresInvestment?: JSONValue;
    requiresEquipped?: JSONValue;
    removeUponCreate?: JSONValue;
}

type RuleValue = string | number | boolean | object | BracketedValue | null;

interface Bracket<T extends object | number | string> {
    start?: number;
    end?: number;
    value: T;
}

interface BracketedValue<T extends object | number | string = object | number | string> {
    field?: string;
    brackets: Bracket<T>[];
}

interface RuleElementSchema {
    // key: StringField<string, string, true, false, false>;
    // /** An identifying slug for the rule element: its significance and restrictions are determined per RE type */
    // slug: SlugField;
    // /** A label for use by any rule element for display in an interface */
    // label: StringField<string, string, false, false, false>;
    // /** The place in order of application (ascending), among an actor's list of rule elements */
    // priority: NumberField<number, number, true, false, true>;
    /** A test of whether the rules element is to be applied */
    predicate: PredicateField;
    /** Whether the rule element is ignored and deactivated */
    // ignored: BooleanField<boolean, boolean, false, false, true>;
    // /** Whether the rule element requires that the parent item (if physical) be equipped */
    // requiresEquipped: BooleanField<boolean, boolean, false, true, false>;
    // /** Whether the rule element requires that the parent item (if physical) be invested */
    // requiresInvestment: BooleanField<boolean, boolean, false, true, false>;
}

type ModelPropsFromRESchema<TSchema extends RuleElementSchema> = Omit<
    ModelPropsFromSchema<TSchema>,
    "label"
>;

type EffectType = "affliction" | "passive";

type BaseEffectSourcePTR2e<
    TType extends EffectType,
    TSystemSource extends EffectSystemSource = EffectSystemSource,
> = foundry.documents.ActiveEffectSource<TType, TSystemSource> & {};

type EffectSystemSource = ActiveEffectSystem & {
    /**
     * A slug for the item, derived from its name.
     * @defaultValue `slugify(this.name)`
     * @remarks
     * This is a unique identifier for the item within its parent actor.
     * If the item's name changes, the slug should be automatically updated.
     * If the slug is manually set, it should be unique within the actor's items.
     * @example
     * ```typescript
     * const item = new ItemPTR2e({ name: 'Flashlight' });
     * console.log(item.slug); // 'flashlight'
     * ```
     */
    slug: string;

    /**
     * A record of traits that the item has.
     * @remarks
     * This is a record of traits that the item has, keyed by the trait's name.
     * @example
     * ```typescript
     * const item = new ItemPTR2e({ name: 'Flashlight', "system.traits": ["light"] });
     * console.log(item.system.traits); // { "light": TraitPTR2e }
     * ```
     */
    traits: Set<string>;

    changes: ChangeModel[];
};

export type {
    Bracket,
    BracketedValue,
    ModelPropsFromRESchema,
    RuleElementSchema,
    RuleElementSource,
    RuleValue,
    EffectSystemSource,
    BaseEffectSourcePTR2e,
};
