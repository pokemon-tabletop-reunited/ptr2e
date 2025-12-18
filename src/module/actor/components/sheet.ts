import { ActorSheetV2Expanded, DocumentSheetConfigurationExpanded } from "@module/apps/appv2-expanded.ts";
import ActorPTR2e from "../base.ts";
import { AbilitiesComponent } from "./abilities-component.ts";
import { ActorComponent } from "./base.ts";
import { EffectComponent } from "./effect-component.ts";
import { MovementComponent } from "./movement-component.ts";
import { PerksComponent } from "./perks-component.ts";
import { FavouriteSkillsComponent, SkillsComponent } from "./skills-component.ts";
import { ToggleComponent } from "./toggle-component.ts";
import { AbilityPTR2e, ItemPTR2e, MovePTR2e } from "@item";
import MoveSystem from "@item/data/move.ts";

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

type ComponentApplicationConfiguration = Required<{
  actor: ActorPTR2e;
  component: ActorComponentKey | ActorComponent;
}>

class ComponentPopout extends foundry.applications.api.HandlebarsApplicationMixin(
  ActorSheetV2Expanded
) {
  static override DEFAULT_OPTIONS = {
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
    dragDrop: [
      {
        dropSelector: ".window-content",
        dragSelector:
          "fieldset .item, fieldset .effect, fieldset .action, ul.items > li",
      },
    ],
    actions: {
      "open-actor": function (this: ComponentPopout) {
        this._actor.sheet.render(true);
      }
    }
  };

  static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
    popout: {
      id: "popout",
      template: "systems/ptr2e/templates/actor/actor-component.hbs",
    }
  };

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore - Ignore this error about override not being present in base class
  override get title() {
    return game.i18n.format(`PTR2E.ActorSheet.Components.${this.component.constructor.name}.title`, { actor: this._actor.name });
  }

  override _initializeApplicationOptions(options: Partial<DocumentSheetConfigurationExpanded> & ComponentApplicationConfiguration): DocumentSheetConfigurationExpanded & ComponentApplicationConfiguration {
    const appOptions = super._initializeApplicationOptions(options);
    if (typeof options.component !== "string")
      appOptions.actions = fu.mergeObject(appOptions.actions, options.component.constructor.ACTIONS);

    return {
      ...appOptions,
      uniqueId: `${options.component!.constructor.name}-${options.actor!.uuid}`,
      actor: options.actor,
      component: options.component,
    } as DocumentSheetConfigurationExpanded & ComponentApplicationConfiguration;
  }

  _actor: ActorPTR2e;
  component: ActorComponent;

  constructor(options: Partial<DocumentSheetConfigurationExpanded> & ComponentApplicationConfiguration) {
    options.component = (typeof options.component === "string") ? new ActorComponents[options.component](options.actor) : options.component;
    super(options);

    this._actor = options.actor;
    this.component = options.component as ActorComponent;
  }

  override async _prepareContext() {
    const context: Record<string, unknown> = {
      actor: this._actor,
    }
    context.component = await this.component.renderComponent(context);
    return context;
  }

  override _attachPartListeners(partId: string, htmlElement: HTMLElement, options: foundry.applications.api.HandlebarsRenderOptions): void {
    super._attachPartListeners(partId, htmlElement, options);

    if (partId === "popout") {
      this.component.attachListeners(htmlElement);
    }
  }

  override async _renderFrame(options: foundry.applications.api.HandlebarsRenderOptions): Promise<HTMLElement> {
    const frame = await super._renderFrame(options);

    this.component.renderFrame(this.window.close);

    // Add Actor button to the header
    const actorLabel = game.i18n.localize("PTR2E.ActorSheet.Components.actor");
    const actorButton = `<button type="button" class="header-control fa-solid fa-user" data-action="open-actor"
                                    data-tooltip="${actorLabel}" aria-label="${actorLabel}"></button>`;
    this.window.close.insertAdjacentHTML("beforebegin", actorButton);

    return frame;
  }

  override _onDragStart(event: DragEvent) {
    const target = event.currentTarget as HTMLElement;
    if (!target.classList.contains("attack")) return super._onDragStart(event);

    const actionSlug = target.dataset.slug;
    if (!actionSlug) return;

    const action = this._actor.actions.attack.get(actionSlug);
    if (!action) return;

    // Create drag data
    const dragData = action.toDragData();
    if (!dragData) return;

    // Set data transfer
    event.dataTransfer!.setData("text/plain", JSON.stringify(dragData));
  }

  override async _onDrop(event: DragEvent) {
    const data: {
      type: string;
      action?: {
        slug: string;
        type: string;
      };
      uuid?: string;
    } = foundry.applications.ux.TextEditor.getDragEventData(event);

    if (data.uuid) {
      const item = await fu.fromUuid(data.uuid);
      if (
        item instanceof ItemPTR2e &&
        item.type == "ability" &&
        this._actor.items.get(item.id) === item
      ) {
        return void this._onDropAbility(event, item);
      }
      if (
        this._actor.isOwner &&
        item instanceof ItemPTR2e &&
        item.type == "move" &&
        this._actor.uuid !== item.parent?.uuid
      ) {
        const move = item.toObject() as MovePTR2e['_source'];
        const actionDiv = (event.target as HTMLElement).closest(".action[data-slot]") as HTMLElement;
        if (actionDiv) {
          const slot = Number(actionDiv.dataset.slot);
          if (isNaN(slot)) return;

          const primaryAction = (move.system as unknown as MoveSystem["_source"]).actions[0]
          const currentAction = this._actor.attacks.actions[slot];
          if (currentAction) await currentAction.update({ slot: null });
          primaryAction.slot = slot;

          return this._actor.createEmbeddedDocuments("Item", [move]);
        }
      }
    }

    if (!data.action?.slug) return super._onDrop(event, data);
    //@ts-expect-error - This is a custom method
    return void this._onDropAction(event, data);
  }

  _onDropAction(
    event: DragEvent,
    data: {
      type: string;
      action: {
        slug: string;
        type: string;
      };
    }
  ) {
    const actionDiv = (event.target as HTMLElement).closest(
      ".action[data-slot]"
    ) as HTMLElement;
    if (!actionDiv) return;

    const slug = data.action.slug;
    if (!slug) return;

    const slot = Number(actionDiv.dataset.slot);
    if (isNaN(slot)) return;

    const action = this._actor.actions.attack.get(slug);
    if (!action) return;

    const currentAction = this._actor.attacks.actions[slot];
    if (!currentAction) {
      action.update({ slot: slot });
      return;
    }
    if (currentAction.slug === slug) return;

    currentAction.update({ slot: null });
    action.update({ slot: slot });
  }

  _onDropAbility(event: DragEvent, ability: AbilityPTR2e) {
    const abilityDiv = (event.target as HTMLElement).closest(
      ".action[data-slot]"
    ) as HTMLElement;
    if (!abilityDiv) return;

    if (ability.system.isSuppressed) return void ui.notifications.warn("This ability is suppressed and cannot be re-assigned.");

    const slot = Number(abilityDiv.dataset.slot);
    if (isNaN(slot)) return;

    const currentAbility = this._actor.abilities.entries[slot];
    if (!currentAbility) {
      ability.update({ "system.slot": slot });
      return;
    }
    if (currentAbility === ability) return;

    if (currentAbility.system.isSuppressed) return void ui.notifications.warn("That slot is filled with a suppressed ability which cannot be re-assigned");

    this._actor.updateEmbeddedDocuments("Item", [
      { _id: currentAbility.id, "system.slot": ability.system.slot ?? null },
      { _id: ability.id, "system.slot": slot },
    ]);
  }

  /** @override */
  override _onFirstRender() {
    //@ts-expect-error - App v1 compatability
    this._actor.apps[this.id] = this;
  }

  /* -------------------------------------------- */

  /** @override */
  override _onClose() {
    //@ts-expect-error  - App v1 compatability
    delete this._actor.apps[this.id];
  }
}

export { ComponentPopout, ActorComponents, type ActorComponentKey }