import { ChangeModel, HasChanges, HasEmbed, HasSlug, HasTraits } from "@module/data/index.ts";
import { ActiveEffectPTR2e } from "@effects";
import { ActorPTR2e } from "@actor";
import { TraitsSchema } from "@module/data/mixins/has-traits.ts";
import { SlugSchema } from "@module/data/mixins/has-slug.ts";
import { ChangesSchema } from "@module/data/mixins/has-changes.ts";
import { ItemPTR2e } from "@item";
import AbilitySystem from "@item/data/ability.ts";

export default abstract class ActiveEffectSystem extends HasEmbed(
  HasTraits(HasSlug(HasChanges(foundry.abstract.TypeDataModel))),
  "effect"
) {
  static LOCALIZATION_PREFIXES = ["PTR2E.Effect"];

  declare parent: ActiveEffectPTR2e;

  static override defineSchema(): ActiveEffectSystemSchema {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema() as TraitsSchema & SlugSchema & ChangesSchema,
      removeAfterCombat: new fields.BooleanField({
        required: true,
        initial: true,
        nullable: false,
      }),
      removeOnRecall: new fields.BooleanField({
        required: true,
        initial: false,
        nullable: false,
      }),
      stacks: new fields.NumberField({ required: true, initial: 0, min: 0, nullable: false }),
    };
  }

  /**
   * Allow child classes to define overrides for the roll options available to this effect.
   * By default don't change anything.
   */
  getRollOptions(options: string[]): string[] {
    return options;
  }

  apply(actor: ActorPTR2e, change: ChangeModel, options?: string[]): unknown {
    if (this.parent.parent instanceof ItemPTR2e && this.parent.parent.system instanceof AbilitySystem) {
      if (!this.parent.parent.system.free && this.parent.parent.system.slot === null) {
        return false;
      }
    }
    const result = change.apply(actor, options);
    if (result === false) return result;

    return result;
  }

  override async toEmbed(_config: foundry.abstract.DocumentHTMLEmbedConfig, options: EnrichmentOptions = {}): Promise<HTMLElement | HTMLCollection | null> {
    return super.toEmbed(_config, options, { parentFields: this.parent.schema.fields });
  }
}

export default interface ActiveEffectSystem
  extends ModelPropsFromSchema<ActiveEffectSystemSchema> { }

export interface ActiveEffectSystemSchema extends foundry.data.fields.DataSchema, TraitsSchema, SlugSchema, ChangesSchema {
  removeAfterCombat: foundry.data.fields.BooleanField<boolean, boolean, true, false, true>;
  removeOnRecall: foundry.data.fields.BooleanField<boolean, boolean, true, false, true>;
  stacks: foundry.data.fields.NumberField<number, number, true, false, true>;
}
