import { PredicateField } from "@system/predication/schema-data-fields.ts";
import BaseActiveEffect from "types/foundry/common/documents/active-effect.js";
import BaseActor from "types/foundry/common/documents/actor.js";
import BaseItem from "types/foundry/common/documents/item.js";

export class BaseChange<TParent extends BaseActiveEffect<BaseActor | BaseItem<BaseActor | null> | null>> extends foundry.abstract.Document<TParent, ChangeSchema> {

    static override get TYPES() {
        return ['base']
    }

    static override metadata = Object.freeze(fu.mergeObject(super.metadata, {
        name: "Change",
        collection: "changes",
        label: "DOCUMENT.Change",
        labelPlural: "DOCUMENT.Changes",
        schemaVersion: "12.317"
    }, {inplace: false}));

    static override defineSchema(): ChangeSchema {
        const fields = foundry.data.fields;
        return {
            _id: new fields.DocumentIdField(),
            system: new fields.TypeDataField(this),
            type: new fields.DocumentTypeField(this, {initial: CONST.BASE_DOCUMENT_TYPE}),
            flags: new fields.ObjectField(),

            key: new fields.StringField({required: true, label: "EFFECT.ChangeKey"}),
            value: new fields.StringField({required: true, label: "EFFECT.ChangeValue"}),
            mode: new fields.NumberField({integer: true, initial: CONST.ACTIVE_EFFECT_MODES.ADD, label: "EFFECT.ChangeMode"}),
            priority: new fields.NumberField(),

            // Custom Fields
            predicate: new PredicateField(),
            ignored: new fields.BooleanField({ initial: false })
        }
    }
}

export interface BaseChange<TParent extends BaseActiveEffect<BaseActor | BaseItem<BaseActor | null> | null>> extends foundry.abstract.Document<TParent, ChangeSchema>, ModelPropsFromSchema<ChangeSchema> {
    get documentName(): "Change";
}

export interface ChangeMetadata extends foundry.abstract.DocumentMetadata {
    name: "Change";
    collection: "changes";
    label: "DOCUMENT.Change";
    isEmbedded: true;
}

export type ChangeSchema<
    TSystemSource extends object = object
> = {
    // Required document fields
    _id: foundry.data.fields.DocumentIdField;
    system: foundry.data.fields.TypeDataField<TSystemSource>
    type: foundry.data.fields.DocumentTypeField;
    flags: foundry.data.fields.ObjectField<DocumentFlags>
    
    // Old change fields
    key: foundry.data.fields.StringField<string, string, true, false, false>;
    value: foundry.data.fields.StringField<string, string, true, false, false>;
    mode: foundry.data.fields.NumberField<ActiveEffectChangeMode, ActiveEffectChangeMode, false, false, true>;
    priority: foundry.data.fields.NumberField;

    // Custom fields
    predicate: PredicateField;
    ignored: foundry.data.fields.BooleanField;
}