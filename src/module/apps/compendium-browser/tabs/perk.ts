import { sluggify } from "@utils";
import { ContentTabName } from "../data.ts";
import { CompendiumBrowser } from "../index.ts";
import { CompendiumBrowserTab } from "./base.ts";
import { PerkFilters, CompendiumBrowserIndexData } from "./data.ts";

export class CompendiumBrowserPerkTab extends CompendiumBrowserTab {
  tabName: ContentTabName = "perk"
  filterData: PerkFilters;
  templatePath = "systems/ptr2e/templates/apps/compendium-browser/tabs/perk.hbs";

  override searchFields = ["name", "description", "prerequisites"];
  override storeFields = ["type", "name", "img", "uuid", "traits", "description", "cost", "prerequisites", "global", "source", "archetype"];

  constructor(browser: CompendiumBrowser) {
    super(browser);

    // Set the filterData object of this tab
    this.filterData = this.prepareFilterData();
  }

  public override async loadData(): Promise<void> {
    const debug = (msg: string, ...params: unknown[]) => console.debug(`PTR2e | Compendium Browser | Perk Tab | ${msg}`, params);
    debug("Stated loading data");
    const perks: CompendiumBrowserIndexData[] = [];
    const indexFields = ["img", "system.description", "system.traits", "system.cost", "system.prerequisites", "system.global", "system.nodes", "system.design.archetype"];
    const traits = new Set<string>();
    const prerequisites = new Set<string>();
    const publications = new Set<string>();
    const archetypes = new Set<string>();

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

        for(const prereq of perkData.system.prerequisites ?? []) {
          prerequisites.add(prereq);
        }

        const pubSource = (perkData.system.publication?.source ?? "").trim()
        if(pubSource) publications.add(pubSource);

        const archetype = perkData.system.design?.archetype ? sluggify(perkData.system.design.archetype) : null;
        if(archetype) {
          archetypes.add(archetype);
        }

        perks.push({
          name: perkData.name,
          img: perkData.img,
          uuid: perkData.uuid,
          type: perkData.type,
          traits: perkData.system.traits,
          description: perkData.system.description,
          cost: perkData.system.cost,
          prerequisites: perkData.system.prerequisites ?? [],
          global: perkData.system.global ? (perkData.system.nodes?.[0]?.x && perkData.system.nodes?.[0]?.y) : false,
          source: pubSource,
          archetype: archetype ? [archetype] : [],
        })
      }
    }

    // Set Index Data
    this.indexData = perks;

    // Set Filters
    this.filterData.selects.showOnlyOnWeb.options = {
      yes: game.i18n.localize("PTR2E.CompendiumBrowser.Filters.ShowOnlyOnWeb.Yes")
    }

    this.filterData.multiselects.traits.options = this.generateMultiselectOptions(traits.reduce((acc, trait) => {
      const traitData = game.ptr.data.traits.getTrait(trait);
      if (!traitData) return acc;
      acc[traitData.slug] = traitData.label;
      return acc;
    }, {} as Record<string, string>));
    this.filterData.multiselects.archetypes.options = this.generateMultiselectOptions(archetypes.reduce((acc, archetype) => {
      acc[archetype] = Handlebars.helpers.formatSlug(archetype);
      return acc;
    }, {} as Record<string, string>));
    // this.filterData.multiselects.prerequisites.options = this.generateMultiselectOptions(prerequisites.reduce((acc, prereq) => ({...acc, [prereq]: prereq}), {} as Record<string, string>));

    this.filterData.checkboxes.source.options = this.generateCheckboxOptions(publications.reduce((acc, source) => ({[source]: source, ...acc}), {} as Record<string, string>));

    debug("Finished loading data");
  }

  protected override filterIndexData(entry: CompendiumBrowserIndexData): boolean {
    const { selects, checkboxes, multiselects, sliders } = this.filterData;

    // Filter out perks not on web
    if(selects.showOnlyOnWeb.selected === "yes" && !entry.global) return false;

    // Cost
    if(!(entry.cost >= sliders.apCost.values.min && entry.cost <= sliders.apCost.values.max)) return false;

    // Traits
    if (!this.filterTraits(entry.traits, multiselects.traits.selected, multiselects.traits.conjunction)) return false;

    // Archetypes
    if (!this.filterTraits(entry.archetype, multiselects.archetypes.selected, multiselects.archetypes.conjunction)) return false;

    // Prerequisites
    // if (!this.filterTraits(entry.prerequisites, multiselects.prerequisites.selected, multiselects.prerequisites.conjunction)) return false;

    // Source
    if (checkboxes.source.selected.length) {
      if (!checkboxes.source.selected.includes(entry.source)) return false;
    }

    return true;
  }

  protected override prepareFilterData(): PerkFilters {
    return {
      selects: {
        showOnlyOnWeb: {
          label: "PTR2E.CompendiumBrowser.Filters.ShowOnlyOnWeb.Label",
          options: {},
          selected: ""
        }
      },
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
        },
        archetypes: {
          conjunction: "and",
          label: "PTR2E.CompendiumBrowser.Filters.Archetypes",
          options: [],
          selected: []
        },
        // prerequisites: {
        //   conjunction: "and",
        //   label: "PTR2E.CompendiumBrowser.Filters.Prerequisites",
        //   options: [],
        //   selected: []
        // }
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