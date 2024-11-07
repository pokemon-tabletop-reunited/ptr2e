import { MovePTR2e } from "@item";
import { DocumentSheetConfiguration, Tab } from "./document.ts";
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

    const tutorLists = (this.document.system.tutorLists as { slug: string; sourceType: string }[]).map(tl=>({
      slug: tl.slug,
      sourceType: tl.sourceType,
      label: (()=>{
          if (tl.sourceType == "universal")
              return "Universal";
          if (tl.sourceType == "trait")
              return `[${game.ptr.data.traits.get(tl.slug)?.label ?? tl.slug.titleCase()}]`;
          return `${tl.sourceType?.titleCase?.()}: ${tl.slug?.titleCase?.()}`;
      })(),
    }));

    return {
      ...(await super._prepareContext()),
      attack: {
        attack: attack,
        source: attack?._source,
        fields: attack?.schema.fields,
        enrichedDescription: await TextEditor.enrichHTML(attack?.description ?? null),
      },
      tutorLists,
    };
  }

  override _attachPartListeners(partId: string, htmlElement: HTMLElement, options: DocumentSheetConfiguration<MovePTR2e>): void {
    super._attachPartListeners(partId, htmlElement, options);
    if (partId === "details") {
      const tagAdd = htmlElement.querySelector(".tutor-list button.add")!;
      tagAdd.addEventListener("click", this._addTutorList.bind(this));

      for (const tagRemove of htmlElement.querySelectorAll(".tutor-list .input-element-tags .remove")) {
        tagRemove.addEventListener("click", this._removeTutorList.bind(this));
      }
    }
  }

  _addTutorList(event: Event) {
    const tutorListEl = (event.target as HTMLElement)?.parentElement;
    if (!tutorListEl) return;
    const sourceType = (tutorListEl.querySelector(".tutor-list-source-type") as HTMLSelectElement)?.value;
    const slug = (tutorListEl.querySelector(".tutor-list-slug") as HTMLInputElement)?.value;
    if (!sourceType || (!slug && sourceType !== "universal")) return;
    const tutorList = fu.deepClone(this.document.system.tutorLists) as { slug: string; sourceType: string }[];
    if (sourceType === "universal") {
      if (!tutorList.find(tl=>tl.sourceType == "universal")) {
        tutorList.push({ slug: "universal", sourceType: "universal" });
        this.document.update({
          "system.tutorLists": tutorList,
        });
      }
      return;
    }

    // add
    if (!tutorList.find(tl=>tl.sourceType == sourceType && tl.slug == slug)) {
      tutorList.push({ slug, sourceType });
      this.document.update({
        "system.tutorLists": tutorList,
      });
    }
  }

  _removeTutorList(event: Event) {
    const tag = (event.target as HTMLElement)?.parentElement;
    const slug = tag?.dataset?.slug;
    const sourceType = tag?.dataset?.sourceType;
    if (!slug || !sourceType) return;
    this.document.update({
      // @ts-ignore
      "system.tutorLists": this.document.system.tutorLists.filter(tl=>tl.slug !== slug || tl.sourceType !== sourceType),
    }).then(()=>this.render({}));
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
