import type { TemplateConstructor } from './data-template.ts';
import { ActionModelTypes, type _ActionModelTypes } from '../models/base.ts';
import { CollectionField } from '../fields/collection-field.ts';
import type { AnyDocument } from 'node_modules/fvtt-types/src/foundry/client/data/abstract/client-document.d.mts';
import type { EmptyObject } from 'fvtt-types/utils';

const actionsSchema = {
  /**
   * A record of actions that the item has.
   * @remarks
   * This is a record of actions that the item has, keyed by the action's slug.
   * @see {@link ActionPTR2e}
   */
  actions: new CollectionField<
    foundry.data.fields.TypedSchemaField<_ActionModelTypes>,
    EmptyObject,
    PTR.Models.Action.Source,
    PTR.Models.Action.Instance,
    PTR.Models.Action.Source[],
    Collection<PTR.Models.Action.Instance>,
    Maybe<PTR.Models.Action.Source>,
    Maybe<PTR.Models.Action.Source[]>
  >(
    new foundry.data.fields.TypedSchemaField(ActionModelTypes()),
    'slug'
  )
}

export type ActionsSchema = typeof actionsSchema;

/**
 * Adds actions property to target data model.
 * @group Mixins
 */
export default function HasActions<BaseClass extends TemplateConstructor>(baseClass: BaseClass) {
  abstract class TemplateClass extends baseClass {
    static override defineSchema(): ActionsSchema {
      return {
        ...super.defineSchema(),
        ...actionsSchema
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

    private _isValidParent(parent: AnyDocument | null): parent is Actor.ConfiguredInstance | Item.ConfiguredInstance {
      return (
        parent instanceof CONFIG.Actor.documentClass ||
        parent instanceof CONFIG.Item.documentClass
      );
    }

    private _isAbilityParent(parent: Actor.ConfiguredInstance | Item.ConfiguredInstance): parent is PTR.Item.System.Ability.ParentInstance {
      return parent instanceof CONFIG.Item.documentClass && parent.type === "ability";
    }

    private _isValidAbilityParent(parent: PTR.Item.System.Ability.ParentInstance) {
      if(!parent.parent) return true;
      return !parent.system.isSuppressed && (parent.system.free || parent.system.slot !== null);
    }
  }

  interface TemplateClass extends foundry.data.fields.SchemaField.InitializedType<ActionsSchema> {
    _source: foundry.data.fields.SchemaField.PersistedType<ActionsSchema>;
  }

  return TemplateClass;
}