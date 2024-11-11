import { formatSlug } from "@utils";
import { ApplicationConfigurationExpanded, ApplicationV2Expanded } from "./appv2-expanded.ts";
import { HandlebarsRenderOptions } from "types/foundry/common/applications/handlebars-application.ts";

export class TutorListApp extends foundry.applications.api.HandlebarsApplicationMixin(ApplicationV2Expanded) {
  static override DEFAULT_OPTIONS = fu.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      tag: "div",
      classes: ["sheet", "tutor-list", "default-sheet"],
      position: {
        height: 780,
        width: 500,
      },
      window: {
        title: "PTR2E.TutorList",
        minimizable: true,
        resizable: true,
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
  currentTab = "";

  constructor(options?: Partial<ApplicationConfigurationExpanded>) {
    super(options);

    this.filter = new SearchFilter({
      inputSelector: "input[name='filter']",
      contentSelector: "nav.tutor-list-options",
      callback: this._onSearchFilter.bind(this),
    });
  }

  override _prepareContext(options?: foundry.applications.api.HandlebarsRenderOptions | undefined) {
    return {
      ...super._prepareContext(options),
      lists: game.ptr.data.tutorList.list.map(list => ({
        slug: list.slug,
        title: formatSlug(list.slug),
        hidden: this.currentTab !== "" ? this.currentTab !== list.slug : false,
        moves: list.moves.map(move => ({
          slug: move.slug,
          title: formatSlug(move.slug),
          uuid: move.uuid
        }))
      })),
      tab: this.currentTab
    }
  }

  override _attachPartListeners(partId: string, htmlElement: HTMLElement, options: HandlebarsRenderOptions): void {
    super._attachPartListeners(partId, htmlElement, options);

    if (partId === "aside") {
      this.filter.bind(this.element);
      htmlElement.querySelectorAll<HTMLAnchorElement>("a.item").forEach(tab => {
        tab.addEventListener("click", event => {
          event.preventDefault();
          this.currentTab = tab.dataset.tab ?? "";
          if(this.currentTab === "") {
            const input = htmlElement.querySelector<HTMLInputElement>("input[name='filter']")
            if(input) input.value = "";
          }
          this.render({ parts: ["aside", "list"] });
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
    if(!this.currentTab) {
      for (const section of this.element.querySelectorAll<HTMLElement>("main section.tutor-list")) {
        section.classList.toggle("hidden", !!query && !visibleLists.has(section.dataset.tab));
      }
    }
  }
}