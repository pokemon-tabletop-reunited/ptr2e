import { ActorPTR2e, Skill } from "@actor";
import { SkillsComponent } from "@actor/components/skills-component.ts";
import { ActionPTR2e, AttackPTR2e } from "@data";
import { ActiveEffectPTR2e } from "@effects";
import { TokenPTR2e } from "@module/canvas/token/object.ts";
import { ApplicationRenderOptions } from "types/foundry/common/applications/_types.js"
import { HandlebarsRenderOptions } from "types/foundry/common/applications/api/handlebars-application.ts";

export class HotbarPTR2e extends Hotbar {
  static override DEFAULT_OPTIONS = {
    actions: {
      party: HotbarPTR2e.#onToggleParty,
      movement: HotbarPTR2e.#onToggleMovement,
      passives: HotbarPTR2e.#onTogglePassives,
      effects: HotbarPTR2e.#onToggleEffects,
    }
  }

  static override PARTS = {
    left: {
      template: "systems/ptr2e/templates/hud/hotbar/left.hbs",
    },
    hotbar: {
      template: "systems/ptr2e/templates/hud/hotbar/hotbar.hbs",
    },
    right: {
      template: "systems/ptr2e/templates/hud/hotbar/right.hbs",
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
    this.render({parts: ["left"]});;
  }

  private _token: TokenPTR2e | null;

  /** The currently rendered side tab. */
  shown: "party" | "movement" | "passives" | "effects" | null = null;

  override async _prepareContext(options: ApplicationRenderOptions): Promise<Hotbar.HotbarContext> {
    const context = await super._prepareContext(options);

    if(this.token?.actor) {
      const actor = this.token.actor;
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

    if(partId === "left") {
      context.toggle = this.shown;

      if(!this.token) return context;
      const actor = this.token.actor;
      if(!actor) return context;
      context.actor = actor;
      const party = context.party = actor.party;
      context.isOwner = party?.owner == actor;
      context.effects = actor.effects.contents as ActiveEffectPTR2e[] ?? [];
      context.skills = SkillsComponent.prepareSkillsData(actor).skills.favourites.flatMap(s => s.skills);
    }

    if (partId === "hotbar") {
      context.slots = context.slots.map((slot: Hotbar.HotbarSlotData) => {
        return slot;
      });
    }

    return context;
  }

  protected override async _onRender(context: object, options: ApplicationRenderOptions): Promise<void> {
    await super._onRender(context, options);
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

    for ( const [action, config] of Object.entries(this.#toggles) ) {
      const button = this.element.querySelector<HTMLButtonElement>(`button[data-action="${action}"]`);
      if ( !button ) continue;
      const remove = config.state ? config.inactive : config.active;
      const add = config.state ? config.active : config.inactive;
      button.classList.remove(remove.icon);
      button.classList.add(add.icon);
      if(config.state) button.classList.add("active");
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
  }
}