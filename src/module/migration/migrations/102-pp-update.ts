import { ItemPTR2e } from "@item";
import { MigrationBase } from "../base.ts"
import { sluggify } from "@utils";
import MoveSystem from "@item/data/move.ts";

export class Migration102PPUpdate extends MigrationBase {
    static override version = 0.102;

    _map: Map<string, ItemPTR2e<MoveSystem>["_source"]> | null = null;

    async getMap() {
        return this._map ?? (this._map = await (async () => {
            const entries = await game.packs.get("ptr2e.core-moves")?.getDocuments() as ItemPTR2e<MoveSystem>[];
            if(!entries) throw new Error("Could not find core moves pack.");
            return entries.reduce((map, entry) => {
                const slug = entry.system.slug || sluggify(entry.name);
                map.set(slug, entry._source);
                return map;
            }, new Map<string, ItemPTR2e<MoveSystem>["_source"]>());
        })());
    }

    isMoveItem(item: ItemPTR2e['_source']): item is ItemPTR2e<MoveSystem>['_source'] {
        return item.type === "move";
    }

    override async updateItem(source: ItemPTR2e["_source"]): Promise<void> {
        if(!this.isMoveItem(source)) return;
        if(!('actions' in source.system && source.system.actions)) return;
        const slug = source.system.slug || sluggify(source.name);

        const entry = (await this.getMap()).get(slug);
        if(!entry) return;

        const primaryAction = source.system.actions.find(action => action.slug === slug) ?? source.system.actions.find(action => action.type === "attack");
        const entryPrimaryAction = entry.system.actions.find(action => action.slug === slug) ?? entry.system.actions.find(action => action.type === "attack");
        if(!primaryAction || !entryPrimaryAction) {
            console.warn(`Item ${source.name} is missing a primary action.`);
            return;
        }

        primaryAction.cost.powerPoints = entryPrimaryAction.cost.powerPoints;
        primaryAction.traits = entryPrimaryAction.traits;
        source.system.grade = entry.system.grade;
    }
}