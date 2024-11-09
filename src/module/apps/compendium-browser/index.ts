import { ApplicationV2Expanded } from "../appv2-expanded.ts";
import { createHTMLElement, fontAwesomeIcon, htmlClosest, htmlQuery, htmlQueryAll, isObject, objectHasKey, setHasElement } from "@utils";
import { BrowserTabs, CompendiumBrowserSettings, PackInfo, TabData, TabName } from "./data.ts";
import * as browserTabs from "./tabs/index.ts";
import { PackLoader } from "./loader.ts";
import { Tab } from "@item/sheets/document.ts";
import { ItemType } from "@item/data/system.ts";
import * as R from "remeda";
import { BrowserFilter, CheckboxData, RangesInputData, RenderResultListOptions, SliderData } from "./tabs/data.ts";
import Tagify from "@yaireo/tagify";
import noUiSlider from "nouislider";

export class CompendiumBrowser extends foundry.applications.api.HandlebarsApplicationMixin(ApplicationV2Expanded) {
  static override DEFAULT_OPTIONS = fu.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      tag: "form",
      id: "compendium-browser",
      classes: ["sheet", "default-sheet"],
      position: {
        width: 800,
        height: 700,
      },
      window: {
        minimizable: true,
        resizable: true,
        controls: [
          {
            label: "PTR2E.ItemSheet.SendToChatLabel",
            icon: "fas fa-arrow-up-right-from-square",
            action: "toChat"
          },
        ]
      },
      actions: {
        // toChat: function toChat<TDocument extends ItemPTR2e<ItemSystemsWithActions>>(this: ActionEditor<TDocument>) {
        //   this.document.toChat();
        // }
      }
    },
    { inplace: false }
  );

  static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
    header: {
      id: "header",
      template: "systems/ptr2e/templates/apps/compendium-browser/header.hbs",
    },
    controls: {
      id: "controls",
      template: "systems/ptr2e/templates/apps/compendium-browser/controls.hbs",
      scrollable: [".scroll", ".control-area"]
    },
    content: {
      id: "content",
      template: "systems/ptr2e/templates/apps/compendium-browser/content.hbs",
      scrollable: [".scroll", ".content-area"],
    },
  };

  tabGroups: Record<string, string> = {
    tabs: "",
  }

  tabs: Record<string, Tab> = {
    "ability": {
      id: "ability",
      group: "tabs",
      icon: "",
      label: "PTR2E.CompendiumBrowser.Tabs.Ability",
    },
    "gear": {
      id: "gear",
      group: "tabs",
      icon: "",
      label: "PTR2E.CompendiumBrowser.Tabs.Gear",
    },
    "move": {
      id: "move",
      group: "tabs",
      icon: "",
      label: "PTR2E.CompendiumBrowser.Tabs.Move",
    },
    "perk": {
      id: "perk",
      group: "tabs",
      icon: "",
      label: "PTR2E.CompendiumBrowser.Tabs.Perk",
    },
    "species": {
      id: "species",
      group: "tabs",
      icon: "",
      label: "PTR2E.CompendiumBrowser.Tabs.Species",
    },
  }

  _getTabs() {
    for (const v of Object.values(this.tabs)) {
      v.active = this.tabGroups[v.group] === v.id;
      v.cssClass = v.active ? "active" : "";
    }
    return this.tabs;
  }

  override changeTab(tab: string, group: string, options?: { event?: Event; navElement?: HTMLElement; force?: boolean; updatePosition?: boolean; }): void {
    super.changeTab(tab, group, options);
    if (group === "tabs") this.loadTab(tab as TabName);
  }

  override get title() {
    return game.i18n.localize("PTR2E.CompendiumBrowser.Title");
  }

  // #allTraits: { value: string; label: string, type?: Trait["type"] }[] | undefined;

  settings: CompendiumBrowserSettings;
  dataTabsList = ["ability", "gear", "move", "perk", "species"] as const;
  // navigationTab: Tabs;
  compendiumTabs: BrowserTabs;

  packLoader = new PackLoader();
  declare activeTab: TabName;

  constructor(options: Partial<foundry.applications.api.ApplicationConfiguration> = {}) {
    super(options);

    this.settings = game.settings.get("ptr2e", "compendiumBrowserPacks");
    // this.navigationTab = this.hookTab();
    this.compendiumTabs = {
      ability: new browserTabs.Abilities(this),
      gear: new browserTabs.Gear(this),
      move: new browserTabs.Moves(this),
      perk: new browserTabs.Perks(this),
      species: new browserTabs.Species(this),
    }
    this.initCompendiumList();
  }

  initCompendiumList(): void {
    const settings: Omit<TabData<Record<string, PackInfo | undefined>>, "settings"> = {
      ability: {},
      gear: {},
      move: {},
      perk: {},
      species: {},
    }

    const loadDefault: Record<string, boolean | undefined> = {
      ability: true,
      gear: true,
      move: true,
      perk: true,
      species: true,
    }

    const browsableTypes = new Set([
      "ability",
      "consumable",
      "equipment",
      "gear",
      "move",
      "perk",
      "species",
      "weapon"
    ] as const)
    type BrowsableType = SetElement<typeof browsableTypes>;
    const typeToTab = new Map<ItemType, Exclude<TabName, "settings">>([
      ["ability", "ability"],
      ["consumable", "gear"],
      ["equipment", "gear"],
      ["gear", "gear"],
      ["move", "move"],
      ["perk", "perk"],
      ["species", "species"],
      ["weapon", "gear"],
    ]);

    for (const pack of game.packs) {
      const tabNames = R.unique(
        R.unique(pack.index.map(entry => entry.type))
          .filter((type): type is BrowsableType => setHasElement(browsableTypes, type))
          .flatMap(type => typeToTab.get(type) ?? [])
      )

      for (const tabName of tabNames) {
        const load =
          this.settings[tabName]?.[pack.collection]?.load
          ?? loadDefault[tabName]
          ?? !!loadDefault[pack.collection];
        settings[tabName]![pack.collection] = {
          load,
          name: pack.metadata.label,
          package: pack.metadata.packageName
        }
      }
    }

    for (const tab of this.dataTabsList) {
      settings[tab] = Object.fromEntries(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        Object.entries(settings[tab]!).sort(([_colA, dataA], [_colB, dataB]) =>
          (dataA?.name ?? "") > (dataB?.name ?? "") ? 1 : -1
        )
      )
    }

    this.settings = settings;
  }

  async openTab(tabName: TabName, filter?: BrowserFilter): Promise<void> {
    this.activeTab = tabName;
    if (tabName !== "settings" && filter) {
      return this.compendiumTabs[tabName].open(filter);
    }
    return this.loadTab(tabName);
  }

  async loadTab(tabName: TabName): Promise<void> {
    this.activeTab = tabName;

    if (tabName === "settings") {
      return;
    }
    if (!this.dataTabsList.includes(tabName)) {
      throw Error(`Unknown tab name: ${tabName}`);
    }

    const currentTab = this.compendiumTabs[tabName];
    if (!currentTab.isInitialized) {
      await currentTab.init();
    }

    this.render({ parts: ["controls", "content"] });
  }

  loadedPacks(tab: TabName): string[] {
    if (tab === "settings") return [];
    return Object.entries(this.settings[tab] ?? []).flatMap(([collection, info]) => {
      return info?.load ? [collection] : [];
    });
  }

  loadedPacksAll(): string[] {
    return R.unique(this.dataTabsList.flatMap((t) => this.loadedPacks(t))).sort();
  }

  // override _getHeaderControls(): foundry.applications.api.ApplicationHeaderControlsEntry[] {
  //   const controls = super._getHeaderControls();
  //   for (const control of controls) {
  //     if (!['deleteVariant', 'openOriginal'].includes(control.action)) continue;
  //     control.visible = !!this.action.variant
  //   }
  //   return controls;
  // }

  override async _prepareContext() {
    const activeTab = this.activeTab;
    const tab = objectHasKey(this.compendiumTabs, activeTab) ? this.compendiumTabs[activeTab] : null;

    const settings = {
      settings: this.settings,
      sources: this.packLoader.sourcesSettings
    }

    return {
      user: game.user,
      filterData: tab?.filterData,
      [activeTab]: activeTab === "settings" ? settings : { filterData: tab?.filterData },
      scrollLimit: tab?.scrollLimit,
      tabs: this._getTabs()
    };
  }

  override _attachPartListeners(
    partId: string,
    htmlElement: HTMLElement,
    options: foundry.applications.api.HandlebarsRenderOptions
  ): void {
    super._attachPartListeners(partId, htmlElement, options);

    const activeTabName = this.activeTab;
    if (!activeTabName || activeTabName === "settings") return;

    if (this.tabGroups["tabs"] !== activeTabName) {
      this.changeTab(activeTabName, "tabs", { force: true });
    }

    const currentTab = this.compendiumTabs[activeTabName];
    if (partId === "controls") {
      const search = htmlElement.querySelector<HTMLInputElement>("input[name=textFilter]");
      if (search) {
        search.addEventListener("input", () => {
          if(search.value?.length === 1) return;
          currentTab.filterData.search.text = search.value;
          this.#clearScrollLimit();
          this.#renderResultList({ replace: true });
        });
      }

      // Sort item list
      const sortContainer = htmlElement.querySelector<HTMLDivElement>("div.sortcontainer");
      if (sortContainer) {
        const order = sortContainer.querySelector<HTMLSelectElement>("select.order");
        if (order) {
          order.addEventListener("change", () => {
            currentTab.filterData.order.by = order.value ?? "name";
            this.#clearScrollLimit(true);
          });
        }
        const directionAnchor = sortContainer.querySelector<HTMLAnchorElement>("a.direction");
        if (directionAnchor) {
          directionAnchor.addEventListener("click", () => {
            const direction = directionAnchor.dataset.direction ?? "asc";
            currentTab.filterData.order.direction = direction === "asc" ? "desc" : "asc";
            this.#clearScrollLimit(true);
          });
        }
      }

      // Clear all filters button
      htmlElement.querySelector<HTMLButtonElement>("button.clear-filters")?.addEventListener("click", () => {
        this.#resetFilters();
        this.#clearScrollLimit(true);
      });

      // Filters
      const filterContainers = htmlElement.querySelectorAll<HTMLDivElement>("div.filtercontainer");
      for (const container of Array.from(filterContainers)) {
        const { filterType, filterName } = container.dataset;
        // Clear this filter button
        container
          .querySelector<HTMLButtonElement>("button[data-action=clear-filter]")
          ?.addEventListener("click", (event) => {
            event.stopImmediatePropagation();
            switch (filterType) {
              case "checkboxes": {
                if (!('checkboxes' in currentTab.filterData)) return;

                const checkboxes = currentTab.filterData.checkboxes;
                if (objectHasKey(checkboxes, filterName)) {
                  for (const option of Object.values((checkboxes[filterName] as CheckboxData).options)) {
                    option.selected = false;
                  }
                  (checkboxes[filterName] as CheckboxData).selected = [];
                  this.render(true);
                }
                break;
              }
            }
          });

        // Toggle visibility of filter container
        const title = container.querySelector<HTMLDivElement>("div.title");
        title?.addEventListener("click", () => {
          const toggleFilter = (filter: CheckboxData | RangesInputData | SliderData) => {
            filter.isExpanded = !filter.isExpanded;
            const contentElement = title.nextElementSibling;
            if (contentElement instanceof HTMLElement) {
              contentElement.style.display = filter.isExpanded ? "" : "none";
            }
          };
          switch (filterType) {
            case "checkboxes": {
              if(!currentTab.isOfType("species", "gear", "move")) return;
              if (objectHasKey(currentTab.filterData.checkboxes, filterName)) {
                toggleFilter(currentTab.filterData.checkboxes[filterName]);
              }
              break;
            }
            case "sliders": {
              if (!currentTab.isOfType("gear", "move", "perk")) return;
              if (objectHasKey(currentTab.filterData.sliders, filterName)) {
                toggleFilter(currentTab.filterData.sliders[filterName]);
              }
              break;
            }
          }
        });

        if (filterType === "checkboxes") {
          container.querySelectorAll<HTMLInputElement>("input[type=checkbox]").forEach((checkboxElement) => {
            checkboxElement.addEventListener("click", () => {
              if(!currentTab.isOfType("species", "gear", "move")) return;
              if (objectHasKey(currentTab.filterData.checkboxes, filterName)) {
                const optionName = checkboxElement.name;
                const checkbox = currentTab.filterData.checkboxes[filterName] as CheckboxData;
                const option = checkbox.options[optionName];
                option.selected = !option.selected;
                if (option.selected) {
                  checkbox.selected.push(optionName);
                } else {
                  checkbox.selected = checkbox.selected.filter((name) => name !== optionName);
                }
                this.#clearScrollLimit(true);
              }
            });
          });
        }

        // if (filterType === "ranges") {
        //   container.querySelectorAll<HTMLInputElement>("input[name*=Bound]").forEach((range) => {
        //     range.addEventListener("keyup", (event) => {
        //       if (!currentTab.isOfType("species")) return;
        //       if (event.key !== "Enter") return;
        //       const ranges = currentTab.filterData.ranges;
        //       if (ranges && objectHasKey(ranges, filterName)) {
        //         const range = ranges[filterName];
        //         const lowerBound =
        //           container.querySelector<HTMLInputElement>("input[name*=lowerBound]")?.value ?? "";
        //         const upperBound =
        //           container.querySelector<HTMLInputElement>("input[name*=upperBound]")?.value ?? "";
        //         const values = currentTab.parseRangeFilterInput(filterName, lowerBound, upperBound);
        //         range.values = values;
        //         range.changed = true;
        //         this.#clearScrollLimit(true);
        //       }
        //     });
        //   });
        // }

        if (filterType === "multiselects") {
          // Multiselects using tagify
          const multiselects = currentTab.filterData.multiselects;
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
                  this.render({ parts: ["controls", "content"] });
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
                this.render({ parts: ["controls", "content"] });
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
                  this.render({ parts: ["controls", "content"] });
                }
              });
            }

            for (const tag of htmlQueryAll(container, "tag")) {
              const icon = fontAwesomeIcon("ban", { style: "solid" });
              const notButton = createHTMLElement("a", {
                classes: ["conjunction-not-button", ...(tag.getAttribute("not") == "true" ? ["active"] : [])],
                children: [icon],
                dataset: { action: "toggle-not" },
              });
              tag.appendChild(notButton);
            }
          }
        }

        if (filterType === "sliders") {
          // Slider filters
          if(!currentTab.isOfType("perk", "gear", "move")) return;
          const sliders = currentTab.filterData.sliders;
          if (!sliders) continue;

          if (objectHasKey(sliders, filterName)) {
            const sliderElement = container.querySelector<HTMLDivElement>(`div.slider-${filterName}`);
            if (!sliderElement) continue;
            const sliderData = sliders[filterName] as SliderData;

            const slider = noUiSlider.create(sliderElement, {
              range: {
                min: sliderData.values.lowerLimit,
                max: sliderData.values.upperLimit,
              },
              start: [sliderData.values.min, sliderData.values.max],
              tooltips: {
                to(value: number) {
                  return Math.floor(value).toString();
                },
              },
              connect: [false, true, false],
              behaviour: "snap",
              step: sliderData.values.step,
            });

            slider.on("change", (values) => {
              const [min, max] = values.map((value) => Number(value));
              sliderData.values.min = min;
              sliderData.values.max = max;

              const $minLabel = $(htmlElement).find(`label.${name}-min-label`);
              const $maxLabel = $(htmlElement).find(`label.${name}-max-label`);
              $minLabel.text(min);
              $maxLabel.text(max);

              this.#clearScrollLimit(true);
            });

            // Set styling
            sliderElement.querySelectorAll<HTMLDivElement>(".noUi-handle").forEach((element) => {
              element.classList.add("handle");
            });
            sliderElement.querySelectorAll<HTMLDivElement>(".noUi-connect").forEach((element) => {
              element.classList.add("range_selected");
            });
          }
        }
      }

    }
    if (partId === "content") {
      // Create Roll Table button
      htmlQuery(htmlElement, "[data-action=create-roll-table]")?.addEventListener("click", () =>
        currentTab.createRollTable(),
      );

      // Add to Roll Table button
      htmlQuery(htmlElement, "[data-action=add-to-roll-table]")?.addEventListener("click", async () => {
        if (game.tables.contents.length === 0) return;
        currentTab.addToRollTable();
      });

      const list = htmlElement as HTMLUListElement;
      list.addEventListener("scroll", () => {
        if (list.scrollTop + list.clientHeight >= list.scrollHeight - 5) {
          const currentValue = currentTab.scrollLimit;
          const maxValue = currentTab.totalItemCount ?? 0;
          if (currentValue < maxValue) {
            currentTab.scrollLimit = Math.clamp(currentValue + 100, 100, maxValue);
            this.#renderResultList({ list, start: currentValue });
          }
        }
      });
    }
  }

  override _onRender(context: foundry.applications.api.ApplicationRenderContext, options: foundry.applications.api.HandlebarsRenderOptions): void {
    super._onRender(context, options);
    
    if(options?.parts?.some(p => ["controls", "content"].includes(p))) {
      this.#renderResultList({ replace: true });
    }
  }

  /**
     * Append new results to the result list
     * @param options Render options
     * @param options.list The result list HTML element
     * @param options.start The index position to start from
     * @param options.replace Replace the current list with the new results?
     */
  async #renderResultList({ list, start = 0, replace = false }: RenderResultListOptions): Promise<void> {
    const currentTab = this.activeTab !== "settings" ? this.compendiumTabs[this.activeTab] : null;
    if (!currentTab) return;
    const html = this.element;

    if (!list) {
      const listElement = html.querySelector<HTMLUListElement>(".window-content ul.item-list.result-list");
      if (!listElement) return;
      list = listElement;
    }

    // Get new results from index
    const newResults = await currentTab.renderResults(start);
    // Add listeners to new results only
    this.#activateResultListeners(newResults);
    // Add the results to the DOM
    const fragment = document.createDocumentFragment();
    fragment.append(...newResults);
    if (replace) {
      list.replaceChildren(fragment);
    } else {
      list.append(fragment);
    }

    // // Re-apply drag drop handler
    // for (const dragDropHandler of this._dragDrop) {
    //   dragDropHandler.bind(html);
    // }
  }

  /** Activate click listeners on loaded actors and items */
  #activateResultListeners(liElements: HTMLLIElement[] = []): void {
    for (const liElement of liElements) {
      const { entryUuid } = liElement.dataset;
      if (!entryUuid) continue;

      const nameAnchor = liElement.querySelector<HTMLAnchorElement>("div.name > a");
      if (nameAnchor) {
        nameAnchor.addEventListener("click", async () => {
          const document = await fromUuid(entryUuid);
          if (document?.sheet) {
            document.sheet.render(true);
          }
        });
      }
    }
  }

  // async #resetInitializedTabs(): Promise<void> {
  //   for (const tab of Object.values(this.compendiumTabs)) {
  //     if (tab.isInitialized) {
  //       await tab.init();
  //       tab.scrollLimit = 100;
  //     }
  //   }
  // }

  #resetFilters(): void {
    const activeTab = this.activeTab;
    if (activeTab !== "settings") {
      this.compendiumTabs[activeTab].resetFilters();
    }
  }

  #clearScrollLimit(render = false): void {
    const tab = this.activeTab;
    if (tab === "settings") return;

    const list = htmlQuery(this.element, "ul.item-list.result-list");
    if (!list) return;
    list.scrollTop = 0;
    this.compendiumTabs[tab].scrollLimit = 100;

    if (render) {
      this.render({ parts: ["controls", "content"] });
    }
  }

  override _onClose(options: foundry.applications.api.HandlebarsRenderOptions): void {
    for (const tab of Object.values(this.compendiumTabs)) {
      tab.filterData.search.text = "";
    }
    super._onClose(options);
  }
}