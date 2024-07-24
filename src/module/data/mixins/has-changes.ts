import { ChangeModelTypes } from '../models/base.ts';
import { ChangeModel, ChangeSchema } from '@data';
import { TemplateConstructor } from './data-template.ts';
import { ModelPropFromDataField } from 'types/foundry/common/data/fields.js';

/**
 * Adds changes property to target data model.
 * @group Mixins
 */
export default function HasChanges<BaseClass extends TemplateConstructor>(baseClass: BaseClass) {
  class TemplateClass extends baseClass {
    static override defineSchema(): ChangesSchema {
      const fields = foundry.data.fields;

      return {
        ...super.defineSchema(),

        changes: new fields.ArrayField<ChangesField, foundry.data.fields.SourcePropFromDataField<ChangeModel>[], foundry.data.fields.SourcePropFromDataField<ChangeModel>[], true, false, true>(
          new fields.TypedSchemaField<ModelPropsFromSchema<ChangeSchema>, ChangeModel, true, false, true>(ChangeModelTypes(), { required: true, nullable: false }),
          { required: true, nullable: false, initial: [] }
        )
      };
    }
  }


  interface TemplateClass extends ModelPropsFromSchema<ChangesSchema> {
    asdf: ModelPropFromDataField<ChangesField>;
    _source: SourceFromSchema<ChangesSchema>;
  }

  return TemplateClass;
}

export interface ChangesSchema extends foundry.data.fields.DataSchema {
  changes: foundry.data.fields.ArrayField<ChangesField, foundry.data.fields.SourcePropFromDataField<ChangesField>[], foundry.data.fields.ModelPropFromDataField<ChangesField>[], true, false, true>;
}

type ChangesField = foundry.data.fields.TypedSchemaField<ModelPropsFromSchema<ChangeSchema>, ChangeModel, true, false, true>