// Default Pattern
// /@(?<type>Key)\[(?<slug>[-a-z]+)(\s+)?(?<options>[^\]]+)*](?:{(?<label>[^}]+)})?/gi

import { PokemonType } from "@data";
import { ActiveEffectPTR2e } from "@effects";
export class TextEnricher {
  static init() {
    const original = foundry.applications.ux.TextEditor.activateListeners.bind(foundry.applications.ux.TextEditor);
    foundry.applications.ux.TextEditor.activateListeners = function () {
      original();

      const body = $("body");
      body.on("click", "span.affliction > .content-link", TextEnricher._onClickAffliction);
      //@ts-expect-error - This is a valid handler
      body.on("dragstart", "span.affliction > .content-link", TextEnricher._onDragStartAffliction);

      body.on("click", "span.tick > .content-link", TextEnricher._onClickTick);

      body.on("click", "span.flat > .content-link", TextEnricher._onClickFlat);
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
      case "Shield":
      case "HP":
      case "PP": {
        if (params?.tick || params?.ticks) {
          if (type === "Shield") params.shield = "true";
          else if (type === "PP") params.pp = "true";
          return this.#createTick({ amount: parseInt(amount), options: params, label });
        }
        return this.#createFlat({ type, amount: parseInt(amount), options: params, label });
      }
    }
    return null;
  }

  static async #createTrait({ slug, options, label }: { slug?: string, options: Record<string, string | undefined> | null, label?: string }): Promise<HTMLElement | null> {
    if (!slug) {
      console.error("No slug provided for Trait");
      return null;
    }

    const trait = game.ptr.data.traits.getTrait(slug);
    if (!trait) {
      const decorator = ['[', ']'];

      const span = document.createElement("span");
      span.classList.add("trait", "invalid");
      span.dataset.tooltipDirection = options?.direction || "UP";
      span.dataset.trait = slug;
      span.dataset.tooltip = `Unknown trait: ${slug}`;
      span.innerHTML = `<span>${decorator[0]}</span><span class="tag">${label || Handlebars.helpers.formatSlug(slug)}</span><span>${decorator[1]}</span>`
      return span;
    }

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

    const amount = options ? parseInt(Object.keys(options)[0]) : null;

    const span = document.createElement("span");
    span.classList.add("affliction");
    span.dataset.tooltipDirection = options?.direction || "UP";
    span.dataset.affliction = affliction.id;
    span.dataset.tooltip = affliction.id;
    span.append((() => {
      const name = label || (game.i18n.localize(affliction.name) + (amount ? ` ${amount}` : ""));
      return foundry.applications.ux.TextEditor.createAnchor({
        classes: ["content-link"],
        attrs: { draggable: true as unknown as string },
        name,
        dataset: {
          id: affliction.id,
          ...(amount ? { amount: amount.toString() } : {}),
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

    const isPPBased = !!options?.pp;
    const isShieldBased = !!options?.shield && !isPPBased;
    const types = new Set(options?.types?.split(":") ?? []) as Set<PokemonType>;

    const span = document.createElement("span");
    span.classList.add("tick");
    span.dataset.tooltipDirection = options?.direction || "UP";
    span.dataset.amount = amount.toString();
    span.dataset.pp = isPPBased.toString();
    span.dataset.shield = isShieldBased.toString();
    span.dataset.tooltip = isPPBased
      ? isDamage
        ? `Drain ${amount} Ticks of PP`
        : `Restore ${amount} Ticks of PP`
      : isShieldBased
        ? `${amount} Tick${biggerThanOne ? "s" : ""} of Shield${isDamage ? " Damage" : ""}`
        : `${amount} Tick${biggerThanOne ? "s" : ""} of ${isDamage ? "Damage" : "Healing"}`;

    if (isDamage && types.size > 0) {
      span.dataset.tooltip += ` (Typed: ${Array.from(types).map(t => Handlebars.helpers.formatSlug(t)).join(", ")})`;
    }

    span.append((() => {
      const name = label || `${amount} Tick${biggerThanOne ? "s" : ""}`;
      return foundry.applications.ux.TextEditor.createAnchor({
        classes: ["content-link", ...Array.from(types).map(t => `type-${t}`)],
        attrs: { draggable: true as unknown as string },
        name,
        dataset: {  
          type: "Tick",
          amount: amount.toString(),
          shield: isShieldBased.toString(),
          pp: isPPBased.toString(),
          types: Array.from(types).join(":"),
        },
        icon: isPPBased
          ? isDamage
            ? "fa-solid fa-battery-slash"
            : "fa-solid fa-battery-bolt"
          : isShieldBased
            ? isDamage
              ? "fa-duotone fa-shield-slash"
              : "fas fa-shield"
            : isDamage
              ? "fas fa-burst"
              : "fas fa-heart",
      })
    })());
    return span;
  }

  static async #createFlat({ type, amount, options, label }: { type: "Shield" | "HP" | "PP", amount: number, options: Record<string, string | undefined> | null, label?: string }): Promise<HTMLElement | null> {
    if (!amount) return null;
    const isDamage = amount < 0;

    const isPPBased = type === "PP";
    const isShieldBased = type === "Shield";

    const span = document.createElement("span");
    span.classList.add("flat");
    span.dataset.tooltipDirection = options?.direction || "UP";
    span.dataset.amount = amount.toString();
    span.dataset.pp = isPPBased.toString();
    span.dataset.shield = isShieldBased.toString();
    span.dataset.tooltip = isPPBased
      ? isDamage
        ? `Drain ${amount} PP`
        : `Restore ${amount} PP`
      : isShieldBased
        ? `${amount} Shield${isDamage ? " Damage" : ""}`
        : `${amount} ${isDamage ? "Damage" : "Healing"}`;
    span.append((() => {
      const name = label || `${amount} ${type}`;
      return foundry.applications.ux.TextEditor.createAnchor({
        classes: ["content-link"],
        attrs: { draggable: true as unknown as string },
        name,
        dataset: {
          type: "Flat",
          amount: amount.toString(),
          shield: isShieldBased.toString(),
          pp: isPPBased.toString(),
        },
        icon: isPPBased
          ? isDamage
            ? "fa-solid fa-battery-slash"
            : "fa-solid fa-battery-bolt"
          : isShieldBased
            ? isDamage
              ? "fa-duotone fa-shield-slash"
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
    const isPPBased = a.dataset.pp === "true";
    const types = new Set(a.dataset.types?.split(":") ?? []) as Set<PokemonType>

    //TODO: This should probably be updated to allow for doing all updates in one, as well as merging all chat messages.
    for (const actor of targets) {
      await actor.applyTickDamage({ ticks: amount, apply: true, shield: isShieldBased, pp: isPPBased, types});
    }
  }

  static async _onClickFlat(event: JQuery.ClickEvent): Promise<void> {
    event.preventDefault();
    const a = event.currentTarget as HTMLAnchorElement;
    const amount = parseInt(a.dataset.amount ?? "0");
    if (!amount) return;

    const targets = canvas.tokens.controlled.length ? canvas.tokens.controlled.flatMap(t => t.actor ?? []) : game.user.character ? [game.user.character] : [];
    if (!targets.length) return void ui.notifications.error(game.i18n.localize("PTR2E.Notifications.NoTokenSelected"));

    const isShieldBased = a.dataset.shield === "true";
    const isPPBased = a.dataset.pp === "true";

    //TODO: This should probably be updated to allow for doing all updates in one, as well as merging all chat messages.
    for (const actor of targets) {
      if (isPPBased) {
        const current = actor.system.powerPoints.value;
        const newValue = Math.clamp(actor.system.powerPoints.value + amount, 0, actor.system.powerPoints.max);
        await actor.update({ "system.powerPoints.value": newValue });
        ui.notifications.info(`Updated ${actor.name}'s Power Points from ${current} to ${newValue}.`);
      }
      else {
        await actor.applyDamage(amount * -1, { healShield: isShieldBased && amount > 0, silent: false, flat: true})
      }
    }
  }

  static _onDragStartAffliction(event: JQuery.DragEvent) {
    event.stopPropagation();
    const a = event.currentTarget as HTMLAnchorElement;
    const dragData = {
      type: "Affliction",
      id: a.dataset.id,
      amount: a.dataset.amount,
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
  pattern: /@(?<type>Trait)\[(?<slug>[-a-z0-9]+)(\s+)?](?:{(?<label>[^}]+)})?/gi,
  enricher: async (match: RegExpMatchArray): Promise<HTMLElement | null> => {
    return TextEnricher.enrich(match);
  }
}

const AfflictionEnricher: TextEditorEnricherConfig = {
  pattern: /@(?<type>Affliction)\[(?<slug>[-a-z]+)((\s+)(?<options>[0-9]*))?](?:{(?<label>[^}]+)})?/gi,
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

const FlatShieldEnricher: TextEditorEnricherConfig = {
  pattern: /@(?<type>Shield)\[(?<amount>[0-9-]+)(?<options>[^\]]*)](?:{(?<label>[^}]+)})?/gi,
  enricher: async (match: RegExpMatchArray): Promise<HTMLElement | null> => {
    return TextEnricher.enrich(match);
  }
}

const FlatHPEnricher: TextEditorEnricherConfig = {
  pattern: /@(?<type>HP)\[(?<amount>[0-9-]+)(?<options>[^\]]*)](?:{(?<label>[^}]+)})?/gi,
  enricher: async (match: RegExpMatchArray): Promise<HTMLElement | null> => {
    return TextEnricher.enrich(match);
  }
}

const FlatPPEnricher: TextEditorEnricherConfig = {
  pattern: /@(?<type>PP)\[(?<amount>[0-9-]+)(?<options>[^\]]*)](?:{(?<label>[^}]+)})?/gi,
  enricher: async (match: RegExpMatchArray): Promise<HTMLElement | null> => {
    return TextEnricher.enrich(match);
  }
}

export default [
  TraitEnricher,
  AfflictionEnricher,
  TickEnricher,
  FlatShieldEnricher,
  FlatHPEnricher,
  FlatPPEnricher,
] as TextEditorEnricherConfig[];