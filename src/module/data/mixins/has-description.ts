import type { TemplateConstructor } from './data-template.ts';

const descriptionSchema = {
  /**
   * A description of the item.
   * @defaultValue `''`
   * @remarks
   * This is a description of the item, which can be as long as necessary.
   * It is often used to provide the effects of the item, or to provide a more detailed description of the item's appearance.
   */
  description: new foundry.data.fields.HTMLField({ required: true, initial: "", label: "PTR2E.FIELDS.description.label", hint: "PTR2E.FIELDS.description.hint" }),
}

export type DescriptionSchema = typeof descriptionSchema;

/**
 * Adds description property to target data model.
 * @group Mixins
 */
export default function HasDescription<BaseClass extends TemplateConstructor>(baseClass: BaseClass) {
  abstract class TemplateClass extends baseClass {
    static override defineSchema(): DescriptionSchema {
      return {
        ...super.defineSchema(),
        ...descriptionSchema
      };
    }
  }

  interface TemplateClass extends foundry.data.fields.SchemaField.InitializedType<DescriptionSchema> {
    _source: foundry.data.fields.SchemaField.PersistedType<DescriptionSchema>;
  }

  return TemplateClass;
}