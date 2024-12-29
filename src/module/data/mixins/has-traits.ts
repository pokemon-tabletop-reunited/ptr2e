import { ActorPTR2e } from '@actor';
import { SlugField } from '../fields/slug-field.ts';
import type Trait from '../models/trait.ts';
import type { TemplateConstructor } from './data-template.ts';
import SystemTraitsCollection from '../system-traits-collection.ts';
import type { ArrayField, SetField } from 'node_modules/fvtt-types/src/foundry/common/data/fields.d.mts';

const traitsSchema = {
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
  traits: new foundry.data.fields.SetField<
    SlugField, 
    {
      required: true,
      initial: [],
      label: string,
      hint: string
    },
    ArrayField.AssignmentElementType<SlugField>,
    ArrayField.InitializedElementType<SlugField>,
    SetField.AssignmentType<ArrayField.AssignmentElementType<SlugField>, {
      required: true,
      initial: [],
      nullable: false
    }>,
    SystemTraitsCollection
  >(new SlugField(), { required: true, initial: [], label: "PTR2E.FIELDS.traits.label", hint: "PTR2E.FIELDS.traits.hint" })
}

export type TraitsSchema = typeof traitsSchema;

/**
 * Adds traits property to target data model.
 * @group Mixins
 */
export default function HasTraits<BaseClass extends TemplateConstructor>(baseClass: BaseClass) {
  abstract class TemplateClass extends baseClass {
    static override defineSchema(): TraitsSchema {
      return {
        ...super.defineSchema(),
        ...traitsSchema
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
        this.traits.set(traitSlug, { 
          label: Handlebars.helpers.formatSlug(traitSlug), 
          description: '', 
          slug: traitSlug, 
          related: [], 
          virtual: virtual ?? false,
          changes: []
        });
      }

      rollOptionManager?.addTrait(this.traits.get(traitSlug));
    }

    override prepareBaseData() {
      super.prepareBaseData();

      this._traits = [];
      this.traits = new SystemTraitsCollection();
      this._source.traits.forEach(t => this.addTraitFromSlug(t, false));
    }
  }

  interface TemplateClass extends foundry.data.fields.SchemaField.InitializedType<TraitsSchema> {
    _traits: Trait[];

    _source: foundry.data.fields.SchemaField.PersistedType<TraitsSchema>
  }

  return TemplateClass;
}