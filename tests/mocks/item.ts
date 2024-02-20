import { ActorPTR2e } from "@actor";
import { ItemPTR2e, ItemSystemPTR2e } from "@item";

type ItemSourcePTR2e = ItemPTR2e['_source'];

export class MockItem {
    readonly _source: ItemSourcePTR2e;

    readonly parent: ActorPTR2e | null;

    constructor(
        data: ItemSourcePTR2e,
        public options: DocumentConstructionContext<ActorPTR2e | null> = {},
    ) {
        this._source = fu.duplicate(data);
        this.parent = options.parent ?? null;
    }

    get id() {
        return this._source._id;
    }

    get name() {
        return this._source.name;
    }

    get system() {
        return this._source.system;
    }

    static async updateDocuments(
        updates: Record<string, unknown>[] = [],
        _context: DocumentModificationContext<ActorPTR2e | null> = {},
    ): Promise<ItemPTR2e<ItemSystemPTR2e, ActorPTR2e | null>[]> {
        return updates.flatMap((update) => {
            const item = game.items.find((item) => item.id === update._id);
            if (item) fu.mergeObject(item._source, update, { performDeletions: true });
            return item ?? [];
        });
    }

    update(changes: object): void {
        fu.mergeObject(this._source, changes, { performDeletions: true });
    }

    toObject(): ItemSourcePTR2e {
        return fu.duplicate(this._source);
    }
}