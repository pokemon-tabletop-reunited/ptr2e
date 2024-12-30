import { isObject } from "@utils";
import type { AnyObject, SimpleMerge } from "fvtt-types/utils";

const { fields } = foundry.data;

/** A `SchemaField` that preserves fields not declared in its `DataSchema` */
class LaxSchemaField<
  Fields extends foundry.data.fields.DataSchema,
  Options extends foundry.data.fields.SchemaField.Options<Fields> = foundry.data.fields.SchemaField.DefaultOptions,
  AssignmentType = foundry.data.fields.SchemaField.AssignmentType<Fields, SimpleMerge<Options, foundry.data.fields.SchemaField.DefaultOptions>>,
  InitializedType = foundry.data.fields.SchemaField.InitializedType<Fields, SimpleMerge<Options, foundry.data.fields.SchemaField.DefaultOptions>>,
  PersistedType extends AnyObject | null | undefined = foundry.data.fields.SchemaField.PersistedType<
      Fields,
      SimpleMerge<Options, foundry.data.fields.SchemaField.DefaultOptions>
    >
> extends fields.SchemaField<Fields, Options, AssignmentType, InitializedType, PersistedType> {
  protected override _cleanType(
    data: InitializedType,
    options?: foundry.data.fields.DataField.CleanOptions
  ): InitializedType {
    if(!options) options = {};
    if(!isObject(data)) return data;
    options.source = options.source || data;

    // Clean each field that belongs to the schema
    for (const [name, field] of this.entries()) {
      if (!(name in data) && options.partial) continue;
      data[name as keyof typeof data] = field.clean(data[name as keyof typeof data], options) as typeof data[keyof typeof data];
      if (data[name as keyof typeof data] === undefined) delete data[name as keyof typeof data];
    }

    return data as InitializedType
  }

  override initialize(value: PersistedType, model: foundry.abstract.DataModel.Any): InitializedType | (() => InitializedType | null){
    const data = super.initialize(value, model) as InitializedType;
    if (value && isObject(value)) {
      const dataKeys = new Set(Object.keys(data as AnyObject));
      const valueKeys = new Set(Object.keys(value));
      const missingKeys = new Set([...valueKeys].filter(key => !dataKeys.has(key)));
      for (const key of missingKeys) {
        // @ts-expect-error - This is a valid check
        data[key] = value[key];
      }
    }
    return data;
  }

  override get(fieldName: string): foundry.data.fields.DataField.Unknown {
    return (this.fields[fieldName]) ?? new fields.ObjectField();
  }
}

export { LaxSchemaField }