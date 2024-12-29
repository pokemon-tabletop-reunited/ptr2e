import { ChangeModelTypes } from '../models/base.ts';
import type { TemplateConstructor } from './data-template.ts';

const changesSchema = {
  changes: new foundry.data.fields.ArrayField(
    new foundry.data.fields.TypedSchemaField(ChangeModelTypes(), { required: true, nullable: false }),
    { required: true, nullable: false, initial: [] }
  )
};

export type ChangesSchema = typeof changesSchema;

/**
 * Adds changes property to target data model.
 * @group Mixins
 */
export default function HasChanges<BaseClass extends TemplateConstructor>(baseClass: BaseClass) {
  abstract class TemplateClass extends baseClass {
    static override defineSchema(): ChangesSchema {
      return {
        ...super.defineSchema(),
        ...changesSchema
      };
    }
  }


  interface TemplateClass extends foundry.data.fields.SchemaField.InitializedType<ChangesSchema> {
    _source: foundry.data.fields.SchemaField.PersistedType<ChangesSchema>;
  }

  return TemplateClass;
}

// export interface ChangesSchema extends foundry.data.fields.DataSchema {
//   changes: foundry.data.fields.ArrayField<ChangesField, foundry.data.fields.SourcePropFromDataField<ChangesField>[], foundry.data.fields.ModelPropFromDataField<ChangesField>[], true, false, true>;
// }

// type ChangesField = foundry.data.fields.TypedSchemaField<ModelPropsFromSchema<ChangeSchema>, ChangeModel, true, false, true>