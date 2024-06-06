// Default Pattern
// /@(?<type>Key)\[(?<slug>[-a-z]+)(\s+)?(?<options>[^\]]+)*](?:{(?<label>[^}]+)})?/gi

import { ActiveEffectPTR2e } from "@effects";
export class TextEnricher {
    static init() {
        const original = TextEditor.activateListeners.bind(TextEditor);
        TextEditor.activateListeners = function() {
            original();

            const body = $("body");
            body.on("click", "span.affliction > .content-link", TextEnricher._onClickAffliction);
            //@ts-expect-error
            body.on("dragstart", "span.affliction > .content-link", TextEnricher._onDragStartAffliction);
        }
    }

    static async enrich(data: RegExpMatchArray, _enricherOptions: EnrichmentOptions): Promise<HTMLElement | null> {
        if(data.length < 4) return null;
        // const {item, actor} = enricherOptions.rollData ?? {};
        const {label, options, slug, type} = data.groups ?? {};

        const params = this.#parseInlineParams(options ?? "");

        switch(type) {
            case "Trait": {
                return this.#createTrait({slug, options: params, label});
            }
            case "Affliction": {
                return this.#createAffliction({slug, options: params, label});
            }
        }
        return null;
    }

    static async #createTrait({slug, options, label}: {slug?: string, options: Record<string, string | undefined> | null, label?: string}): Promise<HTMLElement | null> {
        if(!slug) {
            console.error("No slug provided for Trait");
            return null;
        }

        const trait = game.ptr.data.traits.get(slug);
        if(!trait) return null;

        // TODO: Add keyword decorator
        const decorator = false ? ['&lt;','&gt;'] : ['[',']'];

        const span = document.createElement("span");
        span.classList.add("trait");
        span.dataset.tooltipDirection = options?.direction || "UP";
        span.dataset.trait = trait.slug;
        span.dataset.tooltip = trait.slug;
        span.innerHTML = `<span>${decorator[0]}</span><span class="tag">${label || trait.label}</span><span>${decorator[1]}</span>`
        return span;
    }

    //@ts-expect-error
    static async #createAffliction({slug, options, label, item, actor}: {slug?: string, options: Record<string, string | undefined> | null, label?: string, item?: Item, actor?: Actor}): Promise<HTMLElement | null> {
        const affliction = game.ptr.data.afflictions.get(slug!);
        if(!affliction) return null;

        const span = document.createElement("span");
        span.classList.add("affliction");
        span.dataset.tooltipDirection = options?.direction || "UP";
        span.dataset.affliction = affliction.id;
        span.dataset.tooltip = affliction.id;
        span.append((() => {
            const name = label || game.i18n.localize(affliction.name);
            return TextEditor.createAnchor({
                classes: ["content-link"],
                attrs: {draggable: true as unknown as string},
                name,
                dataset: {
                    id: affliction.id,
                },
                icon: "fas fa-sparkles",
            })
        })());
        return span;
    }

    static async _onClickAffliction(event: JQuery.ClickEvent) {
        event.preventDefault();
        const a = event.currentTarget as HTMLAnchorElement;
        const {id} = a.dataset;
        if(!id) return;

        const affliction = game.ptr.data.afflictions.get(id);
        if(!affliction) return;

        const effect = await ActiveEffectPTR2e.fromStatusEffect(affliction.id) as ActiveEffectPTR2e
        if(!effect) return;
        effect.description = game.i18n.localize(affliction.description!);

        effect.getUserLevel = () => CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER;
        effect.sheet.render(true);
    }

    static _onDragStartAffliction(event: JQuery.DragEvent) {
        event.stopPropagation();
        const a = event.currentTarget as HTMLAnchorElement;
        const dragData = {
            type: "Affliction",
            id: a.dataset.id,
        };
        event.originalEvent?.dataTransfer?.setData("text/plain", JSON.stringify(dragData));
    }

    static #parseInlineParams(
        paramString: string,
        options: { first?: string } = {},
    ): Record<string, string | undefined> | null {
        const parts = paramString.split("|");
        const result = parts.reduce(
            (result, part, idx) => {
                if (idx === 0 && options.first && !part.includes(":")) {
                    result[options.first] = part.trim();
                    return result;
                }
    
                const colonIdx = part.indexOf(":");
                const portions = colonIdx >= 0 ? [part.slice(0, colonIdx), part.slice(colonIdx + 1)] : [part, ""];
                result[portions[0]] = portions[1];
    
                return result;
            },
            {} as Record<string, string | undefined>,
        );
    
        return result;
    }
}

const TraitEnricher: TextEditorEnricherConfig = {
    pattern: /@(?<type>Trait)\[(?<slug>[-a-z]+)(\s+)?](?:{(?<label>[^}]+)})?/gi,
    enricher: async (match: RegExpMatchArray, options: EnrichmentOptions): Promise<HTMLElement | null> => {
        return TextEnricher.enrich(match, options);
    }
}

const AfflictionEnricher: TextEditorEnricherConfig = {
    pattern: /@(?<type>Affliction)\[(?<slug>[-a-z]+)(\s+)?](?:{(?<label>[^}]+)})?/gi,
    enricher: async (match: RegExpMatchArray, options: EnrichmentOptions): Promise<HTMLElement | null> => {
        return TextEnricher.enrich(match, options);
    }
}

export default [
    TraitEnricher,
    AfflictionEnricher
] as TextEditorEnricherConfig[];