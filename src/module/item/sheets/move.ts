import { MovePTR2e } from "@item";
import { Tab } from "./document.ts";
import { default as ItemSheetPTR2e } from "./base.ts";

export default class MoveSheet extends ItemSheetPTR2e<MovePTR2e["system"]> {
  static override DEFAULT_OPTIONS = fu.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      classes: ["move-sheet"],
    },
    { inplace: false }
  );

  static override readonly overviewTemplate =
    "systems/ptr2e/templates/items/move/move-overview.hbs";
  static override readonly detailsTemplate =
    "systems/ptr2e/templates/items/move/move-details.hbs";
  override noActions = false;

  static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> =
    fu.mergeObject(
      super.PARTS,
      {
        overview: {
          template: MoveSheet.overviewTemplate,
        },
        details: {
          template: MoveSheet.detailsTemplate,
        },
        // attack: {
        //     id: "attack",
        //     template: "/systems/ptr2e/templates/items/move/move-attack.hbs",
        //     scrollable: [".scroll"],
        //     forms: {
        //         "#attack": {
        //             handler: this._submitAttack,
        //             closeOnSubmit: false,
        //             submitOnChange: true,
        //         },
        //     },
        // },
      },
      { inplace: false }
    );

  override tabs: Record<string, Tab> = {
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
    // attack: {
    //     id: "attack",
    //     group: "sheet",
    //     icon: "fa-solid fa-bullseye",
    //     label: "PTR2E.ItemSheet.Tabs.attack.label",
    // },
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

  override async _prepareContext() {
    const attack = this.document.system.attack;

    return {
      ...(await super._prepareContext()),
      attack: {
        attack: attack,
        source: attack?._source,
        fields: attack?.schema.fields,
        enrichedDescription: await TextEditor.enrichHTML(attack?.description ?? null),
      },
    };
  }

  // static async _submitAttack(
  //     this: MoveSheet,
  //     _event: SubmitEvent | Event,
  //     _form: HTMLFormElement,
  //     formData: FormDataExtended
  // ) {
  //     const actions = fu.duplicate(this.document.system._source.actions);
  //     const attackIndex = actions.findIndex((action) => action.type === "attack");
  //     if (attackIndex === -1) return;

  //     const expanded = fu.expandObject(formData.object) as AttackPTR2e["_source"];
  //     actions[attackIndex] = fu.mergeObject(actions[attackIndex], expanded, { inplace: false });
  //     actions[attackIndex].slug = sluggify(actions[attackIndex].name);
  //     await this.document.update({ "system.actions": actions });
  // }
}
