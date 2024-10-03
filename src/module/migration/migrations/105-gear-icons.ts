import { ItemPTR2e } from "@item";
import { MigrationBase } from "../base.ts"

export class Migration105GearIcons extends MigrationBase {
  static override version = 0.105;

  override async updateItem(source: ItemPTR2e["_source"]): Promise<void> {
    if (source.img == '/systems/ptr2e/img/icons/item_icon.webp') {
      //@ts-expect-error - This is a properly formatted img path
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