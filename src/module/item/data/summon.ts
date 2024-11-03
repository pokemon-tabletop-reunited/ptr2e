import { SummonPTR2e } from "@item";
import { ActionPTR2e, HasActions, HasEmbed, HasMigrations, HasSlug, HasTraits } from "@module/data/index.ts";
import { BaseItemSourcePTR2e, ItemSystemSource } from "./system.ts";
import { HasBaseSchema } from "@module/data/mixins/has-base.ts";
import { MigrationSchema } from "@module/data/mixins/has-migrations.ts";
import { ActionsSchema } from "@module/data/mixins/has-actions.ts";
import { SlugSchema } from "@module/data/mixins/has-slug.ts";
import { TraitsSchema } from "@module/data/mixins/has-traits.ts";
import HasDescription, { DescriptionSchema } from "@module/data/mixins/has-description.ts";

/**
 * @category Item Data Models
 * @extends {HasBase}
 * @extends {foundry.abstract.TypeDataModel}
 */
export default abstract class SummonSystem extends HasEmbed(
  HasMigrations(HasActions(HasDescription(HasTraits(HasSlug(foundry.abstract.TypeDataModel))))), 
  "summon"
) {
  /**
   * @internal
   */
  declare parent: SummonPTR2e;

  static override defineSchema(): SummonSchema {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema() as HasBaseSchema,      
      baseAV: new fields.NumberField({required: true, initial: 0, nullable: false, min: 0}),
      duration: new fields.NumberField({required: true, initial: 1, nullable: false, min: 1}),
    };
  }

  override prepareBaseData(): void {
    super.prepareBaseData();
  }

  override async _preCreate(data: this["parent"]["_source"], options: DocumentModificationContext<this["parent"]["parent"]>, user: User): Promise<boolean | void> {
    const result = await super._preCreate(data, options, user);
    if (result === false) return false;

    if (!data.img || data.img === "icons/svg/item-bag.svg") {
      this.parent.updateSource({
        img: "systems/ptr2e/img/icons/summon_icon.webp"
      })
    }
  }
}

export default interface SummonSystem extends ModelPropsFromSchema<SummonSchema> {
  actions: Collection<ActionPTR2e>;

  _source: SourceFromSchema<SummonSchema>;
}

interface SummonSchema extends foundry.data.fields.DataSchema, DescriptionSchema, TraitsSchema, SlugSchema, MigrationSchema, ActionsSchema {
  baseAV: foundry.data.fields.NumberField<number, number, true, false, true>;
  duration: foundry.data.fields.NumberField<number, number, true, false, true>;
}

export type SummonSource = BaseItemSourcePTR2e<"summon", SummonSystemSource>;

interface SummonSystemSource extends ItemSystemSource {
  baseAV: number;
  duration: number;
}