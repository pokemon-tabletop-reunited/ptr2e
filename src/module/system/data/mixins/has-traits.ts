import { ActorPTR2e } from "../actor/document";
import { SlugField } from "../fields/slug-field";
import type Trait from "../models/trait";
import { MixableTypeDataModel, mixSchema } from "./data";
import SystemTraitsCollection from "../system-traits-collection";
import SetField = foundry.data.fields.SetField;
import ArrayField = foundry.data.fields.ArrayField;

const traitsSchema = {
  traits: new foundry.data.fields.SetField<
    SlugField,
    {required: true, initial: [], label: "PTR2E.FIELDS.traits.label", hint: "PTR2E.FIELDS.traits.hint"},
    ArrayField.AssignmentElementType<SlugField>,
    Trait,
    SetField.AssignmentType<SlugField, {required: true, initial: [], label: "PTR2E.FIELDS.traits.label", hint: "PTR2E.FIELDS.traits.hint"}>,
    SystemTraitsCollection
  >(new SlugField(), { required: true, initial: [], label: "PTR2E.FIELDS.traits.label", hint: "PTR2E.FIELDS.traits.hint" })
};

export function HasTraits<BaseClass extends typeof MixableTypeDataModel>(baseClass: BaseClass) {
  abstract class TemplateClass extends mixSchema(baseClass, traitsSchema) {
    declare _traits: Trait[];

    addTraitFromSlug(traitSlug: string, virtual?: boolean) {
      const rollOptionManager = (() => {
        if (!(this.parent instanceof ActorPTR2e)) return null;
        return this.parent.rollOptions;
      })();

      // @ts-expect-error - Haven't added global traits data yet
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const trait: Trait = game.ptr.data.traits.get(traitSlug)
      if (trait) {
        this.traits.set(traitSlug, {
          // eslint-disable-next-line @typescript-eslint/no-misused-spread
          ...trait,
          virtual: virtual ?? trait.virtual ?? false,
        });
        this._traits.push(trait);
      }
      else {
        console.debug(`Could not find trait with slug ${traitSlug}`);
        console.debug("TODO: Remove this functionality and add a migration to remove invalid traits.")
        this.traits.set(traitSlug, { 
          label: Handlebars.helpers.formatSlug!(traitSlug) as string, 
          description: '', 
          slug: traitSlug, 
          related: [], 
          virtual: virtual ?? false,
          //@ts-expect-error - Haven't implemented changes yet
          changes: []
        });
      }

      //@ts-expect-error - Haven't implemented the RollOptionManager yet
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      rollOptionManager?.addTrait(this.traits.get(traitSlug));
    }

    override prepareBaseData() {
      super.prepareBaseData();

      this._traits = [];
      this.traits = new SystemTraitsCollection();
      this._source.traits.forEach(t => { this.addTraitFromSlug(t, false); });
    }
  }

  return TemplateClass;
}

export type TraitsSchema = typeof traitsSchema; 