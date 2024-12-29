import { HasBase, HasEmbed } from "@module/data/index.ts";
import type { HasBaseSchema } from "@module/data/mixins/has-base.ts";
import type { ItemPTR2e } from "@item/document.ts";

const abilitySchema = {
  slot: new foundry.data.fields.NumberField({
    required: true,
    nullable: true,
    initial: null,
    label: "PTR2E.FIELDS.slot.label",
    hint: "PTR2E.FIELDS.slot.hint",
  }),
  free: new foundry.data.fields.BooleanField({
    required: true,
    initial: false,
    label: "PTR2E.FIELDS.free.label",
    hint: "PTR2E.FIELDS.free.hint",
  }),
};

export type AbilitySchema = typeof abilitySchema & HasBaseSchema;

/**
 * @category Item Data Models
 * @extends {HasBase}
 * @extends {foundry.abstract.TypeDataModel}
 */
export default class AbilitySystem extends HasEmbed(HasBase(foundry.abstract.TypeDataModel<AbilitySchema, ItemPTR2e>), "ability") {
  /**
   * @internal
   */
  // declare parent: AbilityPTR2e;

  static override defineSchema(): AbilitySchema {
    return {
      ...super.defineSchema() as HasBaseSchema,
      ...abilitySchema,
    };
  }

  declare suppress: boolean | undefined;

  get isSuppressed(): boolean {
    return this.suppress ?? false;
  }

  override prepareDerivedData(): void {
    if (this.free || this.slot !== null) { 
      //this.parent.rollOptions.addOption("item", `${this.parent.type}:${this.parent.slug}:active`);
    }

    super.prepareDerivedData();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async _preCreate(data: foundry.abstract.TypeDataModel.ParentAssignmentType<AbilitySchema, ItemPTR2e>, options: foundry.abstract.Document.PreCreateOptions<any>, user: User): Promise<boolean | void> {
    const result = await super._preCreate(data, options, user);
    if (result === false) return false;

    if (!data.img || data.img === "icons/svg/item-bag.svg") {
      this.parent.updateSource({
        img: "systems/ptr2e/img/icons/ability_icon.webp"
      })
    }
  }
}