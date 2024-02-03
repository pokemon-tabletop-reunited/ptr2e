import { ActorPTR2e } from "@actor";
import { ItemPTR2e, ItemSystemPTR2e } from "@item";
import { MockItem } from "./item.ts";
import { ItemSchema } from "types/foundry/common/documents/item.js";
import { MockCollection } from "./collection.ts";

type ActorSourcePTR2e = ActorPTR2e['_source'];

export class MockActor {
    _source: ActorSourcePTR2e;

    readonly items: MockCollection<ItemPTR2e<ItemSystemPTR2e, ActorPTR2e>> = new MockCollection();

    constructor(data: ActorSourcePTR2e, public options: DocumentConstructionContext<null> = {}) {
        this._source = fu.duplicate(data);
        this._source.items ??= []
        this.prepareData();
    }

    prepareData() {
        const sourceIds = this._source.items.map((source) => source._id);
        for (const item of this.items) {
            if (!sourceIds.includes(item.id)) {
                this.items.delete(item.id);
            }
        }

        for (const source of this._source.items as unknown as SourceFromSchema<ItemSchema<string, ItemSystemPTR2e>>[]) {
            const item = this.items.get(source._id ?? "");
            if (item) {
                (item as { _source: object })._source = fu.duplicate(source);
            } else {
                this.items.set(
                    source._id ?? "",
                    new MockItem(source, { parent: this as unknown as ActorPTR2e }) as unknown as ItemPTR2e<ItemSystemPTR2e, ActorPTR2e>,
                );
            }
        }
    }
}