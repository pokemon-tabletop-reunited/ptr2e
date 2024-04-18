import { ChangeModelTypes } from '../models/base.ts';
import { ChangeModel } from '@data';
import { TemplateConstructor } from './data-template.ts';

/**
 * Adds changes property to target data model.
 * @group Mixins
 */
export default function HasChanges<BaseClass extends TemplateConstructor>(baseClass: BaseClass) {
    class TemplateClass extends baseClass {
        static override defineSchema(): foundry.data.fields.DataSchema {
            const fields = foundry.data.fields;

            return {
                ...super.defineSchema(),

                changes: new fields.ArrayField(new fields.TypedSchemaField(ChangeModelTypes()))
            };
        }
    }

    interface TemplateClass {
        changes: ChangeModel[];

        _source: InstanceType<typeof baseClass>['_source'] & {
            changes: ChangeModel[];
        }
    }

    return TemplateClass;
}