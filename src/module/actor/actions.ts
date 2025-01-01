import type { ActionType, AttackPTR2e} from "@data";
import { ActionPTR2e, PTRCONSTS } from "@data";
import ActorPTR2e from "./base.ts";
import type { ItemPTR2e, ItemWithActions } from "@item";

export class ActionsCollections extends Collection<ActionPTR2e> {
  parent: ActorPTR2e | ItemPTR2e;
  declare attack: Collection<AttackPTR2e>;

  constructor(parent: ActorPTR2e | ItemPTR2e, sourceArray: ActionPTR2e[] = []) {
    super(sourceArray.map((source) => [source.slug, source]));

    const data: PropertyDescriptorMap = Object.values(
      PTRCONSTS.ActionTypes
    ).reduce<PropertyDescriptorMap>(
      (acc, type) => ({ ...acc, [type]: { value: new Collection<ActionPTR2e>() } }),
      {
        parent: { value: parent, writable: false },
      }
    );
    Object.defineProperties(this, data);
  }

  override set(slug: Maybe<string>, value: ActionPTR2e) {
    if (!(value instanceof ActionPTR2e))
      throw new Error("ActionsCollection can only contain ActionPTR2e instances");

    // Set the slug if it's not already set
    slug ||= value.slug;
    if (!slug) {
      throw new Error("Action must have a slug");
    }

    //Add the action to the appropriate collection, as well as the main collection
    super.set(slug, value);
    this[value.type].set(slug, value as AttackPTR2e);

    return this;
  }

  //@ts-expect-error: fvtt-types issue
  override delete(key: string): boolean {
    const action = this.get(key);
    if (!action) return false;

    // Remove the action from the appropriate collection
    this[action.type].delete(key);

    // Remove the action from the main collection
    return super.delete(key);
  }

  //@ts-expect-error: fvtt-types issue
  override clear(): void {
    super.clear();
    for (const key of Object.values(PTRCONSTS.ActionTypes)) {
      this[key].clear();
    }
  }

  /**
   * Add all actions from an item to the collection
   */
  addActionsFromItem(item: ItemWithActions) {
    const actions = item.actions;
    for (const action of actions) {
      this.set(action.slug, action);
      if (this.parent instanceof ActorPTR2e) {
        if(!["attack", "generic"].includes(action.type)) continue;
        if (action.variant && !(action as unknown as {free: boolean}).free) continue;

        this.parent.flags.ptr2e.disableActionOptions!.collection.set(action.slug, action);
      }
    }
    return this;
  }

  /**
   * Get the item hosting a given action by its slug
   */
  getItem(actionSlug: string): Maybe<ItemWithActions> {
    return this.get(actionSlug)?.item as Maybe<ItemWithActions>;
  }
}

export interface ActionsCollections
  extends Collection<ActionPTR2e>,
  Record<ActionType, Collection<ActionPTR2e>> { }
