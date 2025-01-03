import { default as ItemSheetPTR2e } from "./base.ts";
import type { AnyObject } from "fvtt-types/utils";

export default class MoveSheet extends ItemSheetPTR2e<AnyObject> {
  static override DEFAULT_OPTIONS = {
    classes: ["move-sheet"],
  }

  static override readonly overviewTemplate =
    "systems/ptr2e/templates/items/move/move-overview.hbs";
  static override readonly detailsTemplate =
    "systems/ptr2e/templates/items/move/move-details.hbs";
  override noActions = false;

  static override PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> =
    foundry.utils.mergeObject(
      super.PARTS,
      {
        overview: {
          template: MoveSheet.overviewTemplate,
        },
        details: {
          template: MoveSheet.detailsTemplate,
        },
      },
      { inplace: false }
    );

  override tabs = {
    overview: {
      id: "overview",
      group: "sheet",
      icon: "fa-solid fa-house",
      label: "PTR2E.ItemSheet.Tabs.overview.label",
    },
    details: {
      id: "details",
      group: "sheet",
      icon: "fa-solid fa-cogs",
      label: "PTR2E.ItemSheet.Tabs.details.label",
    },
    actions: {
      id: "actions",
      group: "sheet",
      icon: "fa-solid fa-bullseye",
      label: "PTR2E.ItemSheet.Tabs.actions.label",
    },
    effects: {
      id: "effects",
      group: "sheet",
      icon: "fa-solid fa-star",
      label: "PTR2E.ItemSheet.Tabs.effects.label",
    },
  };

  override changeTab(
    tab: string,
    group: string,
    {
      event,
      navElement,
      force = false,
      updatePosition = true,
    }: { event?: Event; navElement?: HTMLElement; force: boolean; updatePosition: boolean } = {
        force: false,
        updatePosition: true,
      }
  ): void {
    super.changeTab(tab, group, { event, navElement, force, updatePosition });
    if (!updatePosition) return;

    if (tab === "attack") {
      this.setPosition({ height: 700 });
    } else {
      this.setPosition({ height: 500 });
    }
  }

  override async _prepareContext(options: foundry.applications.api.HandlebarsApplicationMixin.HandlebarsRenderOptions): Promise<AnyObject> {
    const attack = this.document.system.attack;

    return {
      ...(await super._prepareContext(options)),
      attack: {
        attack: attack,
        source: attack?._source,
        fields: attack?.schema.fields,
        enrichedDescription: await TextEditor.enrichHTML(attack?.description ?? null),
      },
    };
  }
}
