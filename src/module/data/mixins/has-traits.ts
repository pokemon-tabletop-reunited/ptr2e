import { ActorPTR2e } from '@actor';
import { SlugField } from '../fields/slug-field.ts';
import Trait from '../models/trait.ts';
import { TemplateConstructor } from './data-template.ts';

/**
 * Adds traits property to target data model.
 * @group Mixins
 */
export default function HasTraits<BaseClass extends TemplateConstructor>(baseClass: BaseClass) {
  abstract class TemplateClass extends baseClass {
    static override defineSchema(): TraitsSchema {
      const fields = foundry.data.fields;

      return {
        ...super.defineSchema(),

        //@ts-expect-error - We are only using the SetField for data storage, but are initializing the property as a Collection
        traits: new fields.SetField(new SlugField(), { required: true, initial: [], label: "PTR2E.FIELDS.traits.label", hint: "PTR2E.FIELDS.traits.hint" })
        // traits: new CollectionField(new SlugField(), "slug", { required: true, initial: [], label: "PTR2E.FIELDS.traits.label", hint: "PTR2E.FIELDS.traits.hint" })
      };
    }

    addTraitFromSlug(traitSlug: string, virtual?: boolean) {
      const rollOptionManager = (() => {
        if (!(this.parent instanceof ActorPTR2e)) return null;
        return this.parent.rollOptions;
      })();

      const trait = game.ptr.data.traits.get(traitSlug)
      if (trait) {
        this.traits.set(traitSlug, {
          ...trait,
          virtual: virtual ?? trait.virtual ?? false,
        });
        this._traits.push(trait);
      }
      else {
        console.debug(`Could not find trait with slug ${traitSlug}`);
        console.debug("TODO: Remove this functionality and add a migration to remove invalid traits.")
        this.traits.set(traitSlug, { label: Handlebars.helpers.formatSlug(traitSlug), description: '', slug: traitSlug, related: [], virtual: virtual ?? false });
      }

      rollOptionManager?.addTrait(this.traits.get(traitSlug));
    }

    override prepareBaseData() {
      super.prepareBaseData();

      this._traits = [];
      this.traits = new Collection<Trait>();
      this._source.traits.forEach(t => this.addTraitFromSlug(t, false));
    }
  }

  interface TemplateClass extends ModelPropsFromSchema<TraitsSchema> {
    // /**
    //  * A record of traits that the item has.
    //  * @remarks
    //  * This is a record of traits that the item has, keyed by the trait's name.
    //  * @example
    //  * ```typescript
    //  * const item = new ItemPTR2e({ name: 'Flashlight', "system.traits": ["light"] });
    //  * console.log(item.system.traits); // { "light": TraitPTR2e }
    //  * ```
    //  */
    traits: Collection<Trait>
    _traits: Trait[];

    _source: SourceFromSchema<TraitsSchema>
  }

  return TemplateClass;
}

export interface TraitsSchema extends foundry.data.fields.DataSchema {
  //@ts-expect-error - We are only using the SetField for data storage, but are initializing the property as a Collection
  traits: foundry.data.fields.SetField<TraitsField, foundry.data.fields.SourcePropFromDataField<TraitsField>[], Collection<Trait>, true, false, true>;
}

type TraitsField = SlugField<string, string, true, false, true>;