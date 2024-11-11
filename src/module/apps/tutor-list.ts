import { formatSlug, sluggify } from "@utils";
import { ApplicationConfigurationExpanded, ApplicationV2Expanded } from "./appv2-expanded.ts";
import { HandlebarsRenderOptions } from "types/foundry/common/applications/handlebars-application.ts";
import { ActorPTR2e } from "@actor";

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

  constructor(options?: Partial<ApplicationConfigurationExpanded>) {
    super(options);

    this.filter = new SearchFilter({
      inputSelector: "input[name='filter']",
      contentSelector: "nav.tutor-list-options",
      callback: this._onSearchFilter.bind(this),
    });
  }

  override render(options: boolean | Partial<HandlebarsRenderOptions & { actor: ActorPTR2e | null }>, _options?: (HandlebarsRenderOptions & { actor?: ActorPTR2e | null }) | undefined): Promise<this> {
    this.actor = options === true ? _options?.actor ?? null : options ? options.actor ?? _options?.actor ?? null : null;
    return super.render(options, _options);
  }

  override _prepareContext(options?: foundry.applications.api.HandlebarsRenderOptions | undefined) {
    const lists = game.ptr.data.tutorList.list;

    return {
      ...super._prepareContext(options),
      lists: (this.actor ? this.filterList() : lists).map(list => ({
        slug: list.slug,
        title: list.type !== "universal" ? `${formatSlug(list.slug)} (${list.type === 'egg' ? 'Egg Group' : formatSlug(list.type)})` : formatSlug(list.slug),
        hidden: this.currentTab !== "" ? this.currentTab !== list.id : false,
        moves: list.moves.map(move => ({
          slug: move.slug,
          title: formatSlug(move.slug),
          uuid: move.uuid
        }))
      })),
      tab: this.currentTab,
      actor: this.actor
    }
  }

  filterList() {
    const actor = this.actor;
    const tutorList = game.ptr.data.tutorList;
    if (!actor) return tutorList.list;

    const resultLists = [tutorList.get("universal-universal")!];

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

    for (const eggGroup of actor.system.species?.eggGroups ?? []) {
      const list = tutorList.getType(sluggify(eggGroup), "egg");
      if (list) resultLists
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