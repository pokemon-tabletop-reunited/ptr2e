// Default Pattern
// /@(?<type>Key)\[(?<slug>[-a-z]+)(\s+)?(?<options>[^\]]+)*](?:{(?<label>[^}]+)})?/gi

import { ActiveEffectPTR2e } from "@effects";
export class TextEnricher {
  static init() {
    const original = TextEditor.activateListeners.bind(TextEditor);
    TextEditor.activateListeners = function () {
      original();

      const body = $("body");
      body.on("click", "span.affliction > .content-link", TextEnricher._onClickAffliction);
      //@ts-expect-error - This is a valid handler
      body.on("dragstart", "span.affliction > .content-link", TextEnricher._onDragStartAffliction);

      body.on("click", "span.tick > .content-link", TextEnricher._onClickTick);
    }
  }

  static async enrich(data: RegExpMatchArray): Promise<HTMLElement | null> {
    if (data.length < 4) return null;
    // const {item, actor} = enricherOptions.rollData ?? {};
    const { label, options, slug, type, amount } = data.groups ?? {};

    const params = this.#parseInlineParams(options ?? "");

    switch (type) {
      case "Trait": {
        return this.#createTrait({ slug, options: params, label });
      }
      case "Affliction": {
        return this.#createAffliction({ slug, options: params, label });
      }
      case "Tick": {
        return this.#createTick({ amount: parseInt(amount), options: params, label });
      }
    }
    return null;
  }

  static async #createTrait({ slug, options, label }: { slug?: string, options: Record<string, string | undefined> | null, label?: string }): Promise<HTMLElement | null> {
    if (!slug) {
      console.error("No slug provided for Trait");
      return null;
    }

    const trait = game.ptr.data.traits.get(slug);
    if (!trait) return null;

    // TODO: Add keyword decorator
    // eslint-disable-next-line no-constant-condition
    const decorator = false ? ['&lt;', '&gt;'] : ['[', ']'];

    const span = document.createElement("span");
    span.classList.add("trait");
    span.dataset.tooltipDirection = options?.direction || "UP";
    span.dataset.trait = trait.slug;
    span.dataset.tooltip = trait.slug;
    span.innerHTML = `<span>${decorator[0]}</span><span class="tag">${label || trait.label}</span><span>${decorator[1]}</span>`
    return span;
  }

  //@ts-expect-error - The typings here are valid
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async #createAffliction({ slug, options, label, item, actor }: { slug?: string, options: Record<string, string | undefined> | null, label?: string, item?: Item, actor?: Actor }): Promise<HTMLElement | null> {
    const affliction = game.ptr.data.afflictions.get(slug!);
    if (!affliction) return null;

    const span = document.createElement("span");
    span.classList.add("affliction");
    span.dataset.tooltipDirection = options?.direction || "UP";
    span.dataset.affliction = affliction.id;
    span.dataset.tooltip = affliction.id;
    span.append((() => {
      const name = label || game.i18n.localize(affliction.name);
      return TextEditor.createAnchor({
        classes: ["content-link"],
        attrs: { draggable: true as unknown as string },
        name,
        dataset: {
          id: affliction.id,
        },
        icon: "fas fa-sparkles",
      })
    })());
    return span;
  }

  static async #createTick({ amount, options, label }: { amount: number, options: Record<string, string | undefined> | null, label?: string }): Promise<HTMLElement | null> {
    if (!amount) return null;
    const isDamage = amount < 0;
    const biggerThanOne = Math.abs(amount) > 1;

    const isShieldBased = !!options?.shield;

    const span = document.createElement("span");
    span.classList.add("tick");
    span.dataset.tooltipDirection = options?.direction || "UP";
    span.dataset.amount = amount.toString();
    span.dataset.shield = isShieldBased.toString();
    span.dataset.tooltip = isShieldBased ? `${amount} Tick${biggerThanOne ? "s" : ""} of Shield${isDamage ? " Damage" : ""}` : `${amount} Tick${biggerThanOne ? "s" : ""} of ${isDamage ? "Damage" : "Healing"}`;
    span.append((() => {
      const name = label || `${amount} Tick${biggerThanOne ? "s" : ""}`;
      return TextEditor.createAnchor({
        classes: ["content-link"],
        attrs: { draggable: true as unknown as string },
        name,
        dataset: {
          type: "Tick",
          amount: amount.toString(),
          shield: isShieldBased.toString(),
        },
        icon: isShieldBased
          ? isDamage
            ? "fa-duotone fa-solid fa-shield-slash"
            : "fas fa-shield"
          : isDamage
            ? "fas fa-burst"
            : "fas fa-heart",
      })
    })());
    return span;
  }

  static async _onClickAffliction(event: JQuery.ClickEvent) {
    event.preventDefault();
    const a = event.currentTarget as HTMLAnchorElement;
    const { id } = a.dataset;
    if (!id) return;

    const affliction = game.ptr.data.afflictions.get(id);
    if (!affliction) return;

    const effect = await ActiveEffectPTR2e.fromStatusEffect(affliction.id) as ActiveEffectPTR2e
    if (!effect) return;
    effect.description = game.i18n.localize(affliction.description!);

    effect.getUserLevel = () => CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER;
    effect.sheet.render(true);
  }

  static async _onClickTick(event: JQuery.ClickEvent): Promise<void> {
    event.preventDefault();
    const a = event.currentTarget as HTMLAnchorElement;
    const amount = parseInt(a.dataset.amount ?? "0");
    if (!amount) return;

    const targets = canvas.tokens.controlled.length ? canvas.tokens.controlled.flatMap(t => t.actor ?? []) : game.user.character ? [game.user.character] : [];
    if (!targets.length) return void ui.notifications.error(game.i18n.localize("PTR2E.Notifications.NoTokenSelected"));

    const isShieldBased = a.dataset.shield === "true";

    //TODO: This should probably be updated to allow for doing all updates in one, as well as merging all chat messages.
    for (const actor of targets) {
      await actor.applyTickDamage({ ticks: amount, apply: true, shield: isShieldBased });
    }
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
        const portions = colonIdx >= 0 ? [part.slice(0, colonIdx).trim(), part.slice(colonIdx + 1)] : [part.trim(), "true"];
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
  enricher: async (match: RegExpMatchArray): Promise<HTMLElement | null> => {
    return TextEnricher.enrich(match);
  }
}

const AfflictionEnricher: TextEditorEnricherConfig = {
  pattern: /@(?<type>Affliction)\[(?<slug>[-a-z]+)(\s+)?](?:{(?<label>[^}]+)})?/gi,
  enricher: async (match: RegExpMatchArray): Promise<HTMLElement | null> => {
    return TextEnricher.enrich(match);
  }
}

const TickEnricher: TextEditorEnricherConfig = {
  pattern: /@(?<type>Tick)\[(?<amount>[0-9-]+)(?<options>[^\]]*)](?:{(?<label>[^}]+)})?/gi,
  enricher: async (match: RegExpMatchArray): Promise<HTMLElement | null> => {
    return TextEnricher.enrich(match);
  }
}

export default [
  TraitEnricher,
  AfflictionEnricher,
  TickEnricher,
] as TextEditorEnricherConfig[];