import { HasDescription, HasEmbed, HasMigrations, HasSlug, HasTraits } from "@module/data/index.ts";
import type { TraitsSchema } from "@module/data/mixins/has-traits.ts";
import type { MigrationSchema } from "@module/data/mixins/has-migrations.ts";
import type { DescriptionSchema } from "@module/data/mixins/has-description.ts";
import type { SlugSchema } from "@module/data/mixins/has-slug.ts";

export type EffectSchema = TraitsSchema & MigrationSchema & DescriptionSchema & SlugSchema;

/**
 * @category Item Data Models
 * @extends {HasBase}
 * @extends {foundry.abstract.TypeDataModel}
 */
export default abstract class EffectSystem extends HasEmbed(HasTraits(HasMigrations(HasDescription(HasSlug(foundry.abstract.TypeDataModel)))), "effect-item")<EffectSchema, Item.ConfiguredInstance> {
  /**
   * @internal
   */
  // declare parent: EffectPTR2e;

  get effects() {
    return this.parent._source.effects;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async _preCreate(data: foundry.abstract.TypeDataModel.ParentAssignmentType<EffectSchema, Item.ConfiguredInstance>, options: foundry.abstract.Document.PreCreateOptions<any>, user: foundry.documents.BaseUser): Promise<boolean | void> {
    const result = await super._preCreate(data, options, user);
    if (result === false) return false;

    if (this.parent.parent) {
      const parent = this.parent.parent;
      if (parent instanceof CONFIG.Actor.documentClass) {
        const effects = this.effects;
        await CONFIG.ActiveEffect.documentClass.createDocuments(effects, { parent: parent })
        return false;
      }
    }

    if (!data.img || data.img === "icons/svg/item-bag.svg") {
      this.parent.updateSource({
        img: "systems/ptr2e/img/icons/effect_icon.webp",
      });
    }
  }

  override async toEmbed(_config: TextEditor.DocumentHTMLEmbedConfig, options: TextEditor.EnrichmentOptions = {}): Promise<HTMLElement | HTMLCollection | null> {
    return super.toEmbed(_config, options, { effects: this.parent.effects.contents });
  }
}