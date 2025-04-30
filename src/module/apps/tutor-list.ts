import { formatSlug, sluggify } from "@utils";
import { ApplicationConfigurationExpanded, ApplicationV2Expanded } from "./appv2-expanded.ts";
import { HandlebarsRenderOptions } from "types/foundry/common/applications/handlebars-application.ts";
import { ActorPTR2e } from "@actor";
import { TutorListMove, TutorListSchema } from "@system/tutor-list/setting-model.ts";
import { grades } from "../data/mixins/has-gear-data.ts";

export class TutorListApp extends foundry.applications.api.HandlebarsApplicationMixin(ApplicationV2Expanded) {
  static override DEFAULT_OPTIONS = {
    tag: "div",
    classes: ["sheet", "tutor-list", "default-sheet"],
    position: {
      height: 680,
      width: 550,
    },
    window: {
      title: "PTR2E.TutorList",
      minimizable: true,
      resizable: true,
    },
    dragDrop: [{ dragSelector: null, dropSelector: '.window-content' }],
    actions: {
      "clear": function (this: TutorListApp) { this.render({ actor: null, parts: ["aside", "list"] }) },
    }
  } as unknown as Omit<DeepPartial<ApplicationConfigurationExpanded>, "uniqueId">;

  static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
    aside: {
      id: "aside",
      template: "systems/ptr2e/templates/apps/tutor-list-aside.hbs",
      scrollable: [".scroll"],

    },
    list: {
      id: "list",
      template: "systems/ptr2e/templates/apps/tutor-list-list.hbs",
      scrollable: [".scroll"],
      classes: ["scroll"]
    },
  };

  filter: SearchFilter;
  actor: ActorPTR2e | null = null;
  currentTab = "";
  sortBy: SortOptions = SortOptions.Name;
  selectedGrades = new Set();

  constructor(options?: Partial<ApplicationConfigurationExpanded>) {
    super(options);

    this.filter = new foundry.applications.ux.SearchFilter({
      inputSelector: "input[name='filter']",
      contentSelector: "nav.tutor-list-options",
      callback: this._onSearchFilter.bind(this),
    });
  }

  override render(options: boolean | Partial<HandlebarsRenderOptions & { actor: ActorPTR2e | null }>, _options?: (HandlebarsRenderOptions & { actor?: ActorPTR2e | null }) | undefined): Promise<this> {
    this.actor = options === true ? _options?.actor ?? null : options ? options.actor ?? _options?.actor ?? null : null;
    return super.render(options, _options);
  }

  lists: TutorListSchema[] = [];

  override async _prepareContext(options?: foundry.applications.api.HandlebarsRenderOptions | undefined) {
    this.lists = (await this.getLists()).sort((a, b) => {
      if (a.slug === "universal") return -1;
      if (b.slug === "universal") return 1;
      if (a.slug === "species-list") return -1;
      if (b.slug === "species-list") return 1;
      if (a.type === b.type) {
        return a.slug.localeCompare(b.slug);
      }
      return (a.type ?? "").localeCompare(b.type ?? "");
    });
    return {
      ...super._prepareContext(options),
      lists: this.lists.map(list => ({
        id: list.id,
        slug: list.slug,
        title: list.type !== "universal" ? `${formatSlug(list.slug)} (${list.type === 'egg' ? 'Egg Group' : formatSlug(list.type)})` : formatSlug(list.slug),
        hidden: this.currentTab !== "" ? this.currentTab !== list.slug : false,
        moves: list.moves.map((move) => ({
            slug: move.slug,
            title: formatSlug(move.slug),
            grade: move.grade,
            uuid: move.uuid,
            pack: move.uuid?.split("Compendium.")?.[1].split(".Item")?.[0] ?? "",
            hidden: this.selectedGrades.size > 0 && !this.selectedGrades.has(move.grade),
          }))
          .sort((a, b) => {
            switch (this.sortBy) {
              case SortOptions.Grade: {
                if (a.grade === b.grade) {
                  return (a.slug ?? "").localeCompare(b.slug ?? "");
                }

                const gradeA = grades.indexOf(a.grade as typeof grades[number]);
                const gradeB = grades.indexOf(b.grade as typeof grades[number]);
                return gradeA - gradeB;
              }
              case SortOptions.Name:
              default:
                return (a.slug ?? "").localeCompare(b.slug ?? "");
            }
          })
      })),
      tab: this.currentTab,
      actor: this.actor,
      sortBy: this.sortBy,
      selectedGrades: Array.from(this.selectedGrades)
    }
  }

  async getLists() {
    const tutorLists = game.ptr.data.tutorList;

    const resultLists: TutorListSchema[] = this.actor ? [tutorLists.get("universal-universal")!] : tutorLists.list.contents;
    if(this.actor) {
      // const speciesList = this.actor.species?.moves.tutor;

      for (const trait of this.actor.traits) {
        const list = tutorLists.getType(trait.slug, "trait");
        if (list) resultLists.push(list);
      }
  
      for (const ability of Object.keys(this.actor.rollOptions.getFromDomain("item")).reduce((acc, val) => {
        if (val.startsWith("ability:")) acc.push(val.slice(8));
        return acc;
      }, [] as string[])) {
        const list = tutorLists.getType(ability, "ability");
        if (list) resultLists.push(list);
      }
  
      for (const eggGroup of this.actor.species?.eggGroups ?? []) {
        const list = tutorLists.getType(sluggify(eggGroup), "egg");
        if (list) resultLists.push(list);
      }
    }

    const packs = new Set<string>();
    const moves = new Map<string, TutorListMove>();

    for(const list of resultLists) {
      for(const move of list.moves) {
        if(!move.uuid) continue;
        if(moves.has(move.uuid)) continue;
        const pack = move.uuid.split("Compendium.")?.[1].split(".Item")[0] ?? "";
        if(!pack) continue;
        packs.add(pack);
        moves.set(move.uuid, move);
      }
    }

    for(const pack of packs) {
      const packIndex = await game.packs.get(pack)?.getIndex({ fields: ["system.grade"] });
      if(!packIndex) continue;

      for(const item of packIndex) {
        const move = moves.get(item.uuid);
        if(!move) continue;
        move.grade = item.system.grade;
      }
    }

    return resultLists;
  }


  // async filterList() {
  //   const actor = this.actor;
  //   const tutorList = await getGradedTutorList();
  //   if (!actor) return tutorList.list.contents;

  //   const resultLists = [tutorList.get("universal-universal")!];

  //   const speciesList = this.actor?.species?.moves.tutor.reduce((acc, val) => {
  //     const slug = sluggify(val.name);
  //     let grade = "";
  //     forEach(tutorList.list.contents, (list) => {
  //       const move = list.moves.find(m => m.uuid == val.uuid);
  //       if (move) {
  //         grade = move.grade;
  //       }
  //       if (grade != "") {
  //         return;
  //       }
  //     });
  //     acc.moves.set(slug, { slug, uuid: val.uuid, grade: grade as string });
  //     return acc;
  //   }, {
  //     slug: "species-list",
  //     type: "universal",
  //     moves: new Collection()
  //   } as TutorListSchema) ?? null;

  //   if (speciesList?.moves?.size) resultLists.push(speciesList);

  //   for (const trait of actor.traits) {
  //     const list = tutorList.getType(trait.slug, "trait");
  //     if (list) resultLists.push(list);
  //   }

  //   for (const ability of Object.keys(actor.rollOptions.getFromDomain("item")).reduce((acc, val) => {
  //     if (val.startsWith("ability:")) acc.push(val.slice(8));
  //     return acc;
  //   }, [] as string[])) {
  //     const list = tutorList.getType(ability, "ability");
  //     if (list) resultLists.push(list);
  //   }

  //   for (const eggGroup of actor.species?.eggGroups ?? []) {
  //     const list = tutorList.getType(sluggify(eggGroup), "egg");
  //     if (list) resultLists.push(list);
  //   }

  //   return resultLists;
  // }

  override _attachPartListeners(partId: string, htmlElement: HTMLElement, options: HandlebarsRenderOptions): void {
    super._attachPartListeners(partId, htmlElement, options);

    if (partId === "aside") {
      this.filter.bind(this.element);
      htmlElement.querySelectorAll<HTMLAnchorElement>("a.item").forEach(tab => {
        tab.addEventListener("click", event => {
          event.preventDefault();
          this.currentTab = tab.dataset.tab ?? "";
          if (this.currentTab === "") {
            const input = htmlElement.querySelector<HTMLInputElement>("input[name='filter']")
            if (input) input.value = "";
          }
          this.render({ actor: this.actor, parts: ["aside", "list"] });
        });
      });

      const sortDropdown = htmlElement.querySelector<HTMLSelectElement>("select[name='sort-by']");
      if (sortDropdown) {
        sortDropdown.addEventListener("change", event => {
          event.preventDefault();
          this.sortBy = (event.target as HTMLSelectElement).value as SortOptions;
          this.render({ actor: this.actor, parts: ["list"] });
        });
      }

      htmlElement.querySelectorAll<HTMLButtonElement>(".grade-filter").forEach(button => {
        button.addEventListener("click", event => {
          event.preventDefault();
          const target = event.target as HTMLButtonElement;
          const grade = target.getAttribute("data-grade");
          if (target.classList.contains("active")) {
            this.selectedGrades.delete(grade!);
          } else {
            this.selectedGrades.add(grade!);
          }
          target.classList.toggle("active");

          // this.listState = Flip.getState("#ptr2e-tutor-list main[data-application-part='list'] section.tutor-list, #ptr2e-tutor-list main[data-application-part='list'] section.tutor-list li" );
          

          // Flip.from(this.listState, {
          //   duration: 1,
          //   ease: "ease-in-out",
          //   absolute: true,
          //   // targets: "#ptr2e-tutor-list main[data-application-part='list'] section.tutor-list li",
          //   onEnter: elements => gsap.fromTo(elements, {opacity: 0}, {opacity: 1}),
          //   onLeave: elements => gsap.fromTo(elements, {opacity: 1}, {opacity: 0}),
          //   onComplete: () => this.listState = null,
          // });

          this.render({ actor: this.actor, parts: ["aside", "list"] });
        });
      });
    }
  }

  override _onRender(context: foundry.applications.api.ApplicationRenderContext, options: HandlebarsRenderOptions): void {
    super._onRender(context, options);
    if (this.listState) {
      Flip.from(this.listState, {
        duration: 0.5,
        ease: "ease-in-out",
        absolute: true,
        targets: "#ptr2e-tutor-list main[data-application-part='list'] section.tutor-list",
        onComplete: () => this.listState = null,
      });
    }
  }

  listState: Flip.FlipState | null = null;

  _onSearchFilter(_event: KeyboardEvent, query: string, rgx: RegExp, html: HTMLElement) {
    const visibleLists = new Set();
    for (const entry of html.querySelectorAll<HTMLAnchorElement>("a.item.list-tab")) {
      if (!query) {
        entry.classList.remove("hidden");
        continue;
      }
      const slug = entry.dataset.tab;
      const match = (slug && rgx.test(foundry.applications.ux.SearchFilter.cleanQuery(slug)));
      entry.classList.toggle("hidden", !match);
      if (match) visibleLists.add(slug);
    }

    // Hide lists that don't match the query
    if (!this.currentTab) {
      for (const section of this.element.querySelectorAll<HTMLElement>("main section.tutor-list")) {
        section.classList.toggle("hidden", !!query && !visibleLists.has(section.dataset.tab));
      }
    }
  }

  override async _onDrop(event: DragEvent) {
    event.preventDefault();
    const data: { uuid: string, type: string } = foundry.applications.ux.TextEditor.getDragEventData(event);
    if (data.type !== "Actor" || !data.uuid) return;

    const actor = await fromUuid<ActorPTR2e>(data.uuid);
    if (!actor) return;
    this.render({ actor, parts: ["aside", "list"] });
  }
}


export interface TutorListApp {
  constructor: typeof TutorListApp;
}

enum SortOptions {
  Name = "name",
  Grade = "grade"
}