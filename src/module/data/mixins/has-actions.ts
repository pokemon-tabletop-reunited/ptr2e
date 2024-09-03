import { TemplateConstructor } from './data-template.ts';
// import { MappedArrayField } from '../fields/mapped-array-field.ts';
import { ActionPTR2e } from '@data';
import { ActionModelTypes } from '../models/base.ts';
import { ActorPTR2e } from '@actor';
import { AbilityPTR2e, ItemPTR2e } from '@item';
import { CollectionField } from '../fields/collection-field.ts';

/**
 * Adds actions property to target data model.
 * @group Mixins
 */
export default function HasActions<BaseClass extends TemplateConstructor>(baseClass: BaseClass) {
  abstract class TemplateClass extends baseClass {
    static override defineSchema(): ActionsSchema {
      const fields = foundry.data.fields;

      return {
        ...super.defineSchema(),
        actions: new CollectionField(new fields.TypedSchemaField(ActionModelTypes()), 'slug')
      };
    }

    override prepareBaseData() {
      super.prepareBaseData();
    }

    override prepareDerivedData(): void {
      super.prepareDerivedData();

      if (!this._isValidParent(this.parent)) return;

      for (const action of this.actions) {
        if (this.parent.actions.has(action.slug)) continue;

        // If an ability isn't free or slotted in it should be ignored
        if (this._isAbilityParent(this.parent)) {
          if (!this._isValidAbilityParent(this.parent)) continue;
        }

        action.prepareDerivedData();
        this.parent.actions.set(action.slug, action);
      }
    }

    private _isValidParent(parent: foundry.abstract.DataModel | null): parent is ActorPTR2e | ItemPTR2e {
      return (
        parent instanceof ActorPTR2e ||
        parent instanceof ItemPTR2e
      );
    }

    private _isAbilityParent(parent: ActorPTR2e | ItemPTR2e): parent is AbilityPTR2e {
      return parent instanceof ItemPTR2e && parent.type === "ability";
    }

    private _isValidAbilityParent(parent: AbilityPTR2e) {
      if(!parent.parent) return true;
      return parent.system.free || parent.system.slot !== null;
    }
  }

  interface TemplateClass extends ModelPropsFromSchema<ActionsSchema> {
    /**
     * A record of actions that the item has.
     * @remarks
     * This is a record of actions that the item has, keyed by the action's slug.
     * @see {@link ActionPTR2e}
     */
    actions: Collection<ActionPTR2e>;

    _source: SourceFromSchema<ActionsSchema>;
  }

  return TemplateClass;
}

export interface ActionsSchema extends foundry.data.fields.DataSchema {
  actions: CollectionField<foundry.data.fields.TypedSchemaField<ActionPTR2e>>;
}