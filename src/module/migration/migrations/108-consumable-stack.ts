import type { ConsumableSchema } from "@item/data/consumable.ts";
import { MigrationBase } from "../base.ts"

export class Migration108ConsumableStack extends MigrationBase {
  static override version = 0.108;

  override async updateItem(source: PTR.Item.Source): Promise<void> {
    // Only update consumables
    if (source.type !== "consumable") return;

    // find a stack trait
    const stackValue = (source.system.traits as unknown as string[])!
      .filter((t: string) => t.match(/^stack-[0-9]+$/))
      .map((t: string) => parseInt(t.substring(6)))
      .filter((stack) => !isNaN(stack))
      // @ts-expect-error - This is valid
      .reduce(Math.max, 1)
    if (stackValue > 1) {
      (source.system as foundry.data.fields.SchemaField.PersistedType<ConsumableSchema>).stack = stackValue;
    }
  }
}