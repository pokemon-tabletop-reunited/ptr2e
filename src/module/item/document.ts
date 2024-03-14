import { ActorPTR2e } from "@actor";
import { ItemSheetPTR2e, ItemSystemPTR } from "@item";
import { ActionType, ActionPTR2e } from "@data";

/**
 * @extends {PTRItemData}
 */
class ItemPTR2e<TSystem extends ItemSystemPTR = ItemSystemPTR, TParent extends ActorPTR2e | null = ActorPTR2e | null> extends Item<TParent, TSystem> {

    declare _sheet: ItemSheetPTR2e<this> | null;
    override get sheet() {
        return super.sheet as ItemSheetPTR2e<this>;
    }

    get slug() {
        return this.system.slug;
    }

    getRollOptions(): string[] {
        return [];
    }

    get actions() {
        return this._actions;
    }

    override prepareBaseData() {
        this._actions = {
            generic: new Map(),
            attack: new Map(),
            exploration: new Map(),
            downtime: new Map(),
            camping: new Map(),
            passive: new Map(),
        }
        super.prepareBaseData();
    }

    override prepareDerivedData(): void {
        super.prepareDerivedData();

        if (!this.parent) return;
        const actions = this.parent._actions;
        for (const type in this.actions) {
            const key = type as ActionType;
            for (const action of this.actions[key].values()) {
                if (actions[key].has(action.slug)) {
                    console.warn(`Duplicate action found in Item ${this.id}: ${action.slug} for Actor ${this.parent.id}`);
                    continue;
                }
                actions[key].set(action.slug, action);
            }
        }
    }

    async toChat() {
        return ChatMessage.create({
            content: `<span>@Embed[${this.uuid} caption=false]</span>`,
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        });
    }
}

interface ItemPTR2e<TSystem extends ItemSystemPTR = ItemSystemPTR, TParent extends ActorPTR2e | null = ActorPTR2e | null> extends Item<TParent, TSystem> {
    _actions: Record<ActionType, Map<string, ActionPTR2e>>;
}

export { ItemPTR2e }