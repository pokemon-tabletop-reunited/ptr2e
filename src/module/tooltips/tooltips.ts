import { ActorPTR2e } from "@actor";
import { AttackMessageSystem, ChatMessagePTR2e, DamageAppliedMessageSystem } from "@chat";
import { ActionPTR2e, AttackPTR2e, Trait } from "@data";
import { ActiveEffectPTR2e } from "@effects";
import { EffectPTR2e, ItemPTR2e, MovePTR2e } from "@item";
import { DataInspector } from "@module/apps/data-inspector/data-inspector.ts";
import { CustomSkill } from "@module/data/models/skill.ts";
import Tagify from "@yaireo/tagify";

export default class TooltipsPTR2e {
  #observer: MutationObserver | undefined;
  #timeout: number | null = null;

  get tooltip(): HTMLElement {
    return document.getElementById("tooltip") as HTMLElement;
  }

  /**
   * Initialize the tooltip observer
   * @remarks
   * This method is called by the Foundry `setup` hook.
   * This is so that the tooltip element is properly setup in the DOM.
   */
  observe() {
    this.#observer?.disconnect();
    this.#observer = new MutationObserver(this._onMutation.bind(this));
    this.#observer.observe(this.tooltip, {
      attributeFilter: ["class"],
      attributeOldValue: true,
    });
  }

  /**
   * Handle changes to the tooltip element
   * @param mutations - The mutations that occurred
   * @param _observer - The observer that triggered the mutations
   */
  _onMutation(mutations: MutationRecord[]) {
    for (const { type, attributeName, oldValue } of mutations) {
      if (type === "attributes" && attributeName === "class") {
        const diff = new Set(this.tooltip.classList).difference(
          new Set(oldValue?.split(" ") ?? [])
        );
        if (diff.has("active")) {
          this._clearAutoLock();
          this._activateTooltip().then((result) => {
            if (result) this._autoLockTooltip(result);
          });
          return;
        }
      }
    }
  }

  _clearAutoLock() {
    if (this.#timeout) {
      window.clearTimeout(this.#timeout);
      this.#timeout = null;
    }
  }

  _autoLockTooltip(timeout = 2000) {
    if (this.#timeout) return;

    this.#timeout = window.setTimeout(() => {
      this.#timeout = null;
      if (this.tooltip.classList.contains("active")) {
        game.tooltip.lockTooltip();
      }
    }, timeout);
  }

  /**
   * Activate the tooltip
   */
  async _activateTooltip(): Promise<false | number> {
    for (const cls of game.tooltip.element?.classList ?? []) {
      switch (cls) {
        case "trait":
          return this._onTraitTooltip();
        case "attack":
          return this._onAttackTooltip();
        case "action":
          return this._onActionTooltip();
        case "status":
          return this._onStatusTooltip();
        case "damage":
          return this._onDamageTooltip();
        case "content-link":
        case "item":
          return this._onContentLinkTooltip();
        case "damage-info":
          return this._onDamageInfoTooltip();
        case "skill":
          return this._onSkillTooltip();
        case "effect":
          return this._onEffectTooltip();
        case "affliction":
          return this._onAfflictionTooltip();
        case "effect-rolls":
          return this._onEffectRollsTooltip();
        case "data-element":
          return this._onDataElementTooltip();
      }
    }
    if (game.tooltip.element?.getAttribute("data-tooltip")) {
      switch (game.tooltip.element?.getAttribute("data-tooltip")) {
        case "range-tooltip":
          return this._onRangeTooltip();
      }
    }

    return false;
  }

  /**
   * Handle trait tooltips
   */
  async _onTraitTooltip() {
    const trait = game.tooltip.element?.dataset.trait;
    if (!trait) return false;

    const tooltipTrait = game.tooltip.element?.dataset.tooltipTrait ?? false;

    const data = game.ptr.data.traits.get(trait);
    if (!data) return false;

    this.tooltip.innerHTML = `<h4 class="trait">[${data.label
      }]</h4><content>${await TextEditor.enrichHTML(data.description)}</content>
        <div class="progress-circle">
            <svg width="20" height="20" viewBox="0 0 20 20" class="circular-progress">
                <circle class="bg"></circle>
                <circle class="fg"></circle>
                <circle class="fgb"></circle>
            </svg>
        </div>`;
    const tooltipDirection = game.tooltip.element?.dataset.tooltipDirection as
      | TooltipDirections
      | undefined;
    requestAnimationFrame(() => this._positionTooltip(tooltipDirection));
    return tooltipTrait ? 1 : 2000;
  }

  async _onSkillTooltip() {
    const skillSlug = game.tooltip.element?.dataset.slug;
    if (!skillSlug) return false;

    const skillGroup = game.tooltip.element?.dataset.group;
    const localizeKey = skillGroup
      ? `PTR2E.Skills.${skillGroup}.${skillSlug}`
      : `PTR2E.Skills.${skillSlug}`;

    const { localizedContent, localizedLabel } = await (async () => {
      const localizedContent = game.i18n.localize(`${localizeKey}.hint`);
      if (localizedContent === `${localizeKey}.hint`) {
        const skill = game.ptr.data.skills.get(skillSlug) as CustomSkill;
        return {
          localizedContent: skill?.description
            ? await TextEditor.enrichHTML(skill.description)
            : null,
          localizedLabel:
            skill?.label ?? (Handlebars.helpers.formatSlug(skill.slug) || null),
        };
      }

      const localizedLabel = game.i18n.localize(`${localizeKey}.label`);
      return { localizedContent, localizedLabel };
    })();
    if (localizedContent === null) return false;

    this.tooltip.innerHTML = `<h4 class="skill">${localizedLabel}</h4><content>${localizedContent}</content>
        <div class="progress-circle">
            <svg width="20" height="20" viewBox="0 0 20 20" class="circular-progress">
                <circle class="bg"></circle>
                <circle class="fg"></circle>
                <circle class="fgb"></circle>
            </svg>
        </div>`;
    const tooltipDirection = game.tooltip.element?.dataset.tooltipDirection as
      | TooltipDirections
      | undefined;
    requestAnimationFrame(() => this._positionTooltip(tooltipDirection));
    return 2000;
  }

  async _onEffectTooltip() {
    const effectId = game.tooltip.element?.dataset.id;
    if (!effectId) return false;

    const parent = await fromUuid<ActorPTR2e>(
      (game.tooltip.element?.closest("[data-parent]") as HTMLElement)?.dataset.parent
    );
    if (!parent) return false;

    const effect = parent.effects.get(effectId);
    if (!effect) return false;

    this.tooltip.classList.add("effect");
    await this._renderTooltip({
      path: "systems/ptr2e/templates/items/embeds/effect.hbs",
      data: { document: effect, fields: effect.schema.fields },
      direction: game.tooltip.element?.dataset.tooltipDirection as
        | TooltipDirections
        | undefined,
    });

    return 2000;
  }

  async _onAfflictionTooltip() {
    const afflictionId = game.tooltip.element?.dataset.affliction;
    if (!afflictionId) return false;

    const affliction = game.ptr.data.afflictions.get(afflictionId);
    if (!affliction) return false;

    const effect = await ActiveEffectPTR2e.fromStatusEffect(affliction.id);
    effect.description = await TextEditor.enrichHTML(
      game.i18n.localize(affliction.description!)
    );

    this.tooltip.classList.add("effect");
    await this._renderTooltip({
      path: "systems/ptr2e/templates/items/embeds/effect.hbs",
      data: { document: effect, fields: effect.schema.fields },
      direction: game.tooltip.element?.dataset.tooltipDirection as
        | TooltipDirections
        | undefined,
    });

    return 2000;
  }

  async _onActionTooltip() {
    const oldMethod = await ( async () => {
      const attackSlug =
        game.tooltip.element?.dataset.slug || game.tooltip.element?.dataset.action;
      if (!attackSlug) return false;

      const parentUuid = (game.tooltip.element?.closest("[data-parent]") as HTMLElement)?.dataset
        .parent;
      if (!parentUuid) return false;

      const parent = (await fromUuid(parentUuid)) as ActorPTR2e | ItemPTR2e;
      if (!parent) return false;

      const attack = parent.actions.get(attackSlug) as ActionPTR2e | undefined;
      if (!attack) return false;

      return await this.#createActionTooltip(attack);
    })();
    if(oldMethod !== false) return oldMethod;

    const attackUuid = game.tooltip.element?.dataset.uuid;
    if (!attackUuid) return false;

    const attack = (await fromUuid(attackUuid)) as unknown as ActionPTR2e | undefined;
    if (!(attack instanceof ActionPTR2e)) return false;

    return await this.#createActionTooltip(attack);
  }

  async #createActionTooltip(action: ActionPTR2e) {
    const traits = action.traits.map((t) => ({ value: t.slug, label: t.label, type: t.type }));

    this.tooltip.classList.add("attack");
    await this._renderTooltip({
      path: "systems/ptr2e/templates/items/embeds/action.hbs",
      data: { action, move: parent, traits, fields: action.schema.fields },
      direction: game.tooltip.element?.dataset.tooltipDirection as
        | TooltipDirections
        | undefined,
    });

    for (const input of this.tooltip.querySelectorAll<HTMLInputElement>("input.ptr2e-tagify")) {
      new Tagify(input, {
        enforceWhitelist: true,
        keepInvalidTags: false,
        editTags: false,
        tagTextProp: "label",
        dropdown: {
          enabled: 0,
          mapValueTo: "label",
        },
        templates: {
          tag: function (tagData): string {
            return `
                        <tag contenteditable="false" spellcheck="false" tabindex="-1" class="tagify__tag" ${this.getAttributes(
              tagData
            )}style="${Trait.bgColors[tagData.type || "default"] ? `--tag-bg: ${Trait.bgColors[tagData.type || "default"]!["bg"]}; --tag-hover: ${Trait.bgColors[tagData.type || "default"]!["hover"]}; --tag-border-color: ${Trait.bgColors[tagData.type || "default"]!["border"]};` : ""}">
                        <x title="" class="tagify__tag__removeBtn" role="button" aria-label="remove tag"></x>
                        <div>
                            <span class='tagify__tag-text'>
                                <span class="trait" data-tooltip-direction="UP" data-trait="${tagData.value
              }" data-tooltip="${tagData.label
              }" data-tooltip-trait="true"><span>[</span><span class="tag">${tagData.label
              }</span><span>]</span></span>
                            </span>
                        </div>
                        `;
          },
        },
        whitelist: traits,
      });
    }

    return 2000;
  }

  async _onAttackTooltip() {
    const oldMethod = await ( async () => {
      const attackSlug =
        game.tooltip.element?.dataset.slug || game.tooltip.element?.dataset.action;
      if (!attackSlug) return false;

      const parentUuid = (game.tooltip.element?.closest("[data-parent]") as HTMLElement)?.dataset
        .parent;
      if (!parentUuid) return false;

      const parent = (await fromUuid(parentUuid)) as ActorPTR2e | ItemPTR2e;
      if (!parent) return false;

      const attack = parent.actions.attack!.get(attackSlug) as AttackPTR2e | undefined;
      if (!attack) return false;

      return await this.#createAttackTooltip(attack);
    })();
    if(oldMethod !== false) return oldMethod;

    const attackUuid = game.tooltip.element?.dataset.uuid;
    if (!attackUuid) return false;

    const attack = (await fromUuid(attackUuid)) as unknown as AttackPTR2e | undefined;
    if (!(attack instanceof AttackPTR2e)) return false;

    return await this.#createAttackTooltip(attack);
  }

  async #createAttackTooltip(attack: AttackPTR2e) {
    const traits = attack.traits.map((t) => ({ value: t.slug, label: t.label, type: t.type }));

    this.tooltip.classList.add("attack");
    await this._renderTooltip({
      path: "systems/ptr2e/templates/items/embeds/move.hbs",
      data: { attack, move: parent, attackTraits: traits },
      direction: game.tooltip.element?.dataset.tooltipDirection as
        | TooltipDirections
        | undefined,
    });

    for (const input of this.tooltip.querySelectorAll<HTMLInputElement>("input.ptr2e-tagify")) {
      new Tagify(input, {
        enforceWhitelist: true,
        keepInvalidTags: false,
        editTags: false,
        tagTextProp: "label",
        dropdown: {
          enabled: 0,
          mapValueTo: "label",
        },
        templates: {
          tag: function (tagData): string {
            return `
                        <tag contenteditable="false" spellcheck="false" tabindex="-1" class="tagify__tag" ${this.getAttributes(
              tagData
            )}style="${Trait.bgColors[tagData.type || "default"] ? `--tag-bg: ${Trait.bgColors[tagData.type || "default"]!["bg"]}; --tag-hover: ${Trait.bgColors[tagData.type || "default"]!["hover"]}; --tag-border-color: ${Trait.bgColors[tagData.type || "default"]!["border"]};` : ""}">
                        <x title="" class="tagify__tag__removeBtn" role="button" aria-label="remove tag"></x>
                        <div>
                            <span class='tagify__tag-text'>
                                <span class="trait" data-tooltip-direction="UP" data-trait="${tagData.value
              }" data-tooltip="${tagData.label
              }" data-tooltip-trait="true"><span>[</span><span class="tag">${tagData.label
              }</span><span>]</span></span>
                            </span>
                        </div>
                        `;
          },
        },
        whitelist: traits,
      });
    }

    return 2000;
  }

  async _onStatusTooltip() {
    const element = game.tooltip.element;
    if (!element) return false;

    const targetUuid = (element.closest("[data-target-uuid]") as HTMLElement)?.dataset
      ?.targetUuid as Maybe<ActorUUID>;
    if (!targetUuid) return false;

    const messageId = (element.closest("[data-message-id]") as HTMLElement)?.dataset?.messageId;
    if (!messageId) return false;

    const message = game.messages.get(messageId) as ChatMessagePTR2e<AttackMessageSystem>;
    if (!message) return false;

    const target = message.system.context?.results.get(targetUuid);
    if (!target) return false;

    const accuracy = target.accuracyRoll;
    if (!accuracy) {
      this.tooltip.innerHTML = "No accuracy roll - Auto hit!";
      return false;
    };

    this.tooltip.classList.add("status");
    await this._renderTooltip({
      path: "systems/ptr2e/templates/chat/tooltips/status.hbs",
      data: { target, accuracy },
      direction: game.tooltip.element?.dataset.tooltipDirection as
        | TooltipDirections
        | undefined,
    });

    for (const button of this.tooltip.querySelectorAll("button")) {
      button.addEventListener("click", async (event) => {
        const type = (event.currentTarget as HTMLElement).id as "hit" | "critical" | "miss";
        if (!type) return;
        message.system.updateTarget(targetUuid, { status: type });
        game.tooltip.deactivate();
        game.tooltip.dismissLockedTooltips();
      });
    }

    return 500;
  }

  async _onRangeTooltip() {
    const element = game.tooltip.element;
    if (!element) return false;

    const range = (element as HTMLSelectElement).value ?? element.dataset.rangeValue;
    if (!range) return false;

    this.tooltip.innerHTML = await TextEditor.enrichHTML(game.i18n.localize(`PTR2E.Ranges.${range}`));
    requestAnimationFrame(() => this._positionTooltip(game.tooltip.element?.dataset.tooltipDirection as TooltipDirections | undefined || TooltipManager.TOOLTIP_DIRECTIONS.DOWN));

    return 500;
  }

  async _onDamageTooltip() {
    const element = game.tooltip.element;
    if (!element) return false;

    const targetUuid = (element.closest("[data-target-uuid]") as HTMLElement)?.dataset
      ?.targetUuid as Maybe<ActorUUID>;
    if (!targetUuid) return false;

    const messageId = (element.closest("[data-message-id]") as HTMLElement)?.dataset?.messageId;
    if (!messageId) return false;

    const message = game.messages.get(messageId) as ChatMessagePTR2e<AttackMessageSystem>;
    if (!message) return false;

    const target = message.system.context?.results.get(targetUuid);
    if (!target) return false;

    const damage = target.damageRoll;

    this.tooltip.classList.add("damage");
    await this._renderTooltip({
      path: "systems/ptr2e/templates/chat/tooltips/damage.hbs",
      data: { target, damage },
      direction: game.tooltip.element?.dataset.tooltipDirection as
        | TooltipDirections
        | undefined,
    });

    for (const button of this.tooltip.querySelectorAll("button")) {
      button.addEventListener("click", async (event) => {
        const type = (event.currentTarget as HTMLElement).id as "hit" | "critical" | "miss";
        if (!type) return;
        message.system.updateTarget(targetUuid, { status: type });
        game.tooltip.deactivate();
        game.tooltip.dismissLockedTooltips();
      });
    }

    return 500;
  }

  async _onDamageInfoTooltip() {
    const element = game.tooltip.element;
    if (!element) return false;

    const uuid = element.dataset.message;
    if (!uuid) return false;

    const message = (await fromUuid(uuid)) as ChatMessagePTR2e<DamageAppliedMessageSystem>;
    if (!message) return false;

    this.tooltip.classList.add("damage-info");
    await this._renderTooltip({
      path: "systems/ptr2e/templates/chat/tooltips/damage-info.hbs",
      data: { notes: message.system._notesHTML },
      direction: game.tooltip.element?.dataset.tooltipDirection as
        | TooltipDirections
        | undefined,
    });

    return 500;
  }

  async _onEffectRollsTooltip() {
    const element = game.tooltip.element;
    if (!element) return false;

    const targetUuid = (element.closest("[data-target-uuid]") as HTMLElement)?.dataset
      ?.targetUuid as Maybe<ActorUUID>;
    if (!targetUuid) return false;

    const messageId = (element.closest("[data-message-id]") as HTMLElement)?.dataset?.messageId;
    if (!messageId) return false;

    const message = game.messages.get(messageId) as ChatMessagePTR2e<AttackMessageSystem>;
    if (!message) return false;

    const target = message.system.context?.results.get(targetUuid);
    if (!target?.effect.effects) return false;

    this.tooltip.classList.add("effect-rolls");
    await this._renderTooltip({
      path: "systems/ptr2e/templates/chat/tooltips/effect-rolls.hbs",
      data: {
        target,
        effects: {
          target: target.effect.effects!.target.map(t => ({ ...t, success: t.success ?? ((t.roll?.total ?? 1) <= 0) })),
          origin: target.effect.effects!.origin.map(o => ({ ...o, success: o.success ?? ((o.roll?.total ?? 1) <= 0) }))
        },
        messageId,
        targetUuid
      },
      direction: game.tooltip.element?.dataset.tooltipDirection as
        | TooltipDirections
        | undefined,
    });

    for (const button of this.tooltip.querySelectorAll("section.effect i")) {
      button.addEventListener("click", async (event) => {
        const section = ((event.currentTarget as HTMLElement).closest("[data-index]") as HTMLElement);
        if (!section) return;

        const index = parseInt(section.dataset.index!);
        if (isNaN(index)) return;

        const type = section.dataset.type! as "target" | "origin";
        if (!type) return;

        const { targetUuid, messageId } = ((event.currentTarget as HTMLElement).closest("[data-target-uuid]") as HTMLElement)?.dataset ?? {};
        if (!targetUuid || !messageId) return;

        const message = game.messages.get(messageId) as ChatMessagePTR2e<AttackMessageSystem>;
        const target = message.system.context?.results.get(targetUuid as ActorUUID);
        if (!target) return;
        if (!target.effect.effects?.[type]?.length) return;

        const results = fu.duplicate(message.system._source.results);
        const result = (() => {
          for (const result of results) {
            const jsonData = JSON.parse(result.target);
            if (jsonData.uuid === targetUuid) return result;
          }
          return null;
        })();
        if (!result) return;

        result.effectRolls![type][index].success = (() => {
          if (result.effectRolls![type][index].success === null) {
            if (!result.effectRolls![type][index].roll) throw Error("No roll found");
            try {
              return (Roll.fromJSON(result.effectRolls![type][index].roll!) as Rolled<Roll>).total <= 0 ? false : true;
            } catch (error: unknown) {
              Hooks.onError("AttackMessageSystem#prepareBaseData", error as Error, {
                log: "error",
              });
            }

          }
          return !result.effectRolls![type][index].success;
        })()

        message.update({ "system.results": results });

        game.tooltip.deactivate();
        game.tooltip.dismissLockedTooltips();
      });
    }

    return 500;
  }

  async _onDataElementTooltip() {
    const element = game.tooltip.element;
    if (!element) return false;

    const dataInspectorElement = element.closest(".application.data-inspector")
    if (!dataInspectorElement) return false;

    const path = element.dataset.path;
    if (!path) return false;

    const dataInspectorApp = foundry.applications.instances.get(dataInspectorElement.id) as DataInspector | undefined;
    if (!dataInspectorApp) return false;

    const entry = dataInspectorApp.root.getAtPath(path);
    if (!entry) return false;

    const data = {
      path: entry.path,
      type: entry.type,
      documentId: entry.documentId,
      isContainer: entry.isContainer(),
      children: entry.children.length,
      isString: entry.isString(),
      length: entry.isString() ? entry.value.length : null,
      inData: {
        derived: {
          label: "PTR2E.DataInspector.Data.Derived",
          present: entry.inDerivedData
        },
        source: {
          label: "PTR2E.DataInspector.Data.Source",
          present: entry.inSourceData
        }
      }
    }

    this.tooltip.classList.add("data-element");
    await this._renderTooltip({
      path: "systems/ptr2e/templates/apps/data-inspector/tooltip.hbs",
      data,
      direction: TooltipManager.TOOLTIP_DIRECTIONS.UP,
    });

    return 500;
  }

  async #createItemTooltip<TItem extends ItemPTR2e>(perk: TItem, type: string) {
    const traits = [...(perk.traits?.values() ?? [])].map((t) => ({
      value: t.slug,
      label: t.label,
      type: t.type
    }));

    this.tooltip.classList.add(type);
    await this._renderTooltip({
      path: `systems/ptr2e/templates/items/embeds/${type}.hbs`,
      data: { fields: perk.system.schema.fields, document: perk, traits },
      direction: game.tooltip.element?.dataset.tooltipDirection as
        | TooltipDirections
        | undefined,
    });

    for (const input of this.tooltip.querySelectorAll<HTMLInputElement>("input.ptr2e-tagify") ??
      []) {
      new Tagify(input, {
        enforceWhitelist: true,
        keepInvalidTags: false,
        editTags: false,
        tagTextProp: "label",
        dropdown: {
          enabled: 0,
          mapValueTo: "label",
        },
        templates: {
          tag: function (tagData): string {
            return `
                        <tag contenteditable="false" spellcheck="false" tabindex="-1" class="tagify__tag" ${this.getAttributes(
              tagData
            )}style="${Trait.bgColors[tagData.type || "default"] ? `--tag-bg: ${Trait.bgColors[tagData.type || "default"]!["bg"]}; --tag-hover: ${Trait.bgColors[tagData.type || "default"]!["hover"]}; --tag-border-color: ${Trait.bgColors[tagData.type || "default"]!["border"]};` : ""}">
                        <x title="" class="tagify__tag__removeBtn" role="button" aria-label="remove tag"></x>
                        <div>
                            <span class='tagify__tag-text'>
                                <span class="trait" data-tooltip-direction="UP" data-trait="${tagData.value
              }" data-tooltip="${tagData.label
              }" data-tooltip-trait="true"><span>[</span><span class="tag">${tagData.label
              }</span><span>]</span></span>
                            </span>
                        </div>
                        `;
          },
        },
        whitelist: traits,
      });
    }

    return 2000;
  }

  async #createEffectItemTooltip(effect: EffectPTR2e) {
    this.tooltip.classList.add("effect");
    await this._renderTooltip({
      path: `systems/ptr2e/templates/items/embeds/effect-item.hbs`,
      data: {
        fields: effect.system.schema.fields,
        document: effect,
        effects: effect.effects.contents,
      },
      direction: game.tooltip.element?.dataset.tooltipDirection as
        | TooltipDirections
        | undefined,
    });

    return 2000;
  }

  async _onContentLinkTooltip() {
    const element = game.tooltip.element;
    if (!element) return false;

    const uuid = element.dataset.uuid || element.dataset.entryUuid;
    if (!uuid) return false;

    const entityType = element.dataset.type;
    if (entityType && entityType !== "Item") return false;

    const embedFigure = element.closest("figure.content-embed") as HTMLElement | undefined;
    if (embedFigure?.classList.contains("no-tooltip") && embedFigure.dataset.uuid === uuid)
      return false;

    const entity = (await fromUuid(uuid)) as ItemPTR2e | null;
    if (!entity) return false;

    switch (entity.type) {
      case "move": {
        const move = entity as MovePTR2e;
        const attack = move.system.attack;
        if (!attack) return false;

        if (game.tooltip.element) game.tooltip.element.dataset.tooltipDirection ||= "LEFT";

        return await this.#createAttackTooltip(attack);
      }
      case "ability":
        if (game.tooltip.element) game.tooltip.element.dataset.tooltipDirection ||= "LEFT";
        return await this.#createItemTooltip(entity, "ability");
      case "consumable":
        if (game.tooltip.element) game.tooltip.element.dataset.tooltipDirection ||= "LEFT";
        return await this.#createItemTooltip(entity, "consumable");
      case "container":
        if (game.tooltip.element) game.tooltip.element.dataset.tooltipDirection ||= "LEFT";
        return await this.#createItemTooltip(entity, "container");
      case "effect":
        if (game.tooltip.element) game.tooltip.element.dataset.tooltipDirection ||= "LEFT";
        return await this.#createEffectItemTooltip(entity as EffectPTR2e);
      case "equipment":
        if (game.tooltip.element) game.tooltip.element.dataset.tooltipDirection ||= "LEFT";
        return await this.#createItemTooltip(entity, "equipment");
      case "gear":
        if (game.tooltip.element) game.tooltip.element.dataset.tooltipDirection ||= "LEFT";
        return await this.#createItemTooltip(entity, "gear");
      case "perk":
        if (game.tooltip.element) game.tooltip.element.dataset.tooltipDirection ||= "LEFT";
        return await this.#createItemTooltip(entity, "perk");
      case "species":
        if (game.tooltip.element) game.tooltip.element.dataset.tooltipDirection ||= "LEFT";
        return await this.#createItemTooltip(entity, "species");
      case "weapon":
        if (game.tooltip.element) game.tooltip.element.dataset.tooltipDirection ||= "LEFT";
        return await this.#createItemTooltip(entity, "weapon");
      default:
        return false;
    }
  }

  async _renderTooltip({
    path,
    data,
    direction = TooltipManager.TOOLTIP_DIRECTIONS.DOWN,
    autoLock = true,
  }: {
    path: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    direction?: TooltipDirections;
    autoLock?: boolean;
  }) {
    let html = await renderTemplate(path, data);
    if (autoLock)
      html += `<div class="progress-circle">
            <svg width="20" height="20" viewBox="0 0 20 20" class="circular-progress">
                <circle class="bg"></circle>
                <circle class="fg"></circle>
                <circle class="fgb"></circle>
            </svg>
        </div>`;
    this.tooltip.innerHTML = await TextEditor.enrichHTML(html);
    requestAnimationFrame(() => this._positionTooltip(direction));
  }

  /**
   * Position the tooltip
   * @param direction - The direction to position the tooltip
   */
  _positionTooltip(direction: TooltipDirections = TooltipManager.TOOLTIP_DIRECTIONS.DOWN) {
    const padding = TooltipManager.TOOLTIP_MARGIN_PX;
    const targetBox = game.tooltip.element?.getBoundingClientRect() ?? new DOMRect();
    let position: {
      textAlign?: "left" | "center" | "right";
      left?: number | null;
      right?: number | null;
      top?: number | null;
      bottom?: number | null;
    } = {};
    switch (direction) {
      case TooltipManager.TOOLTIP_DIRECTIONS.DOWN:
        position = {
          textAlign: "center",
          left: targetBox.left - this.tooltip.offsetWidth / 2 + targetBox.width / 2,
          top: targetBox.bottom + padding,
        };
        break;
      case TooltipManager.TOOLTIP_DIRECTIONS.LEFT:
        position = {
          textAlign: "left",
          right: window.innerWidth - targetBox.left + padding,
          top: targetBox.top + targetBox.height / 2 - this.tooltip.offsetHeight / 2,
        };
        break;
      case TooltipManager.TOOLTIP_DIRECTIONS.RIGHT:
        position = {
          textAlign: "right",
          left: targetBox.right + padding,
          top: targetBox.top + targetBox.height / 2 - this.tooltip.offsetHeight / 2,
        };
        break;
      case TooltipManager.TOOLTIP_DIRECTIONS.UP:
        position = {
          textAlign: "center",
          left: targetBox.left - this.tooltip.offsetWidth / 2 + targetBox.width / 2,
          bottom: window.innerHeight - targetBox.top + padding,
        };
        break;
      case TooltipManager.TOOLTIP_DIRECTIONS.CENTER:
        position = {
          textAlign: "center",
          left: targetBox.left - this.tooltip.offsetWidth / 2 + targetBox.width / 2,
          top: targetBox.top - targetBox.height / 2 - this.tooltip.offsetHeight / 2,
        };
        break;
    }

    position = {
      top: null,
      right: null,
      bottom: null,
      left: null,
      textAlign: "left",
      ...position,
    };

    const style = this.tooltip.style;

    // Left or Right
    const maxW = window.innerWidth - this.tooltip.offsetWidth;
    if (position.left) position.left = Math.clamp(position.left, padding, maxW - padding);
    if (position.right) position.right = Math.clamp(position.right, padding, maxW - padding);

    // Top or Bottom
    const maxH = window.innerHeight - this.tooltip.offsetHeight;
    if (position.top) position.top = Math.clamp(position.top, padding, maxH - padding);
    if (position.bottom) position.bottom = Math.clamp(position.bottom, padding, maxH - padding);

    // Assign styles
    for (const k of ["top", "right", "bottom", "left"]) {
      const v = position[k as keyof typeof position];
      // @ts-expect-error - This is a valid assignment
      style[k] = v ? `${v}px` : null;
    }

    this.tooltip.classList.remove(...["center", "left", "right"].map((dir) => `text-${dir}`));
    this.tooltip.classList.add(`text-${position.textAlign}`);
  }
}

export type TooltipDirections = keyof typeof TooltipManager.TOOLTIP_DIRECTIONS;
