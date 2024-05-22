import { htmlQueryAll } from "@utils";
import { ActorComponent } from "./base.ts";
import ActorPTR2e from "@actor/base.ts";
import { AbilityPTR2e } from "@item";

class AbilitiesComponent extends ActorComponent {
    static override TEMPLATE = "systems/ptr2e/templates/actor/components/actor-abilities-component.hbs";
    static override TOOLTIP = "PTR2E.ActorSheet.Components.Abilities.tooltip";

    override renderComponent(data: Record<string, unknown>): Promise<string> {
        data.ability = this.actor.itemTypes.ability;
        return renderTemplate(this.template, data);
    }

    override attachListeners(htmlElement: HTMLElement) {
        return AbilitiesComponent.attachListeners(htmlElement, this.actor);
    }

    static attachListeners(htmlElement: HTMLElement, actor: ActorPTR2e) {
        for (const element of htmlQueryAll(htmlElement, ".abilities-display .item-controls .item-to-chat")) {
            element.addEventListener("click", async (event) => {
                const itemId = (
                    (event.currentTarget as HTMLElement)?.closest(".item") as HTMLElement
                )?.dataset.id;
                if (!itemId) return;
                return (
                    actor.items.get(itemId) as AbilityPTR2e
                )?.toChat();
            });
        }

        for (const element of htmlQueryAll(htmlElement, ".abilities-display .item-controls .item-edit")) {
            element.addEventListener("click", async (event) => {
                const itemId = (
                    (event.currentTarget as HTMLElement)?.closest(".item") as HTMLElement
                )?.dataset.id;
                if (!itemId) return;
                return (
                    actor.items.get(itemId) as AbilityPTR2e
                )?.sheet?.render(true);
            });
        }

        for (const element of htmlQueryAll(htmlElement, ".abilities-display .item-controls .item-delete")) {
            element.addEventListener("click", async (event) => {
                const itemId = (
                    (event.currentTarget as HTMLElement)?.closest(".item") as HTMLElement
                )?.dataset.id;
                const item = actor.items.get(itemId!);
                if (!item) return;

                // Confirm the deletion unless the user is holding Shift
                return event.shiftKey ? item.delete() : foundry.applications.api.DialogV2.confirm({
                    yes: {
                        callback: () => item.delete(),
                    },
                    content: game.i18n.format("PTR2E.Dialog.DeleteDocumentContent", {
                        name: item.name,
                    }),
                    window: {
                        title: game.i18n.format("PTR2E.Dialog.DeleteDocumentTitle", {
                            name: item.name,
                        }),
                    },
                });
            });
        }
    }
}

export { AbilitiesComponent }