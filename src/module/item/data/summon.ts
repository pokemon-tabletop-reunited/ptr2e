import { SummonPTR2e } from "@item";
import { ActionPTR2e, HasActions, HasEmbed, HasMigrations, HasPublication, HasSlug, HasTraits } from "@module/data/index.ts";
import { BaseItemSourcePTR2e, ItemSystemSource } from "./system.ts";
import { HasBaseSchema } from "@module/data/mixins/has-base.ts";
import { MigrationSchema } from "@module/data/mixins/has-migrations.ts";
import { ActionsSchema } from "@module/data/mixins/has-actions.ts";
import { SlugSchema } from "@module/data/mixins/has-slug.ts";
import { TraitsSchema } from "@module/data/mixins/has-traits.ts";
import HasDescription, { DescriptionSchema } from "@module/data/mixins/has-description.ts";
import { ActorPTR2e } from "@actor";
import { PublicationSchema } from "@module/data/mixins/has-publication.ts";

/**
 * @category Item Data Models
 * @extends {HasBase}
 * @extends {foundry.abstract.TypeDataModel}
 */
export default abstract class SummonSystem extends HasEmbed(
  HasMigrations(HasActions(HasDescription(HasTraits(HasSlug(HasPublication(foundry.abstract.TypeDataModel)))))), 
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
      baseAV: new fields.NumberField({required: true, initial: 0, nullable: false, min: 0, label: "PTR2E.FIELDS.baseAV.label", hint: "PTR2E.FIELDS.baseAV.hint"}),
      duration: new fields.NumberField({required: true, initial: 1, nullable: false, min: 1, label: "PTR2E.FIELDS.duration.label", hint: "PTR2E.FIELDS.duration.hint"}),
      owner: new fields.DocumentUUIDField({required: true, nullable: true, initial: null, type: "Actor"}),
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

  get actor(): ActorPTR2e | null {
    return fromUuidSync<ActorPTR2e>(this.owner);
  }
}

export default interface SummonSystem extends ModelPropsFromSchema<SummonSchema> {
  actions: Collection<ActionPTR2e>;

  _source: SourceFromSchema<SummonSchema>;
}

interface SummonSchema extends foundry.data.fields.DataSchema, DescriptionSchema, TraitsSchema, SlugSchema, MigrationSchema, ActionsSchema, PublicationSchema {
  baseAV: foundry.data.fields.NumberField<number, number, true, false, true>;
  duration: foundry.data.fields.NumberField<number, number, true, false, true>;
  owner: foundry.data.fields.DocumentUUIDField<string>;
}

export type SummonSource = BaseItemSourcePTR2e<"summon", SummonSystemSource>;

interface SummonSystemSource extends ItemSystemSource {
  baseAV: number;
  duration: number;
}