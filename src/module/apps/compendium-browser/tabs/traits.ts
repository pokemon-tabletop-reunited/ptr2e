import { ContentTabName } from "../data.ts";
import { CompendiumBrowser } from "../index.ts";
import { CompendiumBrowserTab } from "./base.ts";
import { CompendiumBrowserIndexData, TraitsFilters } from "./data.ts";

export class CompendiumBrowserTraitsTab extends CompendiumBrowserTab {
  tabName: ContentTabName = "traits"
  filterData: TraitsFilters;
  templatePath = "systems/ptr2e/templates/apps/compendium-browser/tabs/traits.hbs";

  override searchFields = ["name", "description"];
  override storeFields = ["name", "slug", "description", "type"];

  constructor(browser: CompendiumBrowser) {
    super(browser);

    // Set the filterData object of this tab
    this.filterData = this.prepareFilterData();
  }

  public override async loadData(): Promise<void> {
    const debug = (msg: string, ...params: unknown[]) => console.debug(`PTR2e | Compendium Browser | Perk Tab | ${msg}`, params);
    debug("Stated loading data");
    const traits: CompendiumBrowserIndexData[] = [];

    for(const trait of game.ptr.data.traits) {
      traits.push({
        name: trait.label,
        slug: trait.slug,
        uuid: trait.slug,
        description: trait.description,
        type: trait.type || "untyped"
      })
    }

    // Set Index Data
    this.indexData = traits;

    this.filterData.multiselects.type.options = this.generateMultiselectOptions(
      {
        untyped: "PTR2E.CompendiumBrowser.Filters.TraitType.Untyped",
        automated: "PTR2E.CompendiumBrowser.Filters.TraitType.Automated",
        narrative: "PTR2E.CompendiumBrowser.Filters.TraitType.Narrative",
      }
    )

    debug("Finished loading data");
  }

  override renderResults(start: number): Promise<HTMLLIElement[]> {
    return super.renderResults(start, async (entries) => {
      return await Promise.all(
        entries.map(async (entry) => {
          return {
            ...entry,
            description: await TextEditor.enrichHTML(entry.description)
          }
        }));
    });
  }

  protected override filterIndexData(entry: CompendiumBrowserIndexData): boolean {
    // Trait Type
    if(!this.filterTraits([entry.type], this.filterData.multiselects.type.selected, this.filterData.multiselects.type.conjunction)) return false;

    return true;
  }

  protected override prepareFilterData(): TraitsFilters {
    return {
      multiselects: {
        type: {
          conjunction: "or",
          label: "PTR2E.CompendiumBrowser.Filters.TraitType.Label",
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