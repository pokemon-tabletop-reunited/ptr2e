import { htmlQueryAll } from "@utils";
import { ActorComponent } from "./base.ts";
import type ActorPTR2e from "@actor/base.ts";
class EffectComponent extends ActorComponent {
  static override TEMPLATE = "systems/ptr2e/templates/actor/components/actor-effect-component.hbs";
  static override TOOLTIP = "PTR2E.ActorSheet.Components.Effects.tooltip";

  override renderComponent(data: Record<string, unknown>): Promise<string> {
    data.effects = this.actor.effects.contents;
    return renderTemplate(this.template, data);
  }

  override attachListeners(htmlElement: HTMLElement) {
    return EffectComponent.attachListeners(htmlElement, this.actor);
  }

  static attachListeners(htmlElement: HTMLElement, actor: ActorPTR2e) {
    for (const element of htmlQueryAll(htmlElement, ".item-controls .effect-to-chat")) {
      element.addEventListener("click", async (event) => {
        const effectId = (
          (event.currentTarget as HTMLElement)?.closest(".effect") as HTMLElement
        )?.dataset.effectId;
        if (!effectId) return;
        return (
          actor.effects.get(effectId) as ActiveEffect.ConfiguredInstance
        )?.toChat();
      });
    }

    for (const element of htmlQueryAll(htmlElement, ".item-controls .effect-edit")) {
      element.addEventListener("click", async (event) => {
        const effectId = (
          (event.currentTarget as HTMLElement)?.closest(".effect") as HTMLElement
        )?.dataset.effectId;
        if (!effectId) return;
        return (
          actor.effects.get(effectId) as ActiveEffect.ConfiguredInstance
        )?.sheet?.render(true);
      });
    }

    for (const element of htmlQueryAll(htmlElement, ".item-controls .effect-delete")) {
      element.addEventListener("click", async (event) => {
        const effectId = (
          (event.currentTarget as HTMLElement)?.closest(".effect") as HTMLElement
        )?.dataset.effectId;
        const effect = actor.effects.get(effectId!);
        if (!effect) return;

        // Confirm the deletion unless the user is holding Shift
        return event.shiftKey ? effect.delete() : foundry.applications.api.DialogV2.confirm({
          //@ts-expect-error - FIXME: FVTT-Types are incorrect
          yes: {
            callback: () => effect.delete(),
          },
          content: game.i18n.format("PTR2E.Dialog.DeleteDocumentContent", {
            name: effect.name,
          }),
          //@ts-expect-error - FIXME: FVTT-Types are incorrect
          window: {
            title: game.i18n.format("PTR2E.Dialog.DeleteDocumentTitle", {
              name: effect.name,
            }),
          },
        });
      });
    }
  }
}

export { EffectComponent }