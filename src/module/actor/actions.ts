import { ActionPTR2e, ActionType, AttackPTR2e, PTRCONSTS } from "@data";
import ActorPTR2e from "./base.ts";
import { ItemPTR2e, ItemSystemsWithActions } from "@item";

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
    addActionsFromItem(item: ItemPTR2e<ItemSystemsWithActions>) {
        const actions = item.actions;
        for (const action of actions) {
            this.set(action.slug, action);
        }
        return this;
    }

    /**
     * Get the item hosting a given action by its slug
     */
    getItem(actionSlug: string): Maybe<ItemPTR2e<ItemSystemsWithActions>> {
        return this.get(actionSlug)?.item as Maybe<ItemPTR2e<ItemSystemsWithActions>>;
    }
}

export interface ActionsCollections
    extends Collection<ActionPTR2e>,
        Record<ActionType, Collection<ActionPTR2e>> {}
