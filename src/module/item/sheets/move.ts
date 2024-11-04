import { MovePTR2e } from "@item";
import { Tab } from "./document.ts";
import { default as ItemSheetPTR2e } from "./base.ts";

import { Types, EggGroups } from "../../data/constants.ts";

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
        //     template: "systems/ptr2e/templates/items/move/move-attack.hbs",
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

    // TODO: rip most of this out, replace it with a custom input that doesn't have validation
    // Validation isn't worth it here, I think.

    const typeSlugs = (Object.values(Types) as unknown as string[]);

    const abilities = (await game.packs.get("ptr2e.core-abilities")?.getIndex({ fields: ["name", "system.slug"] })) ?? [];

    const allTutorLists = [
      { label: "Universal", value: { slug: "universal", sourceType: "universal" } },
      
      // type traits (technically just traits, but we'll sort them differently)
      ...Object.values(Types).map(t=>({ label: `Type: ${t.titleCase()}`, value: { slug: t, sourceType: "trait" }, group: "Types" })),

      // egg groups
      ...Object.values(EggGroups).map(e=>({ label: `Egg Group: ${e.titleCase()}`, value: { slug: e, sourceType: "egg" }, group: "Egg Groups" })),
      
      // traits
      ...game.ptr.data.traits
        .filter(t=>!typeSlugs.includes(t.slug))
        .map(t=>({ label: `Trait: ${t.label}`, value: { slug: t.slug, sourceType: "trait" }, group: "Traits" })),
      
      // all the abilities
      ...abilities.map(a=>({ label: `Ability: ${a.name}`, value: { slug: a?.system?.slug, sourceType: "ability" }, group: "Abilities" })),
    ];
    // @ts-ignore
    allTutorLists.forEach(tl=>tl.value = JSON.stringify(tl.value, ["slug", "sourceType"]));
    const tutorLists = this.document.system.tutorLists.map(tl=>JSON.stringify(tl, ["slug", "sourceType"]));

    return {
      ...(await super._prepareContext()),
      attack: {
        attack: attack,
        source: attack?._source,
        fields: attack?.schema.fields,
        enrichedDescription: await TextEditor.enrichHTML(attack?.description ?? null),
      },
      tutorLists,
      allTutorLists,
    };
  }

  override _prepareSubmitData(
    event: SubmitEvent,
    form: HTMLFormElement,
    formData: FormDataExtended
  ): Record<string, unknown> {
    const submitData = formData.object;

    if (
      "tutorLists" in submitData &&
      submitData["tutorLists"] &&
      typeof submitData["tutorLists"] === "object" &&
      Array.isArray(submitData["tutorLists"])
    ) {
      // tutorList entries are stored as an array of objects, not an array of strings
      submitData["system.tutorLists"] = submitData["tutorLists"].map(
        (tutorList: string) => JSON.parse(tutorList)
      );
      delete submitData["tutorLists"];
    }

    return super._prepareSubmitData(event, form, formData);
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
