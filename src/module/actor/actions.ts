import type { ActionType } from "@data";
import { PTRCONSTS } from "@data";
export class ActionsCollections extends Collection<PTR.Models.Action.AnyInstance> {
  parent: Actor.ConfiguredInstance | Item.ConfiguredInstance;
  declare attack: Collection<PTR.Models.Action.Models.Attack.Instance>;

  constructor(parent: Actor.ConfiguredInstance | Item.ConfiguredInstance, sourceArray: PTR.Models.Action.Instance[] = []) {
    super(sourceArray.map((source) => [source.slug, source]));

    const data: PropertyDescriptorMap = Object.values(
      PTRCONSTS.ActionTypes
    ).reduce<PropertyDescriptorMap>(
      (acc, type) => ({ ...acc, [type]: { value: new Collection<PTR.Models.Action.Instance>() } }),
      {
        parent: { value: parent, writable: false },
      }
    );
    Object.defineProperties(this, data);
  }

  override set(slug: Maybe<string>, value: PTR.Models.Action.AnyInstance) {
    if (!(value instanceof CONFIG.PTR.models.actions.base))
      throw new Error("ActionsCollection can only contain ActionPTR2e instances");

    // Set the slug if it's not already set
    slug ||= value.slug;
    if (!slug) {
      throw new Error("Action must have a slug");
    }

    //Add the action to the appropriate collection, as well as the main collection
    super.set(slug, value); 
    //@ts-expect-error - FIXME: Can probably type this better.
    this[value.type].set(slug, value);

    return this;
  }

  override delete(key: string): boolean {
    const action = this.get(key);
    if (!action) return false;

    // Remove the action from the appropriate collection
    this[action.type].delete(key);

    // Remove the action from the main collection
    return super.delete(key);
  }

  override clear(): void {
    super.clear();
    for (const key of Object.values(PTRCONSTS.ActionTypes)) {
      this[key].clear();
    }
  }

  /**
   * Add all actions from an item to the collection
   */
  addActionsFromItem(item: PTR.Item.ItemWithActions) {
    const actions = item.actions;
    for (const action of actions) {
      this.set(action.slug, action);
      if (this.parent instanceof CONFIG.Actor.documentClass) {
        if (!["attack", "generic"].includes(action.type)) continue;
        if (action.variant && !(action as unknown as { free: boolean }).free) continue;

        this.parent.flags.ptr2e.disableActionOptions!.collection.set(action.slug, action);
      }
    }
    return this;
  }

  /**
   * Get the item hosting a given action by its slug
   */
  getItem(actionSlug: string): Maybe<PTR.Item.ItemWithActions> {
    return this.get(actionSlug)?.item as Maybe<PTR.Item.ItemWithActions>;
  }
}

export interface ActionsCollections
  extends Collection<PTR.Models.Action.AnyInstance>,
  Record<ActionType, Collection<PTR.Models.Action.AnyInstance>> { }
