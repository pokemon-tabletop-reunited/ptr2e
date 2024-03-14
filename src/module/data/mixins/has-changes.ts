import { ChangeModelTypes } from '../models/base.ts';
import { ChangeModel } from '@data';
import { TemplateConstructor } from './data-template.ts';

/**
 * Adds changes property to target data model.
 * @group Mixins
 */
export default function HasChanges<BaseClass extends TemplateConstructor>(baseClass: BaseClass) {
    abstract class TemplateClass extends baseClass {
        /**
         * An array of changes to the item's data.
         */
        abstract changes: ChangeModel[]

        declare _source: InstanceType<typeof baseClass>['_source'] & {
            changes: ChangeModel[];
        }

        static override defineSchema(): foundry.data.fields.DataSchema {
            const fields = foundry.data.fields;

            return {
                ...super.defineSchema(),

                changes: new fields.ArrayField(new fields.TypedSchemaField(ChangeModelTypes()))
            };
        }
    }

    return TemplateClass;
}