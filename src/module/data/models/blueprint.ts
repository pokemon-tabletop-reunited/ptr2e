import { DataSchema } from "types/foundry/common/data/fields.js";
import { CollectionField } from "../fields/collection-field.ts";

class Blueprint extends foundry.abstract.DataModel {
  static override defineSchema(recursion = 0): DataSchema {
    const fields = foundry.data.fields;
    return {
      id: new fields.DocumentIdField({initial: fu.randomID(), required: true, nullable: false}),
      ...(
        recursion < 2
          ? { children: new CollectionField(new fields.SchemaField(this.defineSchema(recursion + 1)), "id") }
          : {}
      )
    }
  }
}

interface Blueprint extends foundry.abstract.DataModel, ModelPropsFromSchema<BlueprintSchema> {
  _source: SourceFromSchema<BlueprintSchema>;
}

interface BlueprintSchema extends DataSchema {
  id: foundry.data.fields.DocumentIdField<string, true, false, true>;
  children: CollectionField<foundry.data.fields.SchemaField<BlueprintSchema>>;
}

export { Blueprint, type BlueprintSchema };