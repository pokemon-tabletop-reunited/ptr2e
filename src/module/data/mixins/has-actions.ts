import { TemplateConstructor } from './data-template.ts';
import { MappedArrayField } from '../fields/MappedArrayField.ts';
import { ActionPTR2e } from '../models/action.ts';

/**
 * Adds actions property to target data model.
 * @group Mixins
 */
export default function HasActions<BaseClass extends TemplateConstructor>(baseClass: BaseClass) {
	abstract class TemplateClass extends baseClass {
        
        /**
         * A record of actions that the item has.
         * @remarks
         * This is a record of actions that the item has, keyed by the action's slug.
         * @see {@link ActionPTR2e}
         */
        abstract actions: Record<string, ActionPTR2e>

        declare _source: InstanceType<typeof baseClass>['_source'] & {
            actions: ActionPTR2e[];
        }

		static override defineSchema(): foundry.data.fields.DataSchema {
			const fields = foundry.data.fields;

			return {
				...super.defineSchema(),
				actions: new MappedArrayField('slug', new fields.EmbeddedDataField(ActionPTR2e))
			};
		}

        override prepareBaseData() {
            super.prepareBaseData();
        }
	}

	return TemplateClass;
}