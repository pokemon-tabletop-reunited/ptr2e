import { TemplateConstructor } from './data-template.ts';
import HasActions from './has-actions.ts';
import HasContainer from './has-container.ts';
import HasDescription from './has-description.ts';
import HasSlug from './has-slug.ts';
import HasTraits from './has-traits.ts';

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
	abstract class TemplateClass extends HasContainer(HasDescription(HasActions(HasTraits(HasSlug(baseClass))))) {
		// This is an empty class, but it's necessary to combine the properties of the other classes.
    }

	return TemplateClass;
}