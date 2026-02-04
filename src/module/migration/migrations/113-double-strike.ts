import { ItemPTR2e } from "@item";
import { MigrationBase } from "../base.ts"

/**
 * Update trait 2-strike to double-strike
 */

export class Migration112Attacks extends MigrationBase {
  static override version = 0.113;

  override async updateItem(source: ItemPTR2e["_source"]): Promise<void> {
    if (!('actions' in source.system && source.system.actions && Array.isArray(source.system.actions))) return;
    
    for(const action of source.system.actions) {
      if(action.traits && Array.isArray(action.traits) && action.traits.includes("2-strike")) {
        action.traits = action.traits.filter((t: string) => t !== "2-strike");
        action.traits.push("double-strike");
      }
    }
  }
}