import Trait from '../models/trait.ts';
import { TemplateConstructor } from './data-template.ts';

/**
 * Adds traits property to target data model.
 * @group Mixins
 */
export default function HasTraits<BaseClass extends TemplateConstructor>(baseClass: BaseClass) {
    class TemplateClass extends baseClass {
        declare _source: InstanceType<typeof baseClass>['_source'] & {
            //TODO: Update this to Trait String
            traits: string[];
        }

        static override defineSchema(): foundry.data.fields.DataSchema {
            const fields = foundry.data.fields;

            return {
                ...super.defineSchema(),

                traits: new fields.SetField(new fields.StringField())
            };
        }

        override prepareBaseData() {
            super.prepareBaseData();

            this.traits = this._source.traits.reduce((acc: Map<string, Trait>, traitSlug: string) => {
                const trait = game.ptr.data.traits.get(traitSlug)
                if (trait) acc.set(traitSlug, trait);
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
    }

    return TemplateClass;
}