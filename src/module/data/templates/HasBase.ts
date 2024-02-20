import { TemplateConstructor } from './DataTemplate.ts';
import HasActions from './HasActions.ts';
import HasContainer from './HasContainer.ts';
import HasDescription from './HasDescription.ts';
import HasSlug from './HasSlug.ts';
import HasTraits from './HasTraits.ts';

/**
 * Adds the base properties of *almost* every item together to target data model.
 * It combines the properties of `HasSlug`, `HasActions`, `HasDescription`, and `HasTraits`, and `HasContainer`.
 */
export default function HasBase<BaseClass extends TemplateConstructor>(baseClass: BaseClass) {
	abstract class TemplateClass extends HasContainer(HasDescription(HasActions(HasTraits(HasSlug(baseClass))))) {
		// This is an empty class, but it's necessary to combine the properties of the other classes.
    }

	return TemplateClass;
}