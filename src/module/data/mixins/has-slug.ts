import { TemplateConstructor } from './data-template.ts';
import { SlugField } from '../fields/slug-field.ts';

/**
 * Adds slug property to target data model.
 * @group Mixins
 */
export default function HasSlug<BaseClass extends TemplateConstructor>(baseClass: BaseClass) {
    class TemplateClass extends baseClass {
        static override defineSchema(): foundry.data.fields.DataSchema {
            return {
                ...super.defineSchema(),

                slug: new SlugField({ required: true, label: "PTR2E.FIELDS.Slug.Label", hint: "PTR2E.FIELDS.Slug.Hint" }),
            };
        }
    }

    interface TemplateClass {
        /**
         * A slug for the item, derived from its name.
         * @defaultValue `slugify(this.name)`
         * @remarks
         * This is a unique identifier for the item within its parent actor.
         * If the item's name changes, the slug should be automatically updated.
         * If the slug is manually set, it should be unique within the actor's items.
         * @example
         * ```typescript
         * const item = new ItemPTR2e({ name: 'Flashlight' });
         * console.log(item.slug); // 'flashlight'
         * ```
         */
        slug: string;

        _source: InstanceType<typeof baseClass>['_source'] & {
            slug: string;
        };
    }

    return TemplateClass;
}