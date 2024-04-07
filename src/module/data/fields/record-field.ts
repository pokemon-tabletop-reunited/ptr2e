import { isObject } from "remeda";
import { DataModelValidationFailure } from "types/foundry/common/data/validation-failure.js";

const { fields } = foundry.data;

type RecordFieldModelProp<
    TKeyField extends foundry.data.fields.StringField<string, string, true, false, false> | foundry.data.fields.NumberField<number, number, true, false, false>,
    TValueField extends foundry.data.fields.DataField,
> = Partial<Record<foundry.data.fields.ModelPropFromDataField<TKeyField>, foundry.data.fields.ModelPropFromDataField<TValueField>>>;

type RecordFieldSourceProp<
    TKeyField extends foundry.data.fields.StringField<string, string, true, false, false> | foundry.data.fields.NumberField<number, number, true, false, false>,
    TValueField extends foundry.data.fields.DataField,
> = Partial<Record<foundry.data.fields.SourcePropFromDataField<TKeyField>, foundry.data.fields.SourcePropFromDataField<TValueField>>>;

class RecordField<
    TKeyField extends foundry.data.fields.StringField<string, string, true, false, false> | foundry.data.fields.NumberField<number, number, true, false, false>,
    TValueField extends foundry.data.fields.DataField,
    TRequired extends boolean = true,
    TNullable extends boolean = false,
    THasInitial extends boolean = true,
> extends fields.ObjectField<
    RecordFieldSourceProp<TKeyField, TValueField>,
    RecordFieldModelProp<TKeyField, TValueField>,
    TRequired,
    TNullable,
    THasInitial
> {
    static override recursive = true;

    keyField: TKeyField;
    valueField: TValueField;

    constructor(
        keyField: TKeyField,
        valueField: TValueField,
        options: foundry.data.fields.ObjectFieldOptions<RecordFieldSourceProp<TKeyField, TValueField>, TRequired, TNullable, THasInitial>,
    ) {
        super(options);

        if (!this._isValidKeyFieldType(keyField)) {
            throw new Error(`key field must be a StringField or a NumberField`);
        }
        this.keyField = keyField;

        if (!(valueField instanceof fields.DataField)) {
            throw new Error(`${this.name} must have a DataField as its contained field`);
        }
        this.valueField = valueField;
    }

    protected _isValidKeyFieldType(
        keyField: unknown,
    ): keyField is foundry.data.fields.StringField<string, string, true, false, false> | foundry.data.fields.NumberField<number, number, true, false, false> {
        if (keyField instanceof fields.StringField || keyField instanceof fields.NumberField) {
            if (keyField.options.required !== true || keyField.options.nullable === true) {
                throw new Error(`key field must be required and non-nullable`);
            }
            return true;
        }
        return false;
    }

    protected _validateValues(
        values: Record<string, unknown>,
        options?: foundry.data.fields.DataFieldValidationOptions,
    ): DataModelValidationFailure | void {
        const validationFailure = foundry.data.validation.DataModelValidationFailure;
        const failures = new validationFailure();
        for (const [key, value] of Object.entries(values)) {
            // If this is a deletion key for a partial update, skip
            if (key.startsWith("-=") && options?.partial) continue;

            const keyFailure = this.keyField.validate(key, options);
            if (keyFailure) {
                failures.elements.push({ id: key, failure: keyFailure });
            }
            const valueFailure = this.valueField.validate(value, options);
            if (valueFailure) {
                failures.elements.push({ id: `${key}-value`, failure: valueFailure });
            }
        }
        if (failures.elements.length) {
            return failures;
        }
    }

    protected override _cleanType(
        values: Record<string, unknown>,
        options?: foundry.data.fields.CleanFieldOptions | undefined,
    ): Record<string, unknown> {
        for (const [key, value] of Object.entries(values)) {
            values[key] = this.valueField.clean(value, options);
        }
        return values;
    }

    protected override _validateType(
        values: unknown,
        options?: foundry.data.fields.DataFieldValidationOptions,
    ): boolean | DataModelValidationFailure | void {
        if (!isObject(values)) {
            return new foundry.data.validation.DataModelValidationFailure({ message: "must be an Object" });
        }
        return this._validateValues(values, options);
    }

    override initialize(
        values: object | null | undefined,
        model: ConstructorOf<foundry.abstract.DataModel>,
        options?: foundry.data.fields.ObjectFieldOptions<RecordFieldSourceProp<TKeyField, TValueField>, TRequired, TNullable, THasInitial>,
    ): foundry.data.fields.MaybeSchemaProp<RecordFieldModelProp<TKeyField, TValueField>, TRequired, TNullable, THasInitial>;
    override initialize(
        values: object | null | undefined,
        model: ConstructorOf<foundry.abstract.DataModel>,
        options?: foundry.data.fields.ObjectFieldOptions<RecordFieldSourceProp<TKeyField, TValueField>, TRequired, TNullable, THasInitial>,
    ): RecordFieldModelProp<TKeyField, TValueField> | null | undefined {
        if (!values) return values;
        const data: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(values)) {
            data[key] = this.valueField.initialize(value, model, options);
        }
        return data as RecordFieldModelProp<TKeyField, TValueField>;
    }
}

export { RecordField };
export type { RecordFieldModelProp, RecordFieldSourceProp };