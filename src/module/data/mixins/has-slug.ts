import type { TemplateConstructor } from './data-template.ts';
import { SlugField } from '../fields/slug-field.ts';
import { sluggify } from '@utils';
import type { SchemaField } from 'node_modules/fvtt-types/src/foundry/common/data/fields.d.mts';

const slugSchema = {
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
  slug: new SlugField({ required: true, label: "PTR2E.FIELDS.slug.label", hint: "PTR2E.FIELDS.slug.hint" })
}

export type SlugSchema = typeof slugSchema;

/**
 * Adds slug property to target data model.
 * @group Mixins
 */
export default function HasSlug<BaseClass extends TemplateConstructor>(baseClass: BaseClass) {
  abstract class TemplateClass extends baseClass {
    static override defineSchema(): SlugSchema {
      return {
        ...super.defineSchema(),
        ...slugSchema
      };
    }

    override prepareBaseData() {
      super.prepareBaseData();

      this.slug ||= sluggify(('name' in this.parent ? this.parent.name as string : "") ?? "");
    }
  }

  interface TemplateClass extends SchemaField.InitializedType<SlugSchema> {
    _source: SchemaField.PersistedType<SlugSchema>;
  }

  return TemplateClass;
}