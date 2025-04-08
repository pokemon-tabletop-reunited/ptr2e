import { formatSlug, sluggify } from "@utils";
import { ApplicationConfigurationExpanded, ApplicationV2Expanded } from "./appv2-expanded.ts";
import { HandlebarsRenderOptions } from "types/foundry/common/applications/handlebars-application.ts";
import { ActorPTR2e } from "@actor";
import { TutorListSchema, TutorListSettings } from "@system/tutor-list/setting-model.ts";
import { forEach } from "remeda";

export class TutorListApp extends foundry.applications.api.HandlebarsApplicationMixin(ApplicationV2Expanded) {
  static override DEFAULT_OPTIONS = fu.mergeObject(
    super.DEFAULT_OPTIONS,
    {
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
    },
    { inplace: false }
  );

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
  sortByGrade = false;
  selectedGrades: Set<string> = new Set();

  constructor(options?: Partial<ApplicationConfigurationExpanded>) {
    super(options);

    this.filter = new SearchFilter({
      inputSelector: "input[name='filter']",
      contentSelector: "nav.tutor-list-options",
      callback: this._onSearchFilter.bind(this),
    });

    this.selectedGrades = new Set();
  }

  override render(options: boolean | Partial<HandlebarsRenderOptions & { actor: ActorPTR2e | null }>, _options?: (HandlebarsRenderOptions & { actor?: ActorPTR2e | null }) | undefined): Promise<this> {
    this.actor = options === true ? _options?.actor ?? null : options ? options.actor ?? _options?.actor ?? null : null;
    return super.render(options, _options);
  }

  override _prepareContext(options?: foundry.applications.api.HandlebarsRenderOptions | undefined) {
    const lists =  getGradedTutorList().list.contents;

    return {
      ...super._prepareContext(options),
      lists: (this.actor ? this.filterList() : lists).sort((a, b) => {
        if (a.slug === "universal") return -1;
        if (b.slug === "universal") return 1;
        if (a.slug === "species-list") return -1;
        if (b.slug === "species-list") return 1;
        if (a.type === b.type) {
          return a.slug.localeCompare(b.slug);
        }
        return (a.type ?? "").localeCompare(b.type ?? "");
      }).map(list => ({
        slug: list.slug,
        title: list.type !== "universal" ? `${formatSlug(list.slug)} (${list.type === 'egg' ? 'Egg Group' : formatSlug(list.type)})` : formatSlug(list.slug),
        hidden: this.currentTab !== "" ? this.currentTab !== list.slug : false,
        moves: Array.from(list.moves.values())
          .map((move) => ({
            slug: move.slug,
            title: formatSlug(move.slug),
            grade: move.grade,
            uuid: move.uuid,
            pack: move.uuid?.split("Compendium.")?.[1].split(".Item")?.[0] ?? "",
          }))
          .filter((move) => this.selectedGrades.size === 0 || this.selectedGrades.has(move.grade))
          .sort((a, b) => {
            if (this.sortByGrade) {
              if (a.grade === b.grade) {
                return (a.slug ?? "").localeCompare(b.slug ?? "");
              }
              if (a.grade === "S" && b.grade !== "S") {
                return -1;
              } else if (a.grade !== "S" && b.grade === "S") {
                return 1;
              } else {
                return (a.grade ?? "").localeCompare(a.grade ?? "");
              }
            } else {
              return 0;
            }
          })
      })),
      tab: this.currentTab,
      actor: this.actor,
      sortByGrade: this.sortByGrade,
      selectedGrades: Array.from(this.selectedGrades)
    }
  }


filterList() {
    const actor = this.actor;
    const tutorList = getGradedTutorList();
    
    if (!actor) return tutorList.list.contents;

    const resultLists = [tutorList.get("universal-universal")!];

    const speciesList = this.actor?.species?.moves.tutor.reduce((acc, val) => {
      const slug = sluggify(val.name);
      let grade = "";
      forEach(tutorList.list.contents, (list) => {
        const move = list.moves.find(m => m.uuid == val.uuid);
        if (move) {
          grade = move.grade;
        }
        if (grade != "") {
          return;
        }
      });
      acc.moves.set(slug, { slug, uuid: val.uuid, grade: grade as string });
      return acc;
    }, {
      slug: "species-list",
      type: "universal",
      moves: new Collection()
    } as TutorListSchema) ?? null;

    if (speciesList?.moves?.size) resultLists.push(speciesList);

    for (const trait of actor.traits) {
      const list = tutorList.getType(trait.slug, "trait");
      if (list) resultLists.push(list);
    }

    for (const ability of Object.keys(actor.rollOptions.getFromDomain("item")).reduce((acc, val) => {
      if (val.startsWith("ability:")) acc.push(val.slice(8));
      return acc;
    }, [] as string[])) {
      const list = tutorList.getType(ability, "ability");
      if (list) resultLists.push(list);
    }

    for (const eggGroup of actor.species?.eggGroups ?? []) {
      const list = tutorList.getType(sluggify(eggGroup), "egg");
      if (list) resultLists.push(list);
    }

    return resultLists;
  }

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

      const sortCheckbox = htmlElement.querySelector<HTMLInputElement>("input[name='sort-grade']");
      if (sortCheckbox) {
        sortCheckbox.addEventListener("change", event => {
          event.preventDefault();
          this.sortByGrade = (event.target as HTMLInputElement).checked;
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
          this.render({ actor: this.actor, parts: ["aside", "list"] });
        });
      });
    }
  }

  _onSearchFilter(_event: KeyboardEvent, query: string, rgx: RegExp, html: HTMLElement) {
    const visibleLists = new Set();
    for (const entry of html.querySelectorAll<HTMLAnchorElement>("a.item.list-tab")) {
      if (!query) {
        entry.classList.remove("hidden");
        continue;
      }
      const slug = entry.dataset.tab;
      const match = (slug && rgx.test(SearchFilter.cleanQuery(slug)));
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
    const data: { uuid: string, type: string } = TextEditor.getDragEventData(event);
    if (data.type !== "Actor" || !data.uuid) return;

    const actor = await fromUuid<ActorPTR2e>(data.uuid);
    if (!actor) return;
    this.render({ actor, parts: ["aside", "list"] });
    }
}


export interface TutorListApp {
  constructor: typeof TutorListApp;
}

function getGradedTutorList(): TutorListSettings {
  const tutorList = game.ptr.data.tutorList;
  const packMap: Map<string, any[]> = new Map();

  forEach(tutorList.list.contents, (list) => {
    forEach(list.moves.contents, (move) => {
      const pack = move.uuid?.split("Compendium.")?.[1].split(".Item")?.[0] ?? "";
      if (pack) {
        if (!packMap.has(pack)) {
          packMap.set(pack, []);
        }
        packMap.get(pack)!.push(move);
      }
    });
  });

  const moveMap: Map<string, any> = new Map();

  Array.from(packMap.entries()).forEach(async ([pack, moves]) => {
    const packIndex = await game.packs.get(pack)?.getIndex({ fields: ["system.grade"] });

    if (packIndex == null) {
      return;
    }

    // Map over the packIndex to assign grades to the moves
    packIndex.forEach((item: any) => {
      const move = moves.find(m => m.uuid === item.uuid);
      if (move) {
        move.grade = item.system.grade;
        moveMap.set(move.uuid, move);
      }
    });
  });

  // Now iterate over the original tutorList and populate the grade value from sortedMoves
  forEach(tutorList.list.contents, (list) => {
    forEach(list.moves.contents, (move) => {
      if (move.uuid) {
        const gradedMove = moveMap.get(move.uuid);
        if (gradedMove) {
          move.grade = gradedMove.grade;
        }
      }
    });
  });

  return tutorList;
}