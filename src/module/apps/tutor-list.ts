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
      lists: this.lists.map(list => {
        let visible = false;
        return {
          id: list.id,
          slug: list.slug,
          title: list.type !== "universal" ? `${formatSlug(list.slug)} (${list.type === 'egg' ? 'Egg Group' : formatSlug(list.type)})` : formatSlug(list.slug),
          hidden: this.currentTab !== "" ? this.currentTab !== list.slug : false,
          moves: list.moves.map((move) => {
            const result = {
              slug: move.slug,
              title: formatSlug(move.slug),
              grade: move.grade,
              uuid: move.uuid,
              pack: move.uuid?.split("Compendium.")?.[1].split(".Item")?.[0] ?? "",
              hidden: this.selectedGrades.size > 0 && !this.selectedGrades.has(move.grade),
            };
            if (!result.hidden) visible = true;
            return result;
          })
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
            }),
          visible
        }
      }),
      tab: this.currentTab,
      actor: this.actor,
      sortBy: this.sortBy,
      selectedGrades: Array.from(this.selectedGrades)
    }
  }

  async getLists() {
    const tutorLists = game.ptr.data.tutorList;

    const resultLists: TutorListSchema[] = this.actor ? [tutorLists.get("universal-universal")!] : tutorLists.list.contents;
    if (this.actor) {
      const speciesList = this.actor.species?.moves.tutor.reduce((acc, val) => {
        const slug = sluggify(val.name);
        acc.moves.set(slug, { slug, uuid: val.uuid, grade: val.grade })
        return acc;
      }, {
        slug: "species-list",
        type: "universal",
        moves: new Collection()
      } as TutorListSchema) ?? null;
      if (speciesList?.moves?.size) resultLists.push(speciesList);

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
    const moveLists = new Map<string, TutorListMove[]>();

    for (const list of resultLists) {
      for (const move of list.moves) {
        if (!move.uuid) continue;
        const existing = moveLists.get(move.uuid);
        if (existing?.length) {
          moveLists.set(move.uuid, existing.concat(move));
          continue;
        }
        const pack = move.uuid.split("Compendium.")?.[1].split(".Item")[0] ?? "";
        if (!pack) continue;
        packs.add(pack);
        moveLists.set(move.uuid, [move]);
      }
    }

    for (const pack of packs) {
      const packIndex = await game.packs.get(pack)?.getIndex({ fields: ["system.grade"] });
      if (!packIndex) continue;

      for (const item of packIndex) {
        const moves = moveLists.get(item.uuid);
        if (!moves) continue;
        for (const move of moves) move.grade = item.system.grade;
      }
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
          if(this.currentTab === tab.dataset.tab) return;

          if (this.#state) {
            Flip.killFlipsOf("#ptr2e-tutor-list main section.tutor-list");
          }
          this.#state = Flip.getState("#ptr2e-tutor-list main section.tutor-list", {props: "background"});

          if(this.currentTab) {
            const currentTab = this.element.querySelector<HTMLAnchorElement>(`nav.tutor-list-options a.item[data-tab='${this.currentTab}']`)
            
            if(currentTab) {
              const state = Flip.getState(currentTab, {props: "background"});
              currentTab.classList.remove("active");
              Flip.from(state, {duration: 1.2, simple: true});
            }
          } else {
            const allTab = this.element.querySelector<HTMLAnchorElement>(`nav.tutor-list-options a.item[data-tab='']`)
            if(allTab) {
              const state = Flip.getState(allTab, {props: "background"});
              allTab.classList.remove("active");
              Flip.from(state, {duration: 1.2, simple: true});
            }
          }
          this.currentTab = tab.dataset.tab ?? "";

          for (const section of this.element.querySelectorAll<HTMLElement>("main section.tutor-list")) {
            gsap.set(section, { display: section.dataset.tabSlug === this.currentTab ? "block" : "none" });
          }
          const option = this.element.querySelector<HTMLAnchorElement>(`nav.tutor-list-options a.item[data-tab='${this.currentTab}']`)
          if(option) {
            const state = Flip.getState(option, {props: "background"});
            option.classList.add("active");
            Flip.from(state, {duration: 1.2, simple: true});
          }
          this._onSearchFilter(new KeyboardEvent("input", { key: "Enter", code: "Enter" }), this.filter.query, new RegExp(RegExp.escape(this.filter.query), "i"), this.element.querySelector("nav.tutor-list-options")!);
        });
      });

      const sortDropdown = htmlElement.querySelector<HTMLSelectElement>("select[name='sort-by']");
      if (sortDropdown) {
        sortDropdown.addEventListener("change", event => {
          event.preventDefault();
          this.sortBy = (event.target as HTMLSelectElement).value as SortOptions;

          if (this.#state) {
            Flip.killFlipsOf("#ptr2e-tutor-list main section.tutor-list");
          }

          const container = this.element.querySelector<HTMLElement>("main .scroll")!;
          const isVisible = function (element: HTMLElement) {
            const eleTop = element.offsetTop;
            const eleBottom = eleTop + element.clientHeight;

            const containerTop = container.scrollTop;
            const containerBottom = containerTop + container.clientHeight;

            // The element is fully visible in the container
            return (
              (eleTop >= containerTop && eleBottom <= containerBottom) ||
              // Some part of the element is visible in the container
              (eleTop < containerTop && containerTop < eleBottom) ||
              (eleTop < containerBottom && containerBottom < eleBottom)
            );
          };

          const sections = Array.from(this.element.querySelectorAll<HTMLElement>("main section.tutor-list"));
          const stateSections = sections.filter(section => isVisible(section)).reduce((acc: HTMLElement[], section: HTMLElement) => {
            const entries = Array.from(section.querySelectorAll<HTMLElement>("ul li[data-slug]")).filter(entry => !entry.classList.contains("hidden"));
            if (entries.length) {
              acc.push(...entries);
            }
            return acc;
          }, [])

          const state = Flip.getState(sections.concat(stateSections));
          for (const section of sections) {
            const ordered = [...section.querySelectorAll<HTMLElement>("ul li[data-slug]")].sort((a, b) => {
              const aSlug = a.dataset.slug ?? "";
              const bSlug = b.dataset.slug ?? "";
              switch (this.sortBy) {
                case SortOptions.Grade: {
                  const aGrade = a.dataset.grade;
                  const bGrade = b.dataset.grade;
                  if (aGrade === bGrade) return aSlug.localeCompare(bSlug);
                  const gradeA = grades.indexOf(aGrade as typeof grades[number]);
                  const gradeB = grades.indexOf(bGrade as typeof grades[number]);
                  return gradeA - gradeB;
                }
                case SortOptions.Name:
                default:
                  return aSlug.localeCompare(bSlug);
              }
            })
            for (let i = 0; i < ordered.length; i++) {
              gsap.set(ordered[i], { order: i });
            }
          }
          Flip.from(state, {
            duration: 1.2,
            absolute: true,
            prune: true,
            simple: true,
            nested: true
          })
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

          if (this.#state) {
            Flip.killFlipsOf("#ptr2e-tutor-list main section.tutor-list");
          }

          const container = this.element.querySelector<HTMLElement>("main .scroll")!;
          const isVisible = function (element: HTMLElement) {
            const eleTop = element.offsetTop;
            const eleBottom = eleTop + element.clientHeight;

            const containerTop = container.scrollTop;
            const containerBottom = containerTop + container.clientHeight;

            // The element is fully visible in the container
            return (
              (eleTop >= containerTop && eleBottom <= containerBottom) ||
              // Some part of the element is visible in the container
              (eleTop < containerTop && containerTop < eleBottom) ||
              (eleTop < containerBottom && containerBottom < eleBottom)
            );
          };

          const sections = Array.from(this.element.querySelectorAll<HTMLElement>("main section.tutor-list"));
          const stateSections = sections.filter(section => isVisible(section)).reduce((acc: HTMLElement[], section: HTMLElement) => {
            const entries = Array.from(section.querySelectorAll<HTMLElement>("ul li[data-slug]")).filter(entry => !entry.classList.contains("hidden"));
            if (entries.length) {
              acc.push(...entries);
            }
            return acc;
          }, [])

          this.#state = Flip.getState(sections.concat(stateSections));
          for (const section of sections) {
            const menuEntry = this.element.querySelector<HTMLAnchorElement>(`aside a.item.list-tab[data-tab='${section.dataset.tabSlug}']`);
            let hasAnyEntry = false;
            for (const entry of section.querySelectorAll<HTMLElement>("ul li[data-slug]")) {
              const grade = entry.dataset.grade;
              if (this.selectedGrades.size > 0) {
                if (this.selectedGrades.has(grade!)) {
                  hasAnyEntry = true;
                  gsap.set(entry, { display: "block" });
                }
                else gsap.set(entry, { display: "none" });
              } else {
                hasAnyEntry = true;
                gsap.set(entry, { display: "block" });
              }
            }
            gsap.set([section, menuEntry], { display: hasAnyEntry ? "block" : "none" });
          }
          this._onSearchFilter(new KeyboardEvent("input", { key: "Enter", code: "Enter" }), this.filter.query, new RegExp(RegExp.escape(this.filter.query), "i"), this.element.querySelector("nav.tutor-list-options")!);
        });
      });
    }
  }

  #state: Flip.FlipState | null = null;

  _onSearchFilter(_event: KeyboardEvent, query: string, rgx: RegExp, html: HTMLElement) {
    const listState = this.#state ||= Flip.getState("#ptr2e-tutor-list main section.tutor-list");

    const visibleLists = new Set();
    const itemMatch = new Set();
    for (const entry of html.querySelectorAll<HTMLAnchorElement>("a.item.list-tab")) {
      if (!query) {
        entry.classList.remove("hidden");
        visibleLists.add(entry.dataset.tab ?? "");
        continue;
      }
      const slug = entry.dataset.tab;
      const match = (() => {
        const listNameMatch = !!(slug && rgx.test(foundry.applications.ux.SearchFilter.cleanQuery(slug)));

        let anyItem = false;
        for (const li of this.element.querySelectorAll<HTMLElement>(`main section.tutor-list[data-tab-slug='${slug}'] ul li[data-slug]`)) {
          const item = {
            slug: li.dataset.slug,
            hidden: li.classList.contains("hidden") || li.style.display === "none",
          }

          if (item.hidden) continue;
          if (item.slug && rgx.test(foundry.applications.ux.SearchFilter.cleanQuery(item.slug))) {
            itemMatch.add(item.slug);
            anyItem = true;
          } else if (listNameMatch) {
            itemMatch.add(item.slug!);
            anyItem = true;
          }
        }
        return anyItem;
      })()
      entry.classList.toggle("hidden", !match);

      if (match) visibleLists.add(slug);
    }

    // Hide lists that don't match the query
    if (!this.currentTab) {
      for (const section of this.element.querySelectorAll<HTMLElement>("main section.tutor-list")) {
        gsap.set(section, { display: visibleLists.has(section.dataset.tabSlug) ? "block" : "none" });
      }
    }
    for (const entry of this.element.querySelectorAll<HTMLElement>("main section.tutor-list ul li[data-slug]")) {
      gsap.to(entry, { filter: !itemMatch.size || (!!query && itemMatch.has(entry.dataset.slug)) ? "brightness(1)" : "brightness(0.5)", duration: 1.2 });
    }

    Flip.from(listState, {
      duration: 1.2,
      absolute: true,
      prune: true,
      simple: true,
      onEnter: elements => gsap.fromTo(elements, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }),
      onLeave: elements => gsap.to(elements, { autoAlpha: 0, duration: 0.8 }),
      onComplete: () => {
        this.#state = null;
      }
    })
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