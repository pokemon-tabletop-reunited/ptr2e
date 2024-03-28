import { ActorPTR2e } from "@actor";
import { EffectPTR2e } from "@item";
import { HasSlug } from "@module/data/index.ts";

/**
 * @category Item Data Models
 * @extends {HasBase}
 * @extends {foundry.abstract.TypeDataModel}
 */
export default abstract class EffectSystem extends HasSlug(foundry.abstract.TypeDataModel) {
    /**
     * @internal
     */
    declare parent: EffectPTR2e;

    get effects() {
        return this.parent._source.effects;
    }

    override async _preCreate(data: this["parent"]["_source"], options: DocumentModificationContext<this["parent"]["parent"]>, user: User): Promise<boolean | void> {
        const result = await super._preCreate(data, options, user);
        if (result === false) return false;

        if(this.parent.parent) {
            const parent = this.parent.parent;
            if(parent instanceof ActorPTR2e) {
                const effects = this.effects;
                await parent.createEmbeddedDocuments("ActiveEffect", effects);
                return false;
            }
        }

        if(!data.img || data.img === "icons/svg/item-bag.svg") {
            this.parent.updateSource({
                img: "/systems/ptr2e/img/icons/effect_icon.webp"
            })
        }
    }
}