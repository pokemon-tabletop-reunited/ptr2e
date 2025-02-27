import { ConsumablePTR2e } from "@item";
import { default as ItemSheetPTR2e } from "./base.ts";

export default class ConsumableSheet extends ItemSheetPTR2e<ConsumablePTR2e["system"]> {
  static override DEFAULT_OPTIONS = fu.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      classes: ["ability-sheet"],
      window: {
        minimizable: super.DEFAULT_OPTIONS.window?.minimizable ?? true,
        resizable: super.DEFAULT_OPTIONS.window?.resizable ?? true,
        controls: [
          ...(super.DEFAULT_OPTIONS.window?.controls ?? []),
          {
            icon: "fa-regular fa-bag-shopping",
            label: "Purchase with IP?",
            action: "purchase",
            visible: true
          }
        ]
      },
      actions: {
        purchase: async function (this: ConsumableSheet) {
          const actor = canvas?.tokens?.controlled?.[0]?.actor ?? game.user.character;
          if(!actor) return void ui.notifications.error("PTR2E.CompendiumBrowser.Purchase.NotControlledToken", {localize: true});

          const item = this.item as ConsumablePTR2e;
          const cost = item.system.cost;
          if(!cost) return void ui.notifications.error("PTR2E.CompendiumBrowser.Purchase.NoCost", {localize: true});

          const availableIP = actor.system.inventoryPoints.current;
          if(cost > availableIP) return void ui.notifications.error(game.i18n.format("PTR2E.CompendiumBrowser.Purchase.NotEnoughIP", { required: cost, current: availableIP }));

          const newIP = availableIP - cost;
          await actor.update({ "system.inventoryPoints.current": newIP });

          await actor.createEmbeddedDocuments("Item", [item.clone({"system.temporary": true}).toObject()]);
          ui.notifications.info(game.i18n.format("PTR2E.CompendiumBrowser.Purchase.Success", { actor: actor.name, item: item.name, cost, remaining: newIP }));          
          if(item.system.rarity !== "common") {
            ui.notifications.warn("PTR2E.CompendiumBrowser.Purchase.RarityWarning", {localize: true});
          }
        }
      }
    },
    { inplace: false }
  );

  static override readonly overviewTemplate = "systems/ptr2e/templates/items/consumable/consumable-overview.hbs";
  static override readonly detailsTemplate = "systems/ptr2e/templates/items/consumable/consumable-details.hbs";
  override noActions = true;

  static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> =
    fu.mergeObject(super.PARTS, {
      overview: {
        template: ConsumableSheet.overviewTemplate,
      },
      details: {
        template: ConsumableSheet.detailsTemplate,
      },
    }, { inplace: false });
}