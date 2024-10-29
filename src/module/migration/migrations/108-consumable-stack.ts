import { ItemPTR2e } from "@item";
import { MigrationBase } from "../base.ts"

export class Migration108ConsumableStack extends MigrationBase {
  static override version = 0.108;

  override async updateItem(source: ItemPTR2e["_source"]): Promise<void> {
    // Only update consumables
    if (source.type !== "consumable") return;

    // find a stack trait
    const stackValue = (source.system.traits as unknown as string[])!
        .filter((t: string)=>t.match(/^stack-[0-9]+$/))
        .map((t: string)=>parseInt(t.substring(6)))
        .filter((stack)=>!isNaN(stack))
        // @ts-expect-error
        .reduce(Math.max, 1)
    if (stackValue > 1) {
        source.system.stack = stackValue;
    }
  }
}