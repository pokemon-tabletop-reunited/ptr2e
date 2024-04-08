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
}

export { LaxSchemaField }