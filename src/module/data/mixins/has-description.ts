import { TemplateConstructor } from './data-template.ts';

/**
 * Adds description property to target data model.
 * @group Mixins
 */
export default function HasDescription<BaseClass extends TemplateConstructor>(baseClass: BaseClass) {
	abstract class TemplateClass extends baseClass {
        /**
         * A description of the item.
         * @defaultValue `''`
         * @remarks
         * This is a description of the item, which can be as long as necessary.
         * It is often used to provide the effects of the item, or to provide a more detailed description of the item's appearance.
         */
        abstract description: string;

        declare _source: InstanceType<typeof baseClass>['_source'] & {
            description: string;
        }

		static override defineSchema(): foundry.data.fields.DataSchema {
			const fields = foundry.data.fields;

			return {
				...super.defineSchema(),
                
                description: new fields.HTMLField({ required: false, nullable: true, label: "PTR2E.Fields.Description.Label", hint: "PTR2E.Fields.Description.Hint"}),
			};
		}
	}

	return TemplateClass;
}