import { ActorPTR2e } from "@actor";
import { EffectPTR2e } from "@item";
import { HasDescription, HasEmbed, HasMigrations, HasSlug, HasTraits } from "@module/data/index.ts";
import { BaseItemSourcePTR2e, ItemSystemSource } from "./system.ts";
import { ActiveEffectPTR2e } from "@effects";

/**
 * @category Item Data Models
 * @extends {HasBase}
 * @extends {foundry.abstract.TypeDataModel}
 */
export default abstract class EffectSystem extends HasEmbed(HasTraits(HasMigrations(HasDescription(HasSlug(foundry.abstract.TypeDataModel)))), "effect-item") {
    /**
     * @internal
     */
    declare parent: EffectPTR2e;

    get effects() {
        return this.parent._source.effects;
    }

    override async _preCreate(
        data: this["parent"]["_source"],
        options: DocumentModificationContext<this["parent"]["parent"]>,
        user: User
    ): Promise<boolean | void> {
        const result = await super._preCreate(data, options, user);
        if (result === false) return false;

        if (this.parent.parent) {
            const parent = this.parent.parent;
            if (parent instanceof ActorPTR2e) {
                const effects = this.effects;
                await ActiveEffectPTR2e.createDocuments(effects, { parent: parent })
                return false;
            }
        }

        if (!data.img || data.img === "icons/svg/item-bag.svg") {
            this.parent.updateSource({
                img: "systems/ptr2e/img/icons/effect_icon.webp",
            });
        }
    }

    override async toEmbed(_config: foundry.abstract.DocumentHTMLEmbedConfig, options: EnrichmentOptions = {}): Promise<HTMLElement | HTMLCollection | null> {
        return super.toEmbed(_config, options, {effects: this.parent.effects.contents});
    }
}

export type EffectSource = BaseItemSourcePTR2e<"effect", EffectSystemSource>;

interface EffectSystemSource extends Pick<ItemSystemSource, "slug"> {}
