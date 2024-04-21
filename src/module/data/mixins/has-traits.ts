import { SlugField } from '../fields/slug-field.ts';
import Trait from '../models/trait.ts';
import { TemplateConstructor } from './data-template.ts';

/**
 * Adds traits property to target data model.
 * @group Mixins
 */
export default function HasTraits<BaseClass extends TemplateConstructor>(baseClass: BaseClass) {
    abstract class TemplateClass extends baseClass {
        declare _source: InstanceType<typeof baseClass>['_source'] & {
            //TODO: Update this to Trait String
            traits: Set<string>;
        }

        static override defineSchema(): foundry.data.fields.DataSchema {
            const fields = foundry.data.fields;

            return {
                ...super.defineSchema(),

                //TODO: Add validation to Traits field
                traits: new fields.SetField(new SlugField(), { required: true, initial: [], label: "PTR2E.FIELDS.traits.label", hint: "PTR2E.FIELDS.traits.hint" })
            };
        }

        override prepareBaseData() {
            super.prepareBaseData();

            this._traits = [];
            this.traits = this._source.traits.reduce((acc: Map<string, Trait>, traitSlug: string) => {
                const trait = game.ptr.data.traits.get(traitSlug)
                if (trait) {
                    acc.set(traitSlug, trait);
                    this._traits.push(trait);
                }
                else {
                    console.warn(`Could not find trait with slug ${traitSlug}`);
                    console.warn("TODO: Remove this functionality and add a migration to remove invalid traits.")
                    acc.set(traitSlug, { label: Handlebars.helpers.formatSlug(traitSlug), description: '', slug: traitSlug, related: []});
                }
                return acc;
            }, new Map());
        }
    }

    interface TemplateClass {
        /**
         * A record of traits that the item has.
         * @remarks
         * This is a record of traits that the item has, keyed by the trait's name.
         * @example
         * ```typescript
         * const item = new ItemPTR2e({ name: 'Flashlight', "system.traits": ["light"] });
         * console.log(item.system.traits); // { "light": TraitPTR2e }
         * ```
         */
        traits: Map<string, Trait>
        _traits: Trait[];
    }

    return TemplateClass;
}