import { ItemPTR2e } from "@item";
import { ActorPTR2e } from "@actor";
import { MigrationBase } from "../base.ts"

export class Migration107AbsolutePaths extends MigrationBase {
  static override version = 0.107;

  override async updateItem(source: ItemPTR2e["_source"]): Promise<void> {
    if (source.img.startsWith('/')) {
      //@ts-expect-error - This is still a properly formatted img path
      source.img = source.img.substring(1);
    }
  }

  override async updateActor(source: ActorPTR2e["_source"]): Promise<void> {
    if (source.img.startsWith('/')) {
      //@ts-expect-error - This is still a properly formatted img path
      source.img = source.img.substring(1);
    }
  }
}