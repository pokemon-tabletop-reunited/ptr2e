import { isObject } from "@utils";

const { fields } = foundry.data;

/** A `SchemaField` that does not cast the source value to an object */
class StrictSchemaField<TDataSchema extends foundry.data.fields.DataSchema> extends fields.SchemaField<TDataSchema> {
    protected override _cast(value: unknown): SourceFromSchema<TDataSchema> {
        return value as SourceFromSchema<TDataSchema>;
    }

    protected override _cleanType(data: object, options?: foundry.data.fields.CleanFieldOptions): SourceFromSchema<TDataSchema> {
        if (!isObject(data)) {
            throw Error(`${this.name} is not an object`);
        }
        return super._cleanType(data, options);
    }
}

export { StrictSchemaField };