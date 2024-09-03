import { ContainerPTR2e } from '@item';
import { TemplateConstructor } from './data-template.ts';
import HasActions, { ActionsSchema } from './has-actions.ts';
import HasContainer, { ContainerSchema } from './has-container.ts';
import HasDescription, { DescriptionSchema } from './has-description.ts';
import HasMigrations, { MigrationSchema } from './has-migrations.ts';
import HasSlug, { SlugSchema } from './has-slug.ts';
import HasTraits, { TraitsSchema } from './has-traits.ts';
import ActionPTR2e from '../models/action.ts';

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

  interface TemplateClass extends ModelPropsFromSchema<HasBaseSchema> { 
    container: ContainerPTR2e | null;
    actions: Collection<ActionPTR2e>;
  }

  return TemplateClass;
}

export type HasBaseSchema = ContainerSchema & DescriptionSchema & TraitsSchema & SlugSchema & MigrationSchema & ActionsSchema;