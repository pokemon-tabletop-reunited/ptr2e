import { MovePTR2e } from "@item";
import { HasBase } from "@module/data/index.ts";

/**
 * @category Item Data Models
 */
export default abstract class MoveSystem extends HasBase(foundry.abstract.TypeDataModel) {
    /**
     * @internal
     */
    declare parent: MovePTR2e;

    override async toEmbed(_config: foundry.abstract.DocumentHTMLEmbedConfig, options: EnrichmentOptions = {}): Promise<HTMLElement | HTMLCollection | null> {
        options = { ...options, _embedDepth: (options._embedDepth ?? 0) + 1, relativeTo: this };

        const enrichedMove = await TextEditor.enrichHTML(await renderTemplate("systems/ptr2e/templates/items/embeds/move.hbs", {move: this.parent}), options);
        const container = document.createElement("div");
        container.classList.add("embed","move-embed");
        container.innerHTML = enrichedMove;

        return container;
    }
}