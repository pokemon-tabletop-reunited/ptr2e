import { TemplateConstructor } from './data-template.ts';
import { MappedArrayField } from '../fields/MappedArrayField.ts';
import { ActionPTR2e } from '../models/action.ts';
import { ActionTypes } from '../models/base.ts';
import { ActorPTR2e } from '@actor';
import { ItemPTR2e } from '@item';

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
        abstract actions: Map<string, ActionPTR2e>

        declare _source: InstanceType<typeof baseClass>['_source'] & {
            actions: ActionPTR2e[];
        }

		static override defineSchema(): foundry.data.fields.DataSchema {
			const fields = foundry.data.fields;

			return {
				...super.defineSchema(),
				actions: new MappedArrayField('slug', new fields.TypedSchemaField(ActionTypes()))
			};
		}

        override prepareBaseData() {
            super.prepareBaseData();
        }

        override prepareDerivedData(): void {
            super.prepareDerivedData();
            
            if(!this._isValidParent(this.parent)) return;

            const actions = this.parent.actions;
            for(const action of this.actions.values()) {
                if(actions[action.type].has(action.slug)) {
                    console.warn(`Duplicate action found in Item ${this.parent.id}: ${action.slug}`);
                    continue;
                }
                action.prepareDerivedData();
                actions[action.type].set(action.slug, action);
            }
        }

        private _isValidParent(parent: foundry.abstract.DataModel | null): parent is ActorPTR2e | ItemPTR2e {
            return (
                parent instanceof ActorPTR2e ||
                parent instanceof ItemPTR2e
            );
        }
	}

	return TemplateClass;
}