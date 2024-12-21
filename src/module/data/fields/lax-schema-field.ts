import { isObject } from "@utils";
import DataModel, { _DataModel } from "types/foundry/common/abstract/data.js";
import { DataField, DataSchema } from "types/foundry/common/data/fields.js";

const { fields } = foundry.data;

/** A `SchemaField` that preserves fields not declared in its `DataSchema` */
class LaxSchemaField<TDataSchema extends foundry.data.fields.DataSchema> extends fields.SchemaField<TDataSchema> {
    protected override _cleanType(
        data: Record<string, unknown>,
        options: foundry.data.fields.CleanFieldOptions = {},
    ): SourceFromSchema<TDataSchema> {
        options.source = options.source || data;

        // Clean each field that belongs to the schema
        for (const [name, field] of this.entries()) {
            if (!(name in data) && options.partial) continue;
            data[name] = field.clean(data[name], options);
            if (data[name] === undefined) delete data[name];
        }

        return data as SourceFromSchema<TDataSchema>;
    }

    override initialize(value: unknown, model?: ConstructorOf<DataModel<_DataModel | null, DataSchema>> | undefined): ModelPropsFromSchema<TDataSchema> {
        const data = super.initialize(value, model);
        if(value && isObject(value)) {
            const dataKeys = new Set(Object.keys(data));
            const valueKeys = new Set(Object.keys(value));
            const missingKeys = new Set([...valueKeys].filter(key => !dataKeys.has(key)));
            for(const key of missingKeys) {
                // @ts-expect-error - This is a valid check
                data[key] = value[key];
            }
        }
        return data;
    }

    override get(fieldName: string): DataField<JSONValue, JSONValue, boolean, boolean, boolean> | undefined {
        return (this.fields[fieldName] as DataField<JSONValue, JSONValue, boolean, boolean, boolean> | undefined) ?? new fields.ObjectField();
    }
}

export { LaxSchemaField }