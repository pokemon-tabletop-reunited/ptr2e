import { ActorPTR2e } from "@actor";
import { ItemSheetPTR2e, ItemSystemPTR } from "@item";
import { ActionType, ActionPTR2e, RollOptionManager, Trait } from "@data";
import { ActiveEffectPTR2e } from "@effects";
import { ItemFlagsPTR2e } from "./data/system.ts";

/**
 * @extends {PTRItemData}
 */
class ItemPTR2e<
    TSystem extends ItemSystemPTR = ItemSystemPTR,
    TParent extends ActorPTR2e | null = ActorPTR2e | null,
> extends Item<TParent, TSystem> {
    declare grantedBy: ItemPTR2e | ActiveEffectPTR2e | null;

    declare sourceId: string;

    declare _sheet: ItemSheetPTR2e<this> | null;

    override get sheet() {
        return super.sheet as ItemSheetPTR2e<this>;
    }

    protected override _initializeSource(
        data: object & { _stats: { systemId: string }; type: string },
        options?: DataModelConstructionOptions<TParent> | undefined
    ): this["_source"] {
        if (data?._stats?.systemId === "ptu") {
            data.type = "ptu-item";
        }
        return super._initializeSource(data, options);
    }

    get slug() {
        return this.system.slug;
    }

    get traits(): Map<string, Trait> | null {
        return "traits" in this.system ? this.system.traits : null;
    }

    getRollOptions(prefix = this.type, { includeGranter = true } = {}): string[] {
        const traitOptions = ((): string[] => {
            if (!this.traits) return [];
            const options = [];
            for (const trait of this.traits.values()) {
                options.push(`trait:${trait.slug}`);
            }
            return options;
        })();

        const granterOptions = includeGranter
            ? this.grantedBy
                  ?.getRollOptions("granter", { includeGranter: false })
                  .map((o) => `${prefix}:${o}`) ?? []
            : [];

        const options = [
            `${prefix}:id:${this.id}`,
            `${prefix}:${this.slug}`,
            `${prefix}:slug:${this.slug}`,
            ...granterOptions,
            ...(this.parent?.getRollOptions() ?? []).map((o) => `${prefix}:${o}`),
            ...traitOptions.map((o) => `${prefix}:${o}`),
        ];

        return options;
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

        this.rollOptions = new RollOptionManager(this);

        this.rollOptions.addOption("item", `type:${this.type}`, { addToParent: false });

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

        this.rollOptions.addOption("item", `${this.type}:${this.slug}`);
    }

    async toChat() {
        return ChatMessage.create({
            content: `<span>@Embed[${this.uuid} caption=false classes=no-tooltip]</span>`,
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        });
    }

    static override async fromDropData<TDocument extends foundry.abstract.Document>(
        this: ConstructorOf<TDocument>,
        data: DropCanvasData,
        options?: Record<string, unknown> | undefined
    ): Promise<TDocument | undefined> {
        if (data?.type !== "ActiveEffect")
            return super.fromDropData(data, options) as Promise<TDocument | undefined>;

        let document: ActiveEffectPTR2e | null = null;

        // Case 1 - Data explicitly provided
        if (data.data)
            document = new CONFIG.ActiveEffect.documentClass(data.data as any) as ActiveEffectPTR2e;
        // Case 2 - UUID provided
        else if (data.uuid) document = await fromUuid(data.uuid);

        // Ensure that we have an ActiveEffect document
        if (!document)
            throw new Error(
                "Failed to resolve Document from provided DragData. Either data or a UUID must be provided."
            );
        if (document.documentName !== "ActiveEffect")
            throw new Error("Invalid drop data provided for ActiveEffect Item creation");

        // Create item document with the ActiveEffect data
        return new this({
            name: document.name,
            type: "effect",
            effects: [document.toObject()],
            _id: document._id,
        });
    }

    static override async createDocuments<TDocument extends foundry.abstract.Document>(
        this: ConstructorOf<TDocument>,
        data?: (TDocument | PreCreate<TDocument["_source"]>)[],
        context?: DocumentModificationContext<TDocument["parent"]>
    ): Promise<TDocument[]> {
        const sources = data?.map((d) => (d instanceof ItemPTR2e ? d.toObject() : d as PreCreate<ItemPTR2e["_source"]>)) ?? [];

        const actor = context?.parent as ActorPTR2e | null;
        if (!actor) return super.createDocuments<TDocument>(data, context);

        const specialTypes = ["species"];

        for (const source of sources) {
            if (specialTypes.includes(source.type as string)) {
                switch (source.type) {
                    case "species": {
                        return [];
                    }
                }
                return [];
            }
        }

        return super.createDocuments<TDocument>(data, context);
    }
}

interface ItemPTR2e<
    TSystem extends ItemSystemPTR = ItemSystemPTR,
    TParent extends ActorPTR2e | null = ActorPTR2e | null,
> extends Item<TParent, TSystem> {
    constructor: typeof ItemPTR2e;
    flags: ItemFlagsPTR2e;
    readonly _source: foundry.documents.ItemSource<string, TSystem>;

    _actions: Record<ActionType, Map<string, ActionPTR2e>>;

    rollOptions: RollOptionManager<this>;
}

export { ItemPTR2e };
