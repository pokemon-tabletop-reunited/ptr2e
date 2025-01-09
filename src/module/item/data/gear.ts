import { HasBase, HasEmbed, HasGearData, HasIdentification, } from "@module/data/index.ts";
import type { IdentificationSchema } from "@module/data/mixins/has-identification.ts";
import type { GearDataSchema } from "@module/data/mixins/has-gear-data.ts";
import type { HasBaseSchema } from "@module/data/mixins/has-base.ts";

export type GearSystemSchema = IdentificationSchema & GearDataSchema & HasBaseSchema;

/**
 * @category Item Data Models
 */
export default abstract class GearSystem extends HasEmbed(HasIdentification(HasGearData(HasBase(foundry.abstract.TypeDataModel))), "gear")<GearSystemSchema, Item.ConfiguredInstance> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async _preCreate(data: foundry.abstract.TypeDataModel.ParentAssignmentType<GearSystemSchema, Item.ConfiguredInstance>, options: foundry.abstract.Document.PreCreateOptions<any>, user: foundry.documents.BaseUser): Promise<boolean | void> {
    const result = await super._preCreate(data, options, user);
    if (result === false) return false;

    if (!data.img || data.img === "icons/svg/item-bag.svg") {
      this.parent.updateSource({
        img: "systems/ptr2e/img/icons/gear_icon.webp"
      })
    }
    return result;
  }
}