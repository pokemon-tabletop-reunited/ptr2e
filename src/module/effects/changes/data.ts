
import { PredicateField } from "@system/predication/schema-data-fields.ts";
import ActiveEffectSystem from "../system.ts";
import ResolvableValueField from "@module/data/fields/resolvable-value-field.ts";
import { RuleValue } from "../data.ts";
import { RawPredicate } from "@system/predication/predication.ts";

interface ChangeModelOptions {
    parent: ActiveEffectSystem;
    strict?: boolean | undefined;
    sourceIndex?: number | undefined;
    suppressWarnings?: boolean | undefined;
}

interface ResolveValueParams {
    evaluate?: boolean;
    resolvables?: Record<string, unknown>;
    warn?: boolean;
}

interface ChangeSchema extends foundry.data.fields.DataSchema {
    key: foundry.data.fields.StringField<string, string, true, false, true>
    value: ResolvableValueField<true, false, true>
    mode: foundry.data.fields.NumberField<ActiveEffectChangeMode, ActiveEffectChangeMode, false, false, true>
    priority: foundry.data.fields.NumberField;

    type: foundry.data.fields.StringField<string, string, true, false, true>;

    label: foundry.data.fields.StringField<string, string, false, false, true>;
    predicate: PredicateField;
    ignored: foundry.data.fields.BooleanField;
};

interface ChangeSource {
    key: string;
    value: RuleValue;
    mode: number;
    priority?: number | null;
    type: string;
    label?: string;
    predicate?: RawPredicate;
    ignored?: boolean;
}

export type {
    ChangeModelOptions,
    ChangeSchema,
    ChangeSource,
    ResolveValueParams,
}