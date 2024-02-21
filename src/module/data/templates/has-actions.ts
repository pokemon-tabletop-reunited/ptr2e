import { ActionPTR2e } from '@item';
import { TemplateConstructor } from './data-template.ts';
import { MappedArrayField } from '../fields/MappedArrayField.ts';

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
				// actions: new fields.ArrayField(new fields.EmbeddedDataField(ActionPTR2e)),
                actions: new MappedArrayField('slug', new fields.EmbeddedDataField(ActionPTR2e))
			};
		}

        override prepareBaseData() {
            super.prepareBaseData();

            // this.actions = this._source.actions.reduce((acc: Record<string, ActionPTR2e>, action: ActionPTR2e) => {
            //     acc[action.slug] = action;
            //     return acc;
            // }, {});
        }

        // override toObject(source?: true | undefined): this['_source'];
        // override toObject(source: false): RawObject<this>;
        // override toObject(source?: boolean | undefined): this['_source'] | RawObject<this>;
        // override toObject(source?: unknown): this["_source"] | RawObject<this> {
        //     if (source === true) return super.toObject(true);
        //     const data = {
        //         ...this,
        //         actions: Object.values(this.actions).map((action) => action)
        //     }

        //     return this.schema.toObject(data as any) as this["_source"] | RawObject<this>;
        // }
	}

	return TemplateClass;
}