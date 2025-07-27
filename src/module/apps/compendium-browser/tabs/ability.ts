import { ContentTabName } from "../data.ts";
import { CompendiumBrowser } from "../index.ts";
import { CompendiumBrowserTab } from "./base.ts";
import { AbilityFilters, CompendiumBrowserIndexData } from "./data.ts";

export class CompendiumBrowserAbilityTab extends CompendiumBrowserTab {
  tabName: ContentTabName = "ability"
  filterData: AbilityFilters;
  templatePath = "systems/ptr2e/templates/apps/compendium-browser/tabs/ability.hbs";
  
  override searchFields = ["name", "description"];
  override storeFields = ["type", "name", "img", "uuid", "traits", "description", "source"]

  constructor(browser: CompendiumBrowser) {
    super(browser);

    // Set the filterData object of this tab
    this.filterData = this.prepareFilterData();
  }

  protected override async loadData(): Promise<void> {
    const debug = (msg: string, ...params: unknown[]) => console.debug(`PTR2e | Compendium Browser | Ability Tab | ${msg}`, params);
    debug("Stated loading data");
    const abilities: CompendiumBrowserIndexData[] = [];
    const indexFields = ["img", "system.description", "system.traits"];
    const traits = new Set<string>();
    const publications = new Set<string>();

    for await(const {pack, index} of this.browser.packLoader.loadPacks(
      "Item",
      this.browser.loadedPacks("ability"),
      indexFields
    )) {
      debug(`${pack.metadata.label} - ${index.size} entries found`);
      for(const abilityData of index) {
        if(abilityData.type !== "ability") continue;

        abilityData.filters = {};

        if(!this.hasAllIndexFields(abilityData, indexFields)) {
          console.warn(`PTR2e | Compendium Browser | Ability Tab | ${pack.metadata.label} | ${abilityData.name} does not have all required data fields.`);
          continue;
        }

        for(const trait of abilityData.system.traits ?? []) {
          traits.add(trait);
        }

        const pubSource = (abilityData.system.publication?.source ?? "").trim()
        if(pubSource) publications.add(pubSource);

        abilities.push({
          name: abilityData.name,
          img: abilityData.img,
          uuid: abilityData.uuid,
          type: abilityData.type,
          traits: abilityData.system.traits,
          description: abilityData.system.description,
          source: pubSource
        })
      }
    }

    // Set Index Data
    this.indexData = abilities;

    // Set Filters
    this.filterData.multiselects.traits.options = this.generateMultiselectOptions(traits.reduce((acc, trait) => {
      const traitData = game.ptr.data.traits.getTrait(trait);
      if (!traitData) return acc;
      acc[traitData.slug] = traitData.label;
      return acc;
    }, {} as Record<string, string>));

    this.filterData.checkboxes.source.options = this.generateCheckboxOptions(publications.reduce((acc, source) => ({[source]: source, ...acc}), {} as Record<string, string>));

    debug("Finished loading data");
  }

  protected override filterIndexData(entry: CompendiumBrowserIndexData): boolean {
    const { checkboxes, multiselects } = this.filterData;

    if(!this.filterTraits(entry.traits, multiselects.traits.selected, multiselects.traits.conjunction)) return false;

    // Source
    if (checkboxes.source.selected.length) {
      if (!checkboxes.source.selected.includes(entry.source)) return false;
    }

    return true;
  }

  protected override prepareFilterData(): AbilityFilters {
    return {
      checkboxes: {
        source: {
          isExpanded: false,
          label: "PTR2E.CompendiumBrowser.Filters.Source",
          options: {},
          selected: [],
        }
      },
      multiselects: {
        traits: {
          conjunction: "and",
          label: "PTR2E.CompendiumBrowser.Filters.Traits",
          options: [],
          selected: []
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