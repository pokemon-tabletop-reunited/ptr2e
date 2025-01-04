import { MigrationBase } from "../base.ts"

export class Migration107AbsolutePaths extends MigrationBase {
  static override version = 0.107;

  override async updateItem(source: PTR.Item.Source): Promise<void> {
    if (source.img?.startsWith('/')) {
      source.img = source.img.substring(1);
    }
  }

  override async updateActor(source: PTR.Actor.Source): Promise<void> {
    if (source.img?.startsWith('/')) {
      source.img = source.img.substring(1);
    }
  }
}