import { PTRCONSTS } from ".";
import { ActorPTR2e } from "./actor/document";
import type { ActionType } from "./constants";
import type { ItemPTR2e } from "./item/document";
import type { AttackPTR2e } from "./models/actions";
import ActionPTR2e from "./models/actions/action";

export class ActionsCollections extends Collection<ActionPTR2e> {
  //@ts-expect-error - Intended.
  parent: ActorPTR2e.Any | ItemPTR2e.Any;
  declare attack: Collection<AttackPTR2e>;

  constructor(parent: ActorPTR2e.Any | ItemPTR2e.Any, sourceArray: ActionPTR2e[] = []) {
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
    (this as Record<ActionType, Collection<ActionPTR2e>>)[value.type as ActionType].set(slug, value as AttackPTR2e);

    return this;
  }

  override delete(key: string): boolean {
    const action = this.get(key);
    if (!action) return false;

    // Remove the action from the appropriate collection
    (this as Record<ActionType, Collection<ActionPTR2e>>)[action.type as ActionType].delete(key);

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
  addActionsFromItem(item: ItemPTR2e.Any) {
    const actions = item.actions;
    for (const action of actions) {
      this.set(action.slug, action);
      if (this.parent instanceof ActorPTR2e) {
        if(!["attack", "generic"].includes(action.type)) continue;
        if (action.variant && !(action as AttackPTR2e).free) continue;

        //@ts-expect-error - Flags has not yet been typed
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        this.parent.flags.ptr2e.disableActionOptions!.collection.set(action.slug, action);
      }
    }
    return this;
  }

  /**
   * Get the item hosting a given action by its slug
   */
  getItem(actionSlug: string): Maybe<ItemPTR2e.Any> {
    return this.get(actionSlug)?.item as Maybe<ItemPTR2e.Any>;
  }
}

export interface ActionsCollections
  extends Collection<ActionPTR2e>,
  Record<ActionType, Collection<ActionPTR2e>> { }
