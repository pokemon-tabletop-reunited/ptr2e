import { HasBase, HasEmbed } from "@module/data/index.ts";
import type { BaseItemSourcePTR2e, ItemSystemSource } from "./system.ts";
import type { HasBaseSchema } from "@module/data/mixins/has-base.ts";
import type { SchemaField } from "node_modules/fvtt-types/src/foundry/common/data/fields.d.mts";
import type Document from "node_modules/fvtt-types/src/foundry/common/abstract/document.d.mts";

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
export default class AbilitySystem extends HasEmbed(HasBase(foundry.abstract.TypeDataModel<AbilitySchema, Item>), "ability") {
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
  override async _preCreate(data: this['parent']['_source'], options: foundry.abstract.Document.PreCreateOptions<any>, user: User): Promise<boolean | void> {
    const result = await super._preCreate(data, options, user);
    if (result === false) return false;

    if (!data.img || data.img === "icons/svg/item-bag.svg") {
      this.parent.updateSource({
        img: "systems/ptr2e/img/icons/ability_icon.webp"
      })
    }
  }
}

// export default interface AbilitySystem extends foundry.data.fields.SchemaField.InitializedType<AbilitySchema> { 
//   container: ContainerPTR2e | null;
//   actions: Collection<ActionPTR2e>;

//   suppress?: boolean;

//   _source: foundry.data.fields.SchemaField.PersistedType<AbilitySchema>;
// }

export type AbilitySource = BaseItemSourcePTR2e<"ability", AbilitySystemSource>;

interface AbilitySystemSource extends ItemSystemSource {
  slot: number;
  free: boolean;
}