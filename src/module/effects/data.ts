import { PredicateField } from "@system/predication/schema-data-fields.ts";

type RuleElementSource = {
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
};

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

type RuleElementSchema = {
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
};

type ModelPropsFromRESchema<TSchema extends RuleElementSchema> = Omit<ModelPropsFromSchema<TSchema>, "label">;

export type { Bracket, BracketedValue, ModelPropsFromRESchema, RuleElementSchema, RuleElementSource, RuleValue };