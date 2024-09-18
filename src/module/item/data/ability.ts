import { AbilityPTR2e, ContainerPTR2e } from "@item";
import { ActionPTR2e, HasBase, HasEmbed } from "@module/data/index.ts";
import { BaseItemSourcePTR2e, ItemSystemSource } from "./system.ts";
import { HasBaseSchema } from "@module/data/mixins/has-base.ts";

/**
 * @category Item Data Models
 * @extends {HasBase}
 * @extends {foundry.abstract.TypeDataModel}
 */
export default abstract class AbilitySystem extends HasEmbed(HasBase(foundry.abstract.TypeDataModel), "ability") {
  /**
   * @internal
   */
  declare parent: AbilityPTR2e;

  static override defineSchema(): AbilitySchema {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema() as HasBaseSchema,

      free: new fields.BooleanField({
        required: true,
        initial: false,
        label: "PTR2E.FIELDS.free.label",
        hint: "PTR2E.FIELDS.free.hint",
      }),
      slot: new fields.NumberField({
        required: true,
        nullable: true,
        initial: null,
        label: "PTR2E.FIELDS.slot.label",
        hint: "PTR2E.FIELDS.slot.hint",
      }),
    };
  }

  override prepareBaseData(): void {
    if (!this.free && this.slot === null) {
      this.parent.effects.map(e => e.disabled = true);
    }

    super.prepareBaseData();
  }

  override async _preCreate(data: this["parent"]["_source"], options: DocumentModificationContext<this["parent"]["parent"]>, user: User): Promise<boolean | void> {
    const result = await super._preCreate(data, options, user);
    if (result === false) return false;

    if (!data.img || data.img === "icons/svg/item-bag.svg") {
      this.parent.updateSource({
        img: "systems/ptr2e/img/icons/ability_icon.webp"
      })
    }
  }
}

export default interface AbilitySystem extends ModelPropsFromSchema<AbilitySchema> { 
  container: ContainerPTR2e | null;
  actions: Collection<ActionPTR2e>;

  _source: SourceFromSchema<AbilitySchema>;
}

interface AbilitySchema extends foundry.data.fields.DataSchema, HasBaseSchema {
  slot: foundry.data.fields.NumberField<number, number, true, true, true>;
  free: foundry.data.fields.BooleanField<boolean, boolean, true, false, true>;
}

export type AbilitySource = BaseItemSourcePTR2e<"ability", AbilitySystemSource>;

interface AbilitySystemSource extends ItemSystemSource {
  slot: number;
  free: boolean;
}