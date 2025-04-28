import { ActorPTR2e } from "../actor/document";
import { CollectionField } from "../fields/collection-field";
import { ItemPTR2e } from "../item/document";
import { ActionModelTypes } from "../models";
import { MixableTypeDataModel, mixSchema } from "./data";

const actionsSchema = {
  actions: new CollectionField(new foundry.data.fields.TypedSchemaField(ActionModelTypes()), 'slug')
};

export function HasActions<BaseClass extends typeof MixableTypeDataModel>(baseClass: BaseClass) {
  abstract class TemplateClass extends mixSchema(baseClass, actionsSchema) { 

    override prepareDerivedData() {
      super.prepareDerivedData();

      if (!this._isValidParent(this.parent)) return;
      const parent = this.parent as Actor.Known | Item.Known;

      for (const action of this.actions) {
        if (parent.actions.has(action.slug)) continue;

        // If an ability isn't free or slotted in it should be ignored
        if (this._isAbilityParent(parent)) {
          if (!this._isValidAbilityParent(parent)) continue;
        }

        // If an item isn't equipped it should be ignored
        if (this._isGearParent(parent)) {
          if(parent.parent && parent.system.equipped.carryType !== "equipped") continue;
        }

        action.prepareDerivedData();
        parent.actions.set(action.slug, action);
      }
    }

    private _isValidParent(parent: foundry.abstract.DataModel.Any | null): parent is Actor.Known | Item.Known {
      return (
        parent instanceof ActorPTR2e ||
        parent instanceof ItemPTR2e
      );
    }

    private _isAbilityParent(parent: Actor.Known | Item.Known): parent is Item.OfType<"ability"> {
      return parent instanceof ItemPTR2e && parent.type === "ability";
    }

    private _isValidAbilityParent(parent: Item.OfType<"ability">) {
      if(!parent.parent) return true;
      return !parent.system.isSuppressed && (parent.system.free || parent.system.slot !== null);
    }

    private _isGearParent(parent: Actor.Known | Item.Known): parent is Item.OfType<"gear"> {
      return parent instanceof ItemPTR2e && [
        "weapon",
        "equipment",
        "consumable",
        "gear",
        "container",
      ].includes(parent.type);
    }
  }

  return TemplateClass;
}

export type ActionsSchema = typeof actionsSchema;