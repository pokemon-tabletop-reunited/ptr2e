import { ActionPTR2e } from '@item';
import { TemplateConstructor } from './DataTemplate.ts';

/**
 * Adds actions property to target data model.
 */
export default function HasActions<BaseClass extends TemplateConstructor>(baseClass: BaseClass) {
	abstract class TemplateClass extends baseClass {
        
        /**
         * A record of actions that the item has.
         * @remarks
         * This is a record of actions that the item has, keyed by the action's slug.
         */
        abstract actions: Record<string, ActionPTR2e>

        declare _source: InstanceType<typeof baseClass>['_source'] & {
            actions: ActionPTR2e[];
        }

		static override defineSchema(): foundry.data.fields.DataSchema {
			const fields = foundry.data.fields;

			return {
				...super.defineSchema(),
				actions: new fields.ArrayField(new fields.EmbeddedDataField(ActionPTR2e)),
			};
		}

        override prepareBaseData() {
            super.prepareBaseData();

            this.actions = this._source.actions.reduce((acc: Record<string, ActionPTR2e>, action: ActionPTR2e) => {
                acc[action.slug] = action;
                return acc;
            }, {});
        }
	}

	return TemplateClass;
}