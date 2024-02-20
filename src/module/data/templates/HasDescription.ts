import { TemplateConstructor } from './DataTemplate.ts';

/**
 * Adds description property to target data model.
 */
export default function HasDescription<BaseClass extends TemplateConstructor>(baseClass: BaseClass) {
	abstract class TemplateClass extends baseClass {
        /**
         * A description of the item.
         * @defaultValue `''`
         * @remarks
         * This is a description of the item, which can be as long as necessary.
         * It is often used to provide the effects of the item, or to provide a more detailed description of the item's appearance.
         * @example
         * ```typescript
         * const item = new ItemPTR2e({ name: 'Longsword' });
         * item.description = 'A long, sharp blade with a double edge.';
         * ```
         */
        abstract description: string;

        declare _source: InstanceType<typeof baseClass>['_source'] & {
            description: string;
        }

		static override defineSchema(): foundry.data.fields.DataSchema {
			const fields = foundry.data.fields;

			return {
				...super.defineSchema(),
                
                description: new fields.HTMLField({ required: false, nullable: true }),
			};
		}
	}

	return TemplateClass;
}