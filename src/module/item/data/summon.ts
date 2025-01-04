import { type SummonPTR2e } from "@item";
import { HasActions, HasEmbed, HasMigrations, HasSlug, HasTraits } from "@module/data/index.ts";
import { type MigrationSchema } from "@module/data/mixins/has-migrations.ts";
import { type ActionsSchema } from "@module/data/mixins/has-actions.ts";
import { type SlugSchema } from "@module/data/mixins/has-slug.ts";
import { type TraitsSchema } from "@module/data/mixins/has-traits.ts";
import HasDescription, { type DescriptionSchema } from "@module/data/mixins/has-description.ts";

const summonSchema = {
  baseAV: new foundry.data.fields.NumberField({
    required: true,
    initial: 0,
    nullable: false,
    min: 0,
    label: "PTR2E.FIELDS.baseAV.label",
    hint: "PTR2E.FIELDS.baseAV.hint"
  }),
  duration: new foundry.data.fields.NumberField({
    required: true,
    initial: 1,
    nullable: false,
    min: 1,
    label: "PTR2E.FIELDS.duration.label",
    hint: "PTR2E.FIELDS.duration.hint"
  }),
  owner: new foundry.data.fields.DocumentUUIDField({
    required: true,
    nullable: true,
    initial: null,
    type: "Actor"
  })
}

export type SummonItemSchema = typeof summonSchema & MigrationSchema & ActionsSchema & DescriptionSchema & TraitsSchema & SlugSchema;

/**
 * @category Item Data Models
 * @extends {HasBase}
 * @extends {foundry.abstract.TypeDataModel}
 */
export default abstract class SummonSystem extends HasEmbed(
  HasMigrations(HasActions(HasDescription(HasTraits(HasSlug(foundry.abstract.TypeDataModel)))))<SummonItemSchema, Item.ConfiguredInstance>,
  "summon"
) {
  /**
   * @internal
   */
  declare parent: SummonPTR2e;

  static override defineSchema(): SummonItemSchema {
    return {
      ...super.defineSchema() as MigrationSchema & ActionsSchema & DescriptionSchema & TraitsSchema & SlugSchema,
      ...summonSchema
    };
  }

  override prepareBaseData(): void {
    super.prepareBaseData();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async _preCreate(data: foundry.abstract.TypeDataModel.ParentAssignmentType<SummonItemSchema, Item.ConfiguredInstance>, options: foundry.abstract.Document.PreCreateOptions<any>, user: User): Promise<boolean | void> {
    const result = await super._preCreate(data, options, user);
    if (result === false) return false;

    if (!data.img || data.img === "icons/svg/item-bag.svg") {
      this.parent.updateSource({
        img: "systems/ptr2e/img/icons/summon_icon.webp"
      })
    }
  }

  get actor(): Actor.ConfiguredInstance | null {
    return this.owner ? fromUuidSync<Actor.ConfiguredInstance>(this.owner) as Actor.ConfiguredInstance : null;
  }
}