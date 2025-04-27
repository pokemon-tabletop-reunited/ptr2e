import { ActorPTR2e, Skill } from "@actor";
import { SkillsComponent } from "@actor/components/skills-component.ts";
import { ActionPTR2e, AttackPTR2e } from "@data";
import { ActiveEffectPTR2e } from "@effects";
import { TokenPTR2e } from "@module/canvas/token/object.ts";
import { Statistic } from "@system/statistics/statistic.ts";
import { formatSlug } from "@utils";
import { ApplicationRenderOptions } from "types/foundry/common/applications/_types.js"
import { HandlebarsRenderOptions } from "types/foundry/common/applications/api/handlebars-application.ts";

export class HotbarPTR2e extends foundry.applications.ui.Hotbar {
  static override DEFAULT_OPTIONS = {
    actions: {
      execute: HotbarPTR2e.#onExecute,
      party: HotbarPTR2e.#onToggleParty,
      movement: HotbarPTR2e.#onToggleMovement,
      passives: HotbarPTR2e.#onTogglePassives,
      effects: HotbarPTR2e.#onToggleEffects,
      attacks: HotbarPTR2e.#onAttackTab,
      other: HotbarPTR2e.#onOtherTab,
      skills: HotbarPTR2e.#onSkillsTab,
      "open-actor": async function (this: HotbarPTR2e) {
        if (this.token?.actor) {
          await this.token.actor.sheet.render(true);
        }
      },
      "open-entry": async function (this: HotbarPTR2e, _event: PointerEvent, target: HTMLElement) {
        const entry = await fu.fromUuid(target.dataset.uuid!) as ActiveEffectPTR2e;
        if (entry?.sheet) {
          await entry.sheet.render(true);
        }
      }
    }
  }

  static override PARTS = {
    left: {
      template: "systems/ptr2e/templates/hud/hotbar/left.hbs",
      root: false
    },
    hotbar: {
      template: "systems/ptr2e/templates/hud/hotbar/hotbar.hbs",
      root: false
    },
    right: {
      template: "systems/ptr2e/templates/hud/hotbar/right.hbs",
      root: false
    },
  }

  /**
   * An internal helper data structure that makes it easier to track button swap states.
   * @type {Record<string, {
  *  state: boolean,
  *  active: {icon: string, tooltip: string},
  *  inactive: {icon: string, tooltip: string}
  * }>}
  */
  #toggles = {
    party: {
      state: false,
      active: { icon: "fa-user-group", tooltip: "PTR2E.TokenPanel.Tabs.party.active" },
      inactive: { icon: "fa-user-group", tooltip: "PTR2E.TokenPanel.Tabs.party.inactive" }
    },
    movement: {
      state: false,
      active: { icon: "fa-person-walking", tooltip: "PTR2E.TokenPanel.Tabs.movement.active" },
      inactive: { icon: "fa-person-walking", tooltip: "PTR2E.TokenPanel.Tabs.movement.inactive" }
    },
    passives: {
      state: false,
      active: { icon: "fa-star", tooltip: "PTR2E.TokenPanel.Tabs.passives.active" },
      inactive: { icon: "fa-star", tooltip: "PTR2E.TokenPanel.Tabs.passives.inactive" }
    },
    effects: {
      state: false,
      active: { icon: "fa-star", tooltip: "PTR2E.TokenPanel.Tabs.effects.active" },
      inactive: { icon: "fa-unlock", tooltip: "PTR2E.TokenPanel.Tabs.effects.inactive" }
    }
  };

  get token(): TokenPTR2e | null {
    return this._token;
  }
  set token(value: TokenPTR2e | null) {
    if (this._token === value) return;
    this._token = value;

    //@ts-expect-error - Incomplete types
    this.debouncedRender({ parts: ["left", "hotbar"]});
  }

  debouncedRender = foundry.utils.debounce(this.render.bind(this), 100);

  // async transitionRender(options: HandlebarsRenderOptions) {
  //   const app = this.element
  //   if (app) {
  //     if(this.timeline) this.timeline.progress(1);
  //     const currentState = app.cloneNode(true) as HTMLElement;

  //     // Ensure images in the cloned element use cached versions
  //     const images = Array.from(currentState.querySelectorAll<HTMLImageElement>("img"));
  //     await Promise.all(images.map(img => img.decode().catch((err) => {console.error(err)}))); // Wait for all images to decode

  //     this.element.insertAdjacentElement("beforebegin", currentState);
  //     this.oldState = currentState;
  //   }
    
  //   this.render(options);
  // }

  private _token: TokenPTR2e | null;

  /** The currently rendered side tab. */
  shown: "party" | "movement" | "passives" | "effects" | null = null;

  get tab() {
    return this._tab;
  }
  set tab(value: "slots" | "other" | "skills") {
    if (this._tab === value) return;
    this._tab = value;
    // this.noFade = true;
    //@ts-expect-error - Incomplete types
    this.render({ parts: ["left", "hotbar"] });
  }

  private _tab: "slots" | "other" | "skills" = "slots";

  override async _prepareContext(options: ApplicationRenderOptions): Promise<Hotbar.HotbarContext> {
    const context = await super._prepareContext(options);

    if (this.token?.actor) {
      const actor = context.actor = this.token.actor;
      context.actions = {
        passives: actor.actions.passive,
        generic: [...actor.actions.generic, ...actor.actions.pokeball],
        slots: Object.values(actor.attacks.actions),
        other: actor.actions.attack.filter(a => a.free)
      };
    }

    return context;
  }

  protected override async _preparePartContext(partId: string, context: Hotbar.HotbarContext, options: HandlebarsRenderOptions): Promise<object> {
    await super._preparePartContext(partId, context, options);

    if (partId === "left") {
      context.toggle = this.shown;
      context.tab = this.tab;

      if (!this.token) return context;
      const actor = this.token.actor;
      if (!actor) return context;
      context.actor = actor;
      const party = context.party = actor.party;
      context.isOwner = party?.owner == actor;
      context.effects = actor.effects.contents as ActiveEffectPTR2e[] ?? [];
    }

    if (partId === "hotbar") {
      const skills = this.token?.actor ? SkillsComponent.prepareSkillsData(this.token.actor).skills.favourites.flatMap(s => s.skills) : [];
      context.slots = context.slots.map((slot: Hotbar.HotbarSlotData, i) => {
        const index = i + (this.page - 1) * 10;
        if (!this.token?.actor) return slot;
        const actor = this.token.actor;
        if (this.tab === "slots" && index < actor.attacks.slots) {
          const attack = actor.attacks.actions[index];
          if (attack) return {
            key: index < 9 ? index + 1 : 0,
            img: attack.img ?? null,
            cssClass: "full attack",
            tooltip: attack.name,
            ariaLabel: attack.name,
            attack,
            macro: null,
            slot: index + 1
          };
        }
        else if (this.tab === "other") {
          if (index < context.actions.other.length) {
            const attack = context.actions.other[index];
            return {
              key: index < 9 ? index + 1 : 0,
              img: attack.img ?? null,
              cssClass: "full attack",
              tooltip: attack.name,
              ariaLabel: attack.name,
              attack,
              macro: null,
              slot: index + 1
            };
          }
        }
        else if (this.tab === "skills") {
          if (index < skills.length) {
            const skill = skills[index];
            return {
              key: index < 9 ? index + 1 : 0,
              img: "icons/svg/d20.svg",
              cssClass: "full skill",
              tooltip: `Roll ${formatSlug(skill.slug)} (${skill.total > 0 ? `+${skill.total}` : skill.total})`,
              ariaLabel: `Roll ${formatSlug(skill.slug)} (${skill.total > 0 ? `+${skill.total}` : skill.total})`,
              skill,
              macro: null,
              slot: index + 1
            };
          }
        }
        return slot;
      });
    }

    return context;
  }

  protected override async _onFirstRender(context: object, options: ApplicationRenderOptions): Promise<void> {
    await super._onFirstRender(context, options);

    //@ts-expect-error - Incomplete types
    this._createContextMenu(this._getEffectContextMenuOptions, ".entry.effect", {
      hookName: "getHotbarEffectContextOptions",
      parentClassHooks: false
    });
  }

  protected override async _onRender(context: object, options: ApplicationRenderOptions): Promise<void> {
    await super._onRender(context, options);

    this.#updateFadedUI();

    // this.#fadeOldState();
  }

  protected override _attachPartListeners(partId: string, htmlElement: HTMLElement, options: HandlebarsRenderOptions): void {
    super._attachPartListeners(partId, htmlElement, options);
    if (partId === "right") {
      const button = htmlElement.querySelector<HTMLButtonElement>(`[data-action="lock"]`);
      if (button) {
        button.addEventListener("click", () => this.#updateFadedUI(!this.locked));
      }
    }
  }

  #updateFadedUI(locked: boolean = this.locked) {
    if (locked) {
      this.element.classList.remove("faded-ui");
    } else {
      this.element.classList.add("faded-ui");
    }
  }

  // oldState: HTMLElement | null = null;
  // timeline: gsap.core.Timeline | null = null;
  // noFade = false;

  // #fadeOldState(): void {
  //   if (!this.element) return
  //   if(this.noFade) return void (this.noFade = false);

  //   if(this.timeline) this.timeline.kill();
  //   const tl = this.timeline = gsap.timeline();
  //   tl.fromTo(
  //     this.element,
  //     {
  //       autoAlpha: 0,
  //       top: "+=150"
  //     },
  //     {
  //       autoAlpha: 1,
  //       duration: 1.5,
  //       top: "-=150",
  //       ease: "power3.out",
  //       onComplete: () => {
  //         this.element.style.opacity = "";
  //       }
  //     }
  //   );

  //   if(!this.oldState) return;
  //   tl.fromTo(
  //     this.oldState,
  //     {
  //       autoAlpha: 1,
  //     },
  //     {
  //       duration: 1.5,
  //       autoAlpha: 0,
  //       top: "+=150",
  //       ease: "power3.out",
  //       onComplete: () => {
  //         this.oldState?.remove();
  //         this.oldState = null;
  //       }
  //     },
  //     "<"
  //   )
  // }

  _getEffectContextMenuOptions(): ContextMenuEntry[] {
    return [
      {
        name: "Send to Chat",
        icon: '<i class="fa-solid fa-arrow-up-right-from-square"></i>',
        callback: async li => {
          const uuid = li.dataset.uuid;
          const effect = await fu.fromUuid(uuid!) as ActiveEffectPTR2e;
          effect?.toChat();
        }
      },
      {
        name: "Delete Effect",
        icon: '<i class="fa-solid fa-trash"></i>',
        callback: async li => {
          const uuid = li.dataset.uuid;
          const effect = await fu.fromUuid(uuid!) as ActiveEffectPTR2e;
          effect?.deleteDialog();
        }
      },
    ]
  }

  protected override _getContextMenuOptions(): ContextMenuEntry[] {
    const options = super._getContextMenuOptions();
    for (const option of options) {
      switch (option.name) {
        case "MACRO.Edit": {
          const condition = option.condition!;
          option.condition = (li) => {
            const slot = this.#getSlot(li);
            if (slot && slot instanceof Macro) {
              return condition(li);
            }
            return false;
          }
          break;
        }
        case "MACRO.Remove": {
          option.condition = (li) => {
            const slot = this.#getSlot(li);
            if (slot && slot instanceof Macro) {
              return true;
            }
            return false;
          }
          break;
        }
        case "MACRO.Delete": {
          const condition = option.condition!;
          option.condition = (li) => {
            const slot = this.#getSlot(li);
            if (slot && slot instanceof Macro) {
              return condition(li);
            }
            return false;
          }
        }
      }
    }

    options.push(
      {
        name: "Send to Chat",
        icon: '<i class="fa-solid fa-arrow-up-right-from-square"></i>',
        condition: (li) => {
          const slot = this.#getSlot(li);
          if (slot && slot instanceof AttackPTR2e) {
            return true;
          }
          return false;
        },
        callback: async li => {
          const slot = this.#getSlot(li) as AttackPTR2e;
          if (slot) {
            await slot.toChat();
          }
        }
      }
    );

    return options;
  }

  #getSlot(element: HTMLElement) {
    if (this.tab === "slots" && this.token?.actor && this.page === 1) {
      const attack = this.token.actor.attacks.actions[parseInt(element.dataset.slot!) - 1];
      if (attack) return attack;
    }
    if (this.tab === "other" && this.token?.actor) {
      const attack = fu.fromUuidSync(element.dataset.uuid!) as unknown as AttackPTR2e;
      if (attack) return attack;
    }
    if (this.tab === "skills" && this.token?.actor) {
      const skill = this.token.actor.skills[element.dataset.skill!];
      if (skill) return skill;
    }

    const slot = element.dataset.slot;
    const macroId = game.user.hotbar[slot as unknown as number];
    if (!macroId) return null;
    return game.macros.get(macroId) ?? null;
  }

  async executeMacro(slot: number) {
    const li = this.element.querySelector<HTMLLIElement>(`li.slot[data-slot="${slot + (this.page - 1) * 10}"]`);
    if (!li) return;
    await HotbarPTR2e.#onExecute.bind(this)(new PointerEvent("click"), li);
  }

  static async #onExecute(this: HotbarPTR2e, _event: PointerEvent, target: HTMLElement): Promise<void> {
    const slot = this.#getSlot(target);

    // Create a temporary Macro
    if (!slot) {
      //@ts-expect-error - Incomplete types
      const cls = fu.getDocumentClass("Macro");
      const macro = new cls({ name: cls.defaultName({ type: "chat" }), type: "chat", scope: "global" });
      const hotbarSlot = target.dataset.slot;
      return void await macro.sheet.render({ force: true, hotbarSlot });
    }

    if (slot instanceof Macro) return void await slot.execute();

    if (slot instanceof ActionPTR2e) {
      return void await slot.roll();
    }

    if (slot instanceof Statistic) {
      return void await slot.roll();
    }
  }

  static async #onAttackTab(this: HotbarPTR2e) {
    if (this.tab === "slots") return;
    this.tab = "slots";
  }

  static async #onOtherTab(this: HotbarPTR2e) {
    if (this.tab === "other") return;
    this.tab = "other";
  }

  static async #onSkillsTab(this: HotbarPTR2e) {
    if (this.tab === "skills") return;
    this.tab = "skills";
  }

  /**
   * Update the presented state of toggle buttons.
   */
  async #updateToggles() {
    this.#toggles.party.state = this.shown === "party";
    this.#toggles.movement.state = this.shown === "movement";
    this.#toggles.passives.state = this.shown === "passives";
    this.#toggles.effects.state = this.shown === "effects";

    //@ts-expect-error - Incomplete types
    await this.render({ parts: ["left"] });

    for (const [action, config] of Object.entries(this.#toggles)) {
      const button = this.element.querySelector<HTMLButtonElement>(`button[data-action="${action}"]`);
      if (!button) continue;
      const remove = config.state ? config.inactive : config.active;
      const add = config.state ? config.active : config.inactive;
      button.classList.remove(remove.icon);
      button.classList.add(add.icon);
      if (config.state) button.classList.add("active");
      else button.classList.remove("active");
      button.dataset.tooltip = add.tooltip;
      button.setAttribute("aria-label", game.i18n.localize(add.tooltip));
    }
  }

  static async #onToggleParty(this: HotbarPTR2e) {
    this.shown = this.shown === "party" ? null : "party";
    await this.#updateToggles();
  }

  static async #onToggleMovement(this: HotbarPTR2e) {
    this.shown = this.shown === "movement" ? null : "movement";
    await this.#updateToggles();
  }

  static async #onTogglePassives(this: HotbarPTR2e) {
    this.shown = this.shown === "passives" ? null : "passives";
    await this.#updateToggles();
  }

  static async #onToggleEffects(this: HotbarPTR2e) {
    this.shown = this.shown === "effects" ? null : "effects";
    await this.#updateToggles();
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Hotbar {
    interface HotbarContext {
      toggle: string | null;
      tab: string;
      isOwner: boolean;
      party: ActorPTR2e["party"] | null;
      effects: ActiveEffectPTR2e[];
      skills: Skill[];
      actor: ActorPTR2e;

      actions: {
        passives: ActorPTR2e["actions"]["passive"];
        generic: ActionPTR2e[];
        slots: ActorPTR2e["attacks"]["actions"];
        other: AttackPTR2e[]
      };
    }

    interface HotbarSlotData {
      attack?: AttackPTR2e | null;
      skill?: Skill | null;
    }
  }
}