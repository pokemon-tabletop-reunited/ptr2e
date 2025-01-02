import type { ChangeModel } from "@module/data/index.ts";
import { HasChanges, HasEmbed, HasSlug, HasTraits } from "@module/data/index.ts";
import type { ActorPTR2e } from "@actor";
import type { TraitsSchema } from "@module/data/mixins/has-traits.ts";
import type { SlugSchema } from "@module/data/mixins/has-slug.ts";
import type { ChangesSchema } from "@module/data/mixins/has-changes.ts";
import { ItemPTR2e } from "@item";
import AbilitySystem from "@item/data/ability.ts";

const activeEffectSystemSchema = {
  removeAfterCombat: new foundry.data.fields.BooleanField({
    required: true,
    initial: true,
    nullable: false,
  }),
  removeOnRecall: new foundry.data.fields.BooleanField({
    required: true,
    initial: false,
    nullable: false,
  }),
  stacks: new foundry.data.fields.NumberField({ required: true, initial: 0, min: 0, nullable: false }),
}

export type ActiveEffectSystemSchema = typeof activeEffectSystemSchema & TraitsSchema & SlugSchema & ChangesSchema;

export default abstract class ActiveEffectSystem<Schema extends ActiveEffectSystemSchema = ActiveEffectSystemSchema> extends HasEmbed(
  HasTraits(
    HasSlug(
      HasChanges(
        foundry.abstract.TypeDataModel
      )
    )
  ),
  "effect"
)<Schema, ActiveEffect.ConfiguredInstance> {
  static override LOCALIZATION_PREFIXES = ["PTR2E.Effect"];

  static override defineSchema(): ActiveEffectSystemSchema {
    return {
      ...super.defineSchema() as TraitsSchema & SlugSchema & ChangesSchema,
      ...activeEffectSystemSchema,
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

  override async toEmbed(_config: TextEditor.DocumentHTMLEmbedConfig, options: TextEditor.EnrichmentOptions = {}): Promise<HTMLElement | HTMLCollection | null> {
    return super.toEmbed(_config, options, { parentFields: this.parent.schema.fields });
  }
}