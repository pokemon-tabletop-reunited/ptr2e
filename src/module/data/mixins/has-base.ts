import type { TemplateConstructor } from './data-template.ts';
import HasActions, { type ActionsSchema } from './has-actions.ts';
import HasContainer, { type ContainerSchema } from './has-container.ts';
import HasDescription, { type DescriptionSchema } from './has-description.ts';
import HasMigrations, { type MigrationSchema } from './has-migrations.ts';
import HasSlug, { type SlugSchema } from './has-slug.ts';
import HasTraits, { type TraitsSchema } from './has-traits.ts';

/**
 * Adds the base properties of *almost* every item together to target data model.
 * It combines the properties of `HasSlug`, `HasActions`, `HasDescription`, and `HasTraits`, and `HasContainer`.
 * @mixes HasSlug
 * @mixes HasActions
 * @mixes HasDescription
 * @mixes HasTraits
 * @mixes HasContainer
 * @group Mixins
 */
export default function HasBase<BaseClass extends TemplateConstructor>(baseClass: BaseClass) {
  abstract class TemplateClass extends HasMigrations(HasContainer(HasDescription(HasActions(HasTraits(HasSlug(baseClass)))))) {
    // This is an empty class, but it's necessary to combine the properties of the other classes.
  }

  interface TemplateClass extends foundry.data.fields.SchemaField.InitializedType<HasBaseSchema> {
  }

  return TemplateClass;
}

export type HasBaseSchema = ContainerSchema & DescriptionSchema & TraitsSchema & SlugSchema & MigrationSchema & ActionsSchema;