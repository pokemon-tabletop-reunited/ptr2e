import { MigrationBase } from "../base.ts"

export class Migration105GearIcons extends MigrationBase {
  static override version = 0.105;

  override async updateItem(source: PTR.Item.Source): Promise<void> {
    if (source.img == '/systems/ptr2e/img/icons/item_icon.webp') {
      source.img = "/systems/ptr2e/img/icons/" + (() => {
        switch (source.type) {
          case "consumable": return "consumable";
          case "equipment": return "equipment";
          case "weapon": return "weapon";
          case "container": return "container";
          case "gear":
          default: return "gear";
        }
      })() + "_icon.webp";
    }
  }
}