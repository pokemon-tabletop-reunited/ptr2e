import { sluggify } from '@utils';
import { TemplateConstructor } from './DataTemplate.ts';

/**
 * Adds slug property to target data model.
 */
export default function HasSlug<BaseClass extends TemplateConstructor>(baseClass: BaseClass) {
	abstract class TemplateClass extends baseClass {
        /**
         * A slug for the item, derived from its name.
         * @defaultValue `slugify(this.name)`
         * @remarks
         * This is a unique identifier for the item within its parent actor.
         * If the item's name changes, the slug should be automatically updated.
         * If the slug is manually set, it should be unique within the actor's items.
         * @example
         * ```typescript
         * const item = new ItemPTR2e({ name: 'Longsword' });
         * console.log(item.slug); // 'longsword'
         * ```
         */
        abstract slug: string;

        declare _source: InstanceType<typeof baseClass>['_source'] & {
            slug: string;
        }

		static override defineSchema(): foundry.data.fields.DataSchema {
			const fields = foundry.data.fields;

			return {
				...super.defineSchema(),

				slug: new fields.StringField({ required: true }),
			};
		}

        override prepareBaseData() {
            super.prepareBaseData();

            this.slug ||= sluggify((this.parent as unknown as {name: string}).name);
        }
	}

	return TemplateClass;
}