import { htmlQueryAll } from "@utils";
import { ActorComponent } from "./base.ts";
import ActorPTR2e from "@actor/base.ts";
import { PerkPTR2e } from "@item";

class PerksComponent extends ActorComponent {
    static override TEMPLATE = "systems/ptr2e/templates/actor/components/actor-perks-component.hbs";
    static override TOOLTIP = "PTR2E.ActorSheet.Components.Perks.tooltip";

    override renderComponent(data: Record<string, unknown>): Promise<string> {
        data.perks = this.actor.itemTypes.perk;
        return renderTemplate(this.template, data);
    }

    override attachListeners(htmlElement: HTMLElement) {
        return PerksComponent.attachListeners(htmlElement, this.actor);
    }

    static attachListeners(htmlElement: HTMLElement, actor: ActorPTR2e) {
        for (const element of htmlQueryAll(htmlElement, ".perks-display .item-controls .item-to-chat")) {
            element.addEventListener("click", async (event) => {
                const itemId = (
                    (event.currentTarget as HTMLElement)?.closest(".item") as HTMLElement
                )?.dataset.itemId;
                if (!itemId) return;
                return (
                    actor.items.get(itemId) as PerkPTR2e
                )?.toChat();
            });
        }

        for (const element of htmlQueryAll(htmlElement, ".perks-display .item-controls .item-edit")) {
            element.addEventListener("click", async (event) => {
                const itemId = (
                    (event.currentTarget as HTMLElement)?.closest(".item") as HTMLElement
                )?.dataset.itemId;
                if (!itemId) return;
                return (
                    actor.items.get(itemId) as PerkPTR2e
                )?.sheet?.render(true);
            });
        }

        for (const element of htmlQueryAll(htmlElement, ".perks-display .item-controls .item-delete")) {
            element.addEventListener("click", async (event) => {
                const itemId = (
                    (event.currentTarget as HTMLElement)?.closest(".item") as HTMLElement
                )?.dataset.itemId;
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

export { PerksComponent }