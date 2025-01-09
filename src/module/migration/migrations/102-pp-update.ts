import { MigrationBase } from "../base.ts"
import { sluggify } from "@utils";

export class Migration102PPUpdate extends MigrationBase {
  static override version = 0.102;

  _map: Map<string, PTR.Item.System.Move.ParentSource> | null = null;

  async getMap() {
    return this._map ?? (this._map = await (async () => {
      const entries = await game.packs.get("ptr2e.core-moves")?.getDocuments() as Item.ConfiguredInstance[];
      if (!entries) throw new Error("Could not find core moves pack.");
      return entries.reduce((map, entry) => {
        const slug = entry.system.slug || sluggify(entry.name);
        map.set(slug, entry._source as PTR.Item.System.Move.ParentSource);
        return map;
      }, new Map<string, PTR.Item.System.Move.ParentSource>());
    })());
  }

  isMoveItem(item: PTR.Item.Source): item is PTR.Item.System.Move.ParentSource {
    return item.type === "move"
  }

  override async updateItem(source: PTR.Item.Source): Promise<void> {
    if (!this.isMoveItem(source)) return;
    if (!('actions' in source.system && source.system.actions)) return;
    const slug = source.system.slug || sluggify(source.name);

    const entry = (await this.getMap()).get(slug);
    if (!entry) return;

    const primaryAction = source.system.actions.find(action => action.slug === slug) ?? source.system.actions.find(action => action.type === "attack");
    const entryPrimaryAction = entry.system.actions?.find(action => action.slug === slug) ?? entry.system.actions?.find(action => action.type === "attack");
    if (!primaryAction || !entryPrimaryAction) {
      console.warn(`Item ${source.name} is missing a primary action.`);
      return;
    }

    primaryAction.cost.powerPoints = entryPrimaryAction.cost.powerPoints;
    primaryAction.traits = entryPrimaryAction.traits;
    source.system.grade = entry.system.grade;
  }
}