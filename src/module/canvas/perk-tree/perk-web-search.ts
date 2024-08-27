import { ApplicationV2Expanded } from "@module/apps/appv2-expanded.ts";
import { createHTMLElement, fontAwesomeIcon, htmlClosest, htmlQuery, htmlQueryAll, isObject, objectHasKey } from "@utils";
import Tagify from "@yaireo/tagify";
import MiniSearch, { SearchResult } from "minisearch";
import { HandlebarsRenderOptions } from "types/foundry/common/applications/handlebars-application.ts";
import { PerkState } from "./perk-node.ts";

export default class PerkWebSearch extends foundry.applications.api.HandlebarsApplicationMixin(
  ApplicationV2Expanded
) {
  static override DEFAULT_OPTIONS = fu.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      tag: "aside",
      id: "perk-web-search",
      classes: ["application", "sheet", "perk-hud"],
      window: {
        frame: false,
        positioned: false,
      },
      actions: {},
    },
    { inplace: false }
  );

  static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
    header: {
      id: "header",
      template: "systems/ptr2e/templates/perk-tree/search/header.hbs",
    },
    search: {
      id: "search",
      template: "systems/ptr2e/templates/perk-tree/search/search.hbs",
    },
    results: {
      id: "results",
      template: "systems/ptr2e/templates/perk-tree/search/results.hbs",
    },
  };

  static STOP_WORDS = new Set([
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "has",
    "he",
    "in",
    "is",
    "it",
    "its",
    "of",
    "on",
    "that",
    "the",
    "to",
    "was",
    "were",
    "will",
    "with",
    "th",
  ]);

  override async _prepareContext() {
    await this.initialize();
    return {
      filterData: this.filterData,
      actor: game.ptr.web.actor,
      editMode: game.ptr.web.editMode,
    };
  }

  override _attachPartListeners(partId: string, htmlElement: HTMLElement, options: HandlebarsRenderOptions) {
    super._attachPartListeners(partId, htmlElement, options);

    if (partId === "search") {
      const searchInput = htmlElement.querySelector<HTMLInputElement>("input[name='search']");
      searchInput?.addEventListener("input", () => {
        this.filterData.search.text = searchInput.value;
        this.clearScrollLimit();
        this.renderResultList({ replace: true });
      });

      const orderSelect = htmlElement.querySelector<HTMLSelectElement>("select[name='order']");
      orderSelect?.addEventListener("change", () => {
        this.filterData.order.by = orderSelect.value;
        this.clearScrollLimit(true);
      });

      const directionAnchor = htmlElement.querySelector<HTMLAnchorElement>("a.direction");
      if (directionAnchor) {
        directionAnchor.addEventListener("click", () => {
          const direction = directionAnchor.dataset.direction ?? "asc";
          this.filterData.order.direction = direction === "asc" ? "desc" : "asc";
          this.clearScrollLimit(true);
        });
      }

      const archetypeSelect = htmlElement.querySelector<HTMLSelectElement>("select[name='archetype']");
      archetypeSelect?.addEventListener("change", () => {
        this.filterData.selects.archetype.selected = archetypeSelect.value;
        this.clearScrollLimit(true);
      });

      const stateSelect = htmlElement.querySelector<HTMLSelectElement>("select[name='state']");
      stateSelect?.addEventListener("change", () => {
        this.filterData.selects.state.selected = stateSelect.value;
        this.clearScrollLimit(true);
      });

      for (const container of htmlQueryAll(htmlElement, "[data-filter-type]")) {
        const { filterType, filterName } = container.dataset;

        // if (filterType === "checkboxes") {
        //   container.querySelectorAll<HTMLInputElement>("input[type='checkbox']").forEach((checkboxElement) => {
        //     checkboxElement.addEventListener("click", () => {
        //       if (objectHasKey(this.filterData.checkboxes, filterName)) {
        //         const optionName = checkboxElement.name;
        //         const checkbox = this.filterData.checkboxes[filterName];
        //         const option = checkbox.options[optionName];
        //         option.selected = !option.selected;
        //         if (option.selected) {
        //           checkbox.selected.push(optionName);
        //         } else {
        //           checkbox.selected = checkbox.selected.filter((name) => name !== optionName);
        //         }
        //         this.render(true);
        //       }
        //     });
        //   });
        // }

        if (filterType === "multiselects") {
          // Multiselects using tagify
          const multiselects = this.filterData.multiselects;
          if (!multiselects) continue;
          if (objectHasKey(multiselects, filterName)) {
            const multiselect = container.querySelector<HTMLInputElement>(
              `input[name=${filterName}][data-tagify-select]`,
            );
            if (!multiselect) continue;
            const data = multiselects[filterName];

            const tagify = new Tagify(multiselect, {
              enforceWhitelist: true,
              keepInvalidTags: false,
              editTags: false,
              tagTextProp: "label",
              dropdown: {
                enabled: 0,
                fuzzySearch: false,
                mapValueTo: "label",
                maxItems: data.options.length,
                searchKeys: ["label"],
              },
              whitelist: data.options,
              transformTag(tagData) {
                const selected = data.selected.find((s) => s.value === tagData.value);
                if (selected?.not) {
                  (tagData as unknown as { class: string }).class = "conjunction-not";
                }
              },
            });

            tagify.on("click", (event) => {
              const target = event.detail.event.target as HTMLElement;
              if (!target) return;
              const action = htmlClosest(target, "[data-action]")?.dataset?.action;
              if (action === "toggle-not") {
                const value = event.detail.data.value;
                const selected = data.selected.find((s) => s.value === value);
                if (selected) {
                  selected.not = !selected.not;
                  this.render(true);
                }
              }
            });
            tagify.on("change", (event) => {
              const selections: unknown = JSON.parse(event.detail.value || "[]");
              const isValid =
                Array.isArray(selections) &&
                selections.every(
                  (s: unknown): s is { value: string; label: string } =>
                    isObject<{ value: unknown }>(s) && typeof s["value"] === "string",
                );

              if (isValid) {
                data.selected = selections;
                this.render(true);
              }
            });

            for (const element of htmlQueryAll<HTMLInputElement>(
              container,
              `input[name=${filterName}-filter-conjunction]`,
            )) {
              element.addEventListener("change", () => {
                const value = element.value;
                if (value === "and" || value === "or") {
                  data.conjunction = value;
                  this.render(true);
                }
              });
            }

            for (const tag of htmlQueryAll(container, "tag")) {
              const icon = fontAwesomeIcon("ban", { style: "solid" });
              icon.classList.add("fa-2xs");
              const notButton = createHTMLElement("a", {
                classes: ["conjunction-not-button"],
                children: [icon],
                dataset: { action: "toggle-not" },
              });
              tag.appendChild(notButton);
            }
          }
        }
      }
    }

    this.renderResultList();
  }

  private clearScrollLimit(render = false): void {
    const list = htmlQuery(this.element, "ul.item-list");
    if (!list) return;
    list.scrollTop = 0;
    this.scrollLimit = 50;
    if (render) this.render(true);
  }

  private renderResultList({ start = 0, replace = false } = {}) {
    const list = htmlQuery(this.element, "ul.item-list");
    if (!list) return;

    // Get results
    const results = this.renderResult(start);
    // Activate Result Listeners
    this.activateResultListeners(results);
    // Add results to DOM
    const fragment = document.createDocumentFragment();
    fragment.append(...results);
    if (replace) {
      list.replaceChildren(fragment);
    }
    else {
      list.append(fragment);
    }
  }

  private renderResult(start: number): HTMLElement[] {
    const indexData = this.getIndexData(start);
    const liElements: HTMLLIElement[] = [];
    for (const entry of indexData) {
      const li = document.createElement("li");
      li.dataset.uuid = entry.uuid;
      li.dataset.tooltip = entry.name;
      li.dataset.tooltipDirection = "LEFT";
      li.classList.add("item", "perk", "search-result");
      li.innerHTML = `<span class="perk-name">${entry.name}</span><span class="perk-cost">${entry.cost}</span>`;
      liElements.push(li);
    }
    return liElements;
  }

  private activateResultListeners(results: HTMLElement[]): void {
    for (const liElement of results) {
      const { uuid } = liElement.dataset;
      if (!uuid) continue;

      liElement.addEventListener("click", () => {
        const node = game.ptr.web.collection.find((node) => node.perk?.uuid === uuid);
        if (!node) return;

        game.ptr.web.hudNode = node.element ?? null;
        game.ptr.web.panToNode(node);
      });
    }
  }

  #initialized = false;
  declare searchEngine: MiniSearch<PerkIndexData>;
  declare currentIndex: PerkIndexData[];
  declare indexData: PerkIndexData[];
  declare filterData: PerkFilterData;
  totalItemCount = 0;
  scrollLimit = 50;

  async initialize() {
    if (this.#initialized) return;
    this.filterData ??= fu.deepClone(this.defaultFilterData);
    this.loadData();

    this.searchEngine = new MiniSearch({
      fields: ["name", "description", "traits", "prerequisites"],
      idField: "uuid",
      processTerm: (term) =>
        !PerkWebSearch.STOP_WORDS.has(term.toLowerCase())
          ? term.toLocaleLowerCase(game.i18n.lang).replace(/['"]/g, "")
          : null,
      storeFields: [
        "name",
        "uuid",
        "description",
        "traits",
        "prerequisites",
        "cost",
        "available"
      ],
      searchOptions: {
        combineWith: "AND",
        prefix: true,
        boost: { name: 2, description: 0.8, traits: 1, prerequisites: 1 },
      },
    });
    this.searchEngine.addAll(this.indexData);

    this.#initialized = true;
  }

  loadData(): void {
    const perks: PerkIndexData[] = [];
    const traits = new Collection<{ slug: string, label: string }>();
    const archetypes = new Set<string>();
    for (const node of game.ptr.web.collection) {
      if (!node.perk) continue;

      const perk = node.perk.clone({}, { keepId: true });
      for (const trait of perk.system.traits) {
        if (!traits.has(trait.slug)) {
          traits.set(trait.slug, { slug: trait.slug, label: trait.label });
        }
      }
      if (perk.system.design.archetype) archetypes.add(perk.system.design.archetype);
      perks.push({
        name: perk.name,
        uuid: perk.uuid,
        description: perk.system.description,
        traits: perk.system.traits.map((t) => t.slug),
        prerequisites: Array.from(perk.system.prerequisites),
        cost: perk.system.cost,
        archetype: perk.system.design.archetype,
        available: node.state === PerkState.available,
      });
    }

    this.indexData = perks;
    this.filterData.selects.archetype.options = Array.from(archetypes).sort().reduce((acc, archetype) => ({ ...acc, [archetype]: archetype }), { "none": "" });
    this.filterData.multiselects.traits.options = this.generateMultiselectOptions(traits.reduce((acc, trait) => ({ ...acc, [trait.slug]: trait.label }), {}));
  }

  async refresh() {
    this.#initialized = false;
    await this.initialize();
    return this.render(true);
  }

  /** Reset all filters */
  resetFilters(): void {
    this.filterData = fu.deepClone(this.defaultFilterData);
  }

  /** Filter indexData and return slice based on current scrollLimit */
  getIndexData(start: number): PerkIndexData[] {
    if (!this.#initialized) throw new Error("Search index not initialized");

    this.currentIndex = (() => {
      const searchText = this.filterData.search.text;
      if (searchText) {
        const searchResult = this.searchEngine.search(searchText) as PerkSearchIndexData[];
        return this.sortResult(searchResult.filter(this.filterIndexData.bind(this)));
      }
      return this.sortResult(this.indexData.filter(this.filterIndexData.bind(this)));
    })();

    this.totalItemCount = this.currentIndex.length;
    return this.currentIndex.slice(start, this.scrollLimit);
  }

  /** Filter indexData */
  protected filterIndexData(entry: PerkSearchIndexData): boolean {
    entry = fu.expandObject(entry);
    const { multiselects, selects } = this.filterData;

    // Available only?
    if (selects.state.selected === "available") {
      return entry.available;
    }

    // Traits
    if (!this.filterTraits(entry.traits, multiselects.traits.selected, multiselects.traits.conjunction)) {
      return false;
    }

    // Archetype
    if (selects.archetype.selected && selects.archetype.selected !== "none") {
      if (entry.archetype !== selects.archetype.selected) return false;
    }

    return true;
  }

  /** Sort result array by name, level or price */
  protected sortResult(result: PerkSearchIndexData[]): PerkSearchIndexData[] {
    const { order } = this.filterData;
    const lang = game.i18n.lang;
    const sorted = result.sort((a, b) => {
      switch (order.by) {
        case "name":
          return a.name.localeCompare(b.name, lang);
        case "cost":
          return a.cost - b.cost;
        default:
          return 0;
      }
    });
    return order.direction === "asc" ? sorted : sorted.reverse();
  }

  protected filterTraits(
    traits: string[],
    selected: MultiselectData["selected"],
    condition: MultiselectData["conjunction"],
  ): boolean {
    const selectedTraits = selected.filter((s) => !s.not).map((s) => s.value);
    const notTraits = selected.filter((t) => t.not).map((s) => s.value);
    if (selectedTraits.length || notTraits.length) {
      if (notTraits.some((t) => traits.includes(t))) {
        return false;
      }
      const fullfilled =
        condition === "and"
          ? selectedTraits.every((t) => traits.includes(t))
          : selectedTraits.some((t) => traits.includes(t));
      if (!fullfilled) return false;
    }
    return true;
  }

  protected generateMultiselectOptions<T extends string>(
    optionsRecord: Record<T, string>,
    sort?: boolean
  ): { value: T; label: string }[];
  protected generateMultiselectOptions(
    optionsRecord: Record<string, string>,
    sort = true
  ): { value: string; label: string }[] {
    const options = Object.entries(optionsRecord).map(([value, label]) => ({
      value,
      label: game.i18n.localize(label),
    }));
    if (sort) {
      options.sort((a, b) => a.label.localeCompare(b.label, game.i18n.lang));
    }

    return options;
  }

  defaultFilterData: PerkFilterData = {
    order: {
      by: "name",
      direction: "asc",
      options: {
        name: "Name",
        cost: "Cost",
      },
    },
    search: {
      text: "",
    },
    selects: {
      archetype: {
        label: "PTR2E.FIELDS.design.archetype.label",
        options: {},
        selected: "",
      },
      state: {
        label: "State",
        options: {
          none: "All",
          available: "Available Only"
        },
        selected: "none"
      }
    },
    multiselects: {
      traits: {
        label: "Traits",
        conjunction: "or",
        options: [],
        selected: [],
      },
    }
  };
}

interface PerkIndexData {
  name: string;
  uuid: string;
  description: string;
  traits: string[];
  prerequisites: string[];
  cost: number;
  archetype: string | null;
  available: boolean;
}

type PerkSearchIndexData = PerkIndexData & Partial<SearchResult>;

interface PerkFilterData {
  order: OrderData;
  search: {
    text: string;
  };
  multiselects: {
    traits: MultiselectData<string>;
  };
  selects: {
    archetype: SelectData;
    state: SelectData;
  }
}

interface OrderData {
  by: string;
  direction: SortDirection;
  /** The key must be present as an index key in the database */
  options: Record<string, string>;
}

type SortDirection = "asc" | "desc";

interface SelectData {
  label: string;
  options: Record<string, string>;
  selected: string;
}

interface MultiselectData<T extends string = string> {
  label: string;
  conjunction: "and" | "or";
  options: { label: string; value: T }[];
  selected: { label: string; not?: boolean; value: T }[];
}

// type CheckboxOptions = Record<string, { label: string; selected: boolean }>;
// interface CheckboxData {
//   isExpanded: boolean;
//   label: string;
//   options: CheckboxOptions;
//   selected: string[];
// }