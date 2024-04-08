import { DataModelValidationFailure } from "types/foundry/common/data/validation-failure.js";
import { StrictArrayField } from "./strict-primitive-fields.ts";

const { fields } = foundry.data;

class DataUnionField<
    TField extends foundry.data.fields.DataField,
    TRequired extends boolean = boolean,
    TNullable extends boolean = boolean,
    THasInitial extends boolean = boolean,
> extends fields.DataField<
    TField extends foundry.data.fields.DataField<infer TSourceProp> ? TSourceProp : never,
    TField extends foundry.data.fields.DataField<infer _TSourceProp, infer TModelProp> ? TModelProp : never,
    TRequired,
    TNullable,
    THasInitial
> {
    fields: TField[];

    constructor(
        fields: TField[],
        options: foundry.data.fields.DataFieldOptions<
            TField extends foundry.data.fields.DataField<infer TSourceProp> ? TSourceProp : never,
            TRequired,
            TNullable,
            THasInitial
        >,
    ) {
        super(options);
        this.fields = fields;
    }

    protected override _cast(value?: unknown): unknown {
        if (typeof value === "string") value = value.trim();
        return value;
    }

    override clean(
        value: unknown,
        options?: foundry.data.fields.CleanFieldOptions | undefined,
    ): MaybeUnionSchemaProp<TField, TRequired, TNullable, THasInitial> {
        if (Array.isArray(value) && this.fields.some((f) => f instanceof foundry.data.fields.ArrayField)) {
            const arrayField = this.fields.find((f) => f instanceof StrictArrayField);
            return (arrayField?.clean(value, options) ?? value) as MaybeUnionSchemaProp<
                TField,
                TRequired,
                TNullable,
                THasInitial
            >;
        }

        return super.clean(value, options) as MaybeUnionSchemaProp<TField, TRequired, TNullable, THasInitial>;
    }

    override validate(
        value: unknown,
        options?: foundry.data.fields.DataFieldValidationOptions | undefined,
    ): void | DataModelValidationFailure {
        const { DataModelValidationFailure } = foundry.data.validation;
        const { StringField } = foundry.data.fields;
        for (const field of this.fields) {
            if (field.validate(value, options) instanceof DataModelValidationFailure) {
                continue;
            } else if (field instanceof StringField && typeof value !== "string") {
                continue;
            } else {
                return;
            }
        }

        return this.fields[0].validate(value, options);
    }

    override initialize(
        value: unknown,
        model?: ConstructorOf<foundry.abstract.DataModel> | undefined,
        options?: object | undefined,
    ): MaybeUnionSchemaProp<TField, TRequired, TNullable, THasInitial> {
        const field = this.fields.find((f) => !f.validate(value));
        return field?.initialize(value, model, options) as MaybeUnionSchemaProp<
            TField,
            TRequired,
            TNullable,
            THasInitial
        >;
    }
}

type MaybeUnionSchemaProp<
    TField extends foundry.data.fields.DataField,
    TRequired extends boolean,
    TNullable extends boolean,
    THasInitial extends boolean,
> = foundry.data.fields.MaybeSchemaProp<
    TField extends foundry.data.fields.DataField<infer _TSourceProp, infer TModelProp, boolean, boolean, boolean> ? TModelProp : never,
    TRequired,
    TNullable,
    THasInitial
>;

export { DataUnionField };
export type { MaybeUnionSchemaProp };