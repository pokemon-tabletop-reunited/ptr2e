const { fields } = foundry.data;

/** A `StringField` that does not cast the source value */
class StrictStringField<
    TSourceProp extends string,
    TModelProp = TSourceProp,
    TRequired extends boolean = false,
    TNullable extends boolean = false,
    THasInitial extends boolean = boolean,
> extends fields.StringField<TSourceProp, TModelProp, TRequired, TNullable, THasInitial> {
    protected override _cast(value: unknown): unknown {
        return value;
    }
}

/** A `NumberField` that does not cast the source value */
class StrictNumberField<
    TSourceProp extends number,
    TModelProp = TSourceProp,
    TRequired extends boolean = false,
    TNullable extends boolean = true,
    THasInitial extends boolean = true,
> extends fields.NumberField<TSourceProp, TModelProp, TRequired, TNullable, THasInitial> {
    protected override _cast(value: unknown): unknown {
        return value;
    }
}

/** A `BooleanField` that does not cast the source value */
class StrictBooleanField<
    TRequired extends boolean = false,
    TNullable extends boolean = false,
    THasInitial extends boolean = true,
> extends fields.BooleanField<boolean, boolean, TRequired, TNullable, THasInitial> {
    protected override _cast(value: unknown): unknown {
        return value;
    }
}

class StrictArrayField<
    TElementField extends foundry.data.fields.DataField,
    TSourceProp extends Partial<foundry.data.fields.SourcePropFromDataField<TElementField>>[] = foundry.data.fields.SourcePropFromDataField<TElementField>[],
    TModelProp extends object = foundry.data.fields.ModelPropFromDataField<TElementField>[],
    TRequired extends boolean = true,
    TNullable extends boolean = false,
    THasInitial extends boolean = true,
> extends fields.ArrayField<TElementField, TSourceProp, TModelProp, TRequired, TNullable, THasInitial> {
    /** Don't wrap a non-array in an array */
    protected override _cast(value: unknown): unknown {
        return value;
    }

    /** Parent method assumes array-wrapping: pass through unchanged */
    protected override _cleanType(value: unknown): unknown {
        return Array.isArray(value) ? super._cleanType(value) : value;
    }

    override initialize(
        value: JSONValue,
        model: ConstructorOf<foundry.abstract.DataModel>,
        options: foundry.data.fields.ArrayFieldOptions<TSourceProp, TRequired, TNullable, THasInitial>,
    ): foundry.data.fields.MaybeSchemaProp<TModelProp, TRequired, TNullable, THasInitial>;
    override initialize(
        value: JSONValue,
        model: ConstructorOf<foundry.abstract.DataModel>,
        options: foundry.data.fields.ArrayFieldOptions<TSourceProp, TRequired, TNullable, THasInitial>,
    ): Maybe<TModelProp> {
        return Array.isArray(value) ? super.initialize(value, model, options) : null;
    }
}

class StrictObjectField<
    TSourceProp extends object,
    TModelProp = TSourceProp,
    TRequired extends boolean = true,
    TNullable extends boolean = false,
    THasInitial extends boolean = true,
> extends fields.ObjectField<TSourceProp, TModelProp, TRequired, TNullable, THasInitial> {
    protected override _cast(value: unknown): unknown {
        return value;
    }
}

export { StrictStringField, StrictNumberField, StrictBooleanField, StrictArrayField, StrictObjectField };