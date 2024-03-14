import { ActorPTR2e } from "@actor";
import { ItemPTR2e } from "@item";
import { PredicateField } from "@system/predication/schema-data-fields.ts";

type ChangeModelOptions = {
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

type ChangeSchema = {
    key: foundry.data.fields.StringField<string, string, true, false, false>
    value: foundry.data.fields.NumberField<number, number, true, true, true>
    mode: foundry.data.fields.NumberField<ActiveEffectChangeMode, ActiveEffectChangeMode, false, false, true>
    priority: foundry.data.fields.NumberField;

    type: foundry.data.fields.StringField<string, string, true, false, true>;

    predicate: PredicateField;
    ignored: foundry.data.fields.BooleanField;
};

export type {
    ChangeModelOptions,
    ChangeSchema,
    ResolveValueParams
}