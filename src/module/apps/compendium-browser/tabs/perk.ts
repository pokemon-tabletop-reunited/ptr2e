import { ContentTabName } from "../data.ts";
import { CompendiumBrowser } from "../index.ts";
import { CompendiumBrowserTab } from "./base.ts";
import { PerkFilters, CompendiumBrowserIndexData } from "./data.ts";

export class CompendiumBrowserPerkTab extends CompendiumBrowserTab {
  tabName: ContentTabName = "perk"
  filterData: PerkFilters;
  templatePath = "systems/ptr2e/templates/apps/compendium-browser/tabs/perk.hbs";

  override searchFields = ["name", "description"];
  override storeFields = ["type", "name", "img", "uuid", "traits", "description", "cost"];

  constructor(browser: CompendiumBrowser) {
    super(browser);

    // Set the filterData object of this tab
    this.filterData = this.prepareFilterData();
  }

  protected override async loadData(): Promise<void> {
    const debug = (msg: string, ...params: unknown[]) => console.debug(`PTR2e | Compendium Browser | Perk Tab | ${msg}`, params);
    debug("Stated loading data");
    const perks: CompendiumBrowserIndexData[] = [];
    const indexFields = ["img", "system.description", "system.traits", "system.cost"];
    const traits = new Set<string>();

    for await (const { pack, index } of this.browser.packLoader.loadPacks(
      "Item",
      this.browser.loadedPacks("perk"),
      indexFields
    )) {
      debug(`${pack.metadata.label} - ${index.size} entries found`);
      for (const perkData of index) {
        if(perkData.type !== "perk") continue;

        perkData.filters = {};

        if (!this.hasAllIndexFields(perkData, indexFields)) {
          console.warn(`PTR2e | Compendium Browser | Perk Tab | ${pack.metadata.label} | ${perkData.name} does not have all required data fields.`);
          continue;
        }

        for (const trait of perkData.system.traits ?? []) {
          traits.add(trait);
        }

        perks.push({
          name: perkData.name,
          img: perkData.img,
          uuid: perkData.uuid,
          type: perkData.type,
          traits: perkData.system.traits,
          description: perkData.system.description,
          cost: perkData.system.cost
        })
      }
    }

    // Set Index Data
    this.indexData = perks;

    // Set Filters
    this.filterData.multiselects.traits.options = this.generateMultiselectOptions(traits.reduce((acc, trait) => {
      const traitData = game.ptr.data.traits.get(trait);
      if (!traitData) return acc;
      acc[traitData.slug] = traitData.label;
      return acc;
    }, {} as Record<string, string>));

    debug("Finished loading data");
  }

  protected override filterIndexData(entry: CompendiumBrowserIndexData): boolean {
    const { multiselects, sliders } = this.filterData;

    // Cost
    if(!(entry.cost >= sliders.apCost.values.min && entry.cost <= sliders.apCost.values.max)) return false;

    // Traits
    if (!this.filterTraits(entry.traits, multiselects.traits.selected, multiselects.traits.conjunction)) return false;

    return true;
  }

  protected override prepareFilterData(): PerkFilters {
    return {
      multiselects: {
        traits: {
          conjunction: "and",
          label: "PTR2E.CompendiumBrowser.Filters.Traits",
          options: [],
          selected: []
        }
      },
      sliders: {
        apCost: {
          isExpanded: false,
          values: {
            lowerLimit: 0,
            upperLimit: 10,
            min: 0,
            max: 10,
            step: 1
          },
          label: "PTR2E.CompendiumBrowser.Filters.ApCost",
        }
      },
      order: {
        by: "name",
        direction: "asc",
        options: {
          name: "PTR2E.CompendiumBrowser.Filters.Sort.Name",
        }
      },
      search: {
        text: ""
      }
    }
  }
}