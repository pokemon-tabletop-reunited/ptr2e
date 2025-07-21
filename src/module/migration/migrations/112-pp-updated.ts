import { ItemPTR2e } from "@item";
import { MigrationBase } from "../base.ts"

export class Migration112PpUpdated extends MigrationBase {
  static override version = 0.112;

  override async updateItem(source: ItemPTR2e["_source"]): Promise<void> {
    // @ts-expect-error - Incorrect typing
    if(source?.system?.traits?.length) {
      // @ts-expect-error - Incorrect typing
      source.system.traits = source.system.traits.filter(trait => trait != "pp-updated");
    }

    if (!('actions' in source.system && source.system.actions && Array.isArray(source.system.actions))) return;
    source.system.actions = source.system.actions.reduce((acc, action) => {
      if(action.traits?.length) action.traits = action.traits.filter((trait: string) => trait != "pp-updated");
      return [...acc, action];
    }, [])
    
  }
}