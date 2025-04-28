import { HasBase, type HasBaseSchema } from "../../mixins/has-base";
import { HasEmbed } from "../../mixins/has-embed";
import { HasGearData, type GearSchema } from "../../mixins/has-gear-data";

const gearSchema = {
}

declare namespace GearSystem {
  type Schema = typeof gearSchema & GearSchema & HasBaseSchema;
}

class GearSystem extends HasEmbed(HasGearData(HasBase(foundry.abstract.TypeDataModel)), "gear")<GearSystem.Schema, foundry.abstract.Document.Any> {
  static override defineSchema() {
    return {
      ...super.defineSchema(),
      ...gearSchema,
    };
  }
    
  override async _preCreate(
    data: Item.CreateData,
    options: Item.Database.PreCreateOptions,
    user: User.Implementation
  ): Promise<boolean | void> {
    //@ts-expect-error - Improper typing due to the parent needing to be set to Document.Any.
    const result = await super._preCreate(data, options, user);
    if (result === false) return false;

    if (!data.img || data.img === "icons/svg/item-bag.svg") {
      this.parent.updateSource({
        img: "systems/ptr2e/img/icons/species_icon.webp",
      });
    }
  }
}

export { GearSystem };