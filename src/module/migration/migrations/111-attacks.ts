import { ItemPTR2e } from "@item";
import { MigrationBase } from "../base.ts"
import { sluggify } from "@utils";
import MoveSystem from "@item/data/move.ts";

export class Migration111Attacks extends MigrationBase {
  static override version = 0.111;

  _map: Map<string, ItemPTR2e<MoveSystem>["_source"]> | null = null;

  async getMap() {
    return this._map ?? (this._map = await (async () => {
      const entries = await game.packs.get("ptr2e.core-moves")?.getDocuments() as ItemPTR2e<MoveSystem>[];
      if (!entries) throw new Error("Could not find core moves pack.");
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
    if (!this.isMoveItem(source)) return;
    if (!('actions' in source.system && source.system.actions)) return;
    const slug = source.system.slug || sluggify(source.name);

    const entry = (await this.getMap()).get(slug);
    if (!entry) return;

    const primaryAction = source.system.actions.find(action => action.slug === slug) ?? source.system.actions.find(action => action.type === "attack");
    const entryPrimaryAction = entry.system.actions.find(action => action.slug === slug) ?? entry.system.actions.find(action => action.type === "attack");
    if (!primaryAction || !entryPrimaryAction) {
      console.warn(`Item ${source.name} is missing a primary action.`);
      return;
    }

    for(const action of source.system.actions) {
      const entryAction = entry.system.actions.find(a => a.slug === action.slug)
      if (!entryAction) {
        console.warn(`Unable to find action ${action.slug} in ${entry.name}`);
        return;
      }
      action.cost = entryAction.cost;
      action.range = entryAction.range;
      action.traits = entryAction.traits;
      action.category = entryAction.category;
      action.power = entryAction.power;
      action.accuracy = entryAction.accuracy;
      action.types = entryAction.types;
      action.description = entryAction.description;
    }
    source.system.grade = entry.system.grade;
  }
}