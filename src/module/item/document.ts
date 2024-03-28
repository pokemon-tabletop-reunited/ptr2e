import { ActorPTR2e } from "@actor";
import { ItemSheetPTR2e, ItemSystemPTR } from "@item";
import { ActionType, ActionPTR2e } from "@data";
import Document, { _Document } from "types/foundry/common/abstract/document.js";
import { DataSchema } from "types/foundry/common/data/fields.js";

/**
 * @extends {PTRItemData}
 */
class ItemPTR2e<
    TSystem extends ItemSystemPTR = ItemSystemPTR,
    TParent extends ActorPTR2e | null = ActorPTR2e | null,
> extends Item<TParent, TSystem> {
    declare _sheet: ItemSheetPTR2e<this> | null;
    override get sheet() {
        return super.sheet as ItemSheetPTR2e<this>;
    }

    protected override _initializeSource(data: object & {_stats: {systemId: string}, type: string}, options?: DataModelConstructionOptions<TParent> | undefined): this["_source"] {
        if(data?._stats?.systemId === "ptu") {
            data.type = "ptu-item";
        }
        return super._initializeSource(data, options);
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
        if (this.type === "ptu-item") return super.prepareBaseData();
        this._actions = {
            generic: new Map(),
            attack: new Map(),
            exploration: new Map(),
            downtime: new Map(),
            camping: new Map(),
            passive: new Map(),
        };
        super.prepareBaseData();
    }

    override prepareDerivedData(): void {
        super.prepareDerivedData();
        if (this.type === "ptu-item") return;

        if (!this.parent) return;
        const actions = this.parent._actions;
        for (const type in this.actions) {
            const key = type as ActionType;
            for (const action of this.actions[key].values()) {
                if (actions[key].has(action.slug)) {
                    console.warn(
                        `Duplicate action found in Item ${this.id}: ${action.slug} for Actor ${this.parent.id}`
                    );
                    continue;
                }
                actions[key].set(action.slug, action);
            }
        }
    }

    async toChat() {
        return ChatMessage.create({
            content: `<span>@Embed[${this.uuid} caption=false classes=no-tooltip]</span>`,
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        });
    }

    static override async fromDropData<TDocument extends Document<_Document | null, DataSchema>>(this: ConstructorOf<TDocument>, data: DropCanvasData, options?: Record<string, unknown> | undefined): Promise<TDocument | undefined> {
        if(data?.type !== "ActiveEffect") return super.fromDropData(data, options) as Promise<TDocument | undefined>;

        let document = null;

        // Case 1 - Data explicitly provided
        if ( data.data ) document = new CONFIG.ActiveEffect.documentClass(data.data as any);

        // Case 2 - UUID provided
        else if ( data.uuid ) document = await fromUuid(data.uuid);

        // Ensure that we have an ActiveEffect document
        if(!document) throw new Error("Failed to resolve Document from provided DragData. Either data or a UUID must be provided.");
        if(document.documentName !== "ActiveEffect") throw new Error("Invalid drop data provided for ActiveEffect Item creation");

        // Create item document with the ActiveEffect data
        return new this({
            name: document.name,
            type: "effect",
            effects: [document.toObject()]
        })
    }
}

interface ItemPTR2e<
    TSystem extends ItemSystemPTR = ItemSystemPTR,
    TParent extends ActorPTR2e | null = ActorPTR2e | null,
> extends Item<TParent, TSystem> {
    _actions: Record<ActionType, Map<string, ActionPTR2e>>;
}

export { ItemPTR2e };
