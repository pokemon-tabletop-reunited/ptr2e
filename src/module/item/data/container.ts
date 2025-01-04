import { HasContainer, HasDescription, HasSlug, HasTraits, HasGearData, HasEmbed, HasMigrations } from "@module/data/index.ts";
import type { SlugSchema } from "@module/data/mixins/has-slug.ts";
import type { MigrationSchema } from "@module/data/mixins/has-migrations.ts";
import type { TraitsSchema } from "@module/data/mixins/has-traits.ts";
import type { DescriptionSchema } from "@module/data/mixins/has-description.ts";
import type { ContainerSchema } from "@module/data/mixins/has-container.ts";
import type { GearDataSchema } from "@module/data/mixins/has-gear-data.ts";

const containerSchema = {
  collapsed: new foundry.data.fields.BooleanField({ required: true, initial: false, label: "PTR2E.FIELDS.collapsed.label", hint: "PTR2E.FIELDS.collapsed.hint" }),
}

export type ContainerSystemSchema = typeof containerSchema & SlugSchema & MigrationSchema & TraitsSchema & DescriptionSchema & ContainerSchema & GearDataSchema;

/**
 * @category Item Data Models
 */
export default abstract class ContainerSystem extends HasEmbed(HasMigrations(HasGearData(HasTraits(HasDescription(HasSlug(HasContainer(foundry.abstract.TypeDataModel)))))), "container")<ContainerSystemSchema, Item.ConfiguredInstance> {
  /**
   * @internal
   */
  // declare parent: ContainerPTR2e;

  static override defineSchema(): ContainerSystemSchema {
    return {
      ...super.defineSchema() as SlugSchema & MigrationSchema & TraitsSchema & DescriptionSchema & ContainerSchema & GearDataSchema,
      ...containerSchema,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    override async _preCreate(data: foundry.abstract.TypeDataModel.ParentAssignmentType<ContainerSystemSchema, Item.ConfiguredInstance>, options: foundry.abstract.Document.PreCreateOptions<any>, user: User): Promise<boolean | void> {
    const result = await super._preCreate(data, options, user);
    if (result === false) return false;

    if (!data.img || data.img === "icons/svg/item-bag.svg") {
      this.parent.updateSource({
        img: "systems/ptr2e/img/icons/consumable_icon.webp"
      })
    }
  }
}