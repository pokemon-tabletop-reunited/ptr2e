import { AbilitiesComponent } from "./abilities-component.ts";
import type { ActorComponent } from "./base.ts";
import { EffectComponent } from "./effect-component.ts";
import { MovementComponent } from "./movement-component.ts";
import { PerksComponent } from "./perks-component.ts";
import { FavouriteSkillsComponent, SkillsComponent } from "./skills-component.ts";
import { ToggleComponent } from "./toggle-component.ts";

const ActorComponents = {
  "effects": EffectComponent,
  "skills": SkillsComponent,
  "favourite-skills": FavouriteSkillsComponent,
  "abilities": AbilitiesComponent,
  "perks": PerksComponent,
  "movement": MovementComponent,
  "toggles": ToggleComponent,
}
type ActorComponentKey = keyof typeof ActorComponents;

interface ComponentApplicationConfiguration extends foundry.applications.api.ApplicationV2.Configuration {
  actor: Actor.ConfiguredInstance;
  component: ActorComponentKey | ActorComponent;
}

interface ComponentPopoutContext {
  actor: Actor.ConfiguredInstance
  component: string;
  [key: string]: unknown;
}

class ComponentPopout extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.api.ApplicationV2
)<ComponentPopoutContext, ComponentApplicationConfiguration> {
  static override DEFAULT_OPTIONS =
    {
      id: "{id}",
      classes: ["ptr2e", "sheet", "actor", "popout"],
      position: {
        width: 'auto' as const,
        height: 'auto' as const,
      },
      window: {
        resizable: false,
      },
      tag: 'aside',
      actions: {
        "open-actor": function (this: ComponentPopout) {
          this.actor.sheet!.render(true);
        }
      }
    }

  static override PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    popout: {
      id: "popout",
      template: "systems/ptr2e/templates/actor/actor-component.hbs",
    }
  };

  override get title() {
    return game.i18n.format(`PTR2E.ActorSheet.Components.${this.component.constructor.name}.title`, { actor: this.actor.name });
  }

  override _initializeApplicationOptions(options: ComponentApplicationConfiguration): ComponentApplicationConfiguration {
    const appOptions = super._initializeApplicationOptions(options);
    if (typeof options.component !== "string") //@ts-expect-error - FIXME: Look at this later.
      appOptions.actions = foundry.utils.mergeObject(appOptions.actions, options.component.constructor.ACTIONS);

    return {
      ...appOptions,
      uniqueId: `${options.component!.constructor.name}-${options.actor!.uuid}`,
      actor: options.actor,
      component: options.component,
    }
  }
  actor: Actor.ConfiguredInstance;
  component: ActorComponent;

  constructor(options: DeepPartial<ComponentApplicationConfiguration>) {
    options.component = (typeof options.component === "string") ? new ActorComponents[options.component](options.actor) : options.component;
    super(options);

    this.actor = options.actor;
    this.component = options.component as ActorComponent;
  }

  override async _prepareContext(): Promise<ComponentPopoutContext> {
    return {
      actor: this.actor,
      component: await this.component.renderComponent({ actor: this.actor })
    };
  }

  override _attachPartListeners(partId: string, htmlElement: HTMLElement, options: foundry.applications.api.HandlebarsApplicationMixin.HandlebarsRenderOptions): void {
    super._attachPartListeners(partId, htmlElement, options);

    if (partId === "popout") {
      this.component.attachListeners(htmlElement);
    }
  }

  override async _renderFrame(options: foundry.applications.api.HandlebarsApplicationMixin.HandlebarsRenderOptions): Promise<HTMLElement> {
    const frame = await super._renderFrame(options);

    this.component.renderFrame(this.window.close!);

    // Add Actor button to the header
    const actorLabel = game.i18n.localize("PTR2E.ActorSheet.Components.actor");
    const actorButton = `<button type="button" class="header-control fa-solid fa-user" data-action="open-actor"
                                    data-tooltip="${actorLabel}" aria-label="${actorLabel}"></button>`;
    this.window.close!.insertAdjacentHTML("beforebegin", actorButton);

    return frame;
  }

  /** @override */
  override _onFirstRender() {
    this.actor.apps[this.id] = this;
  }

  /* -------------------------------------------- */

  /** @override */
  override _onClose() {
    delete this.actor.apps[this.id];
  }
}

export { ComponentPopout, ActorComponents, type ActorComponentKey }