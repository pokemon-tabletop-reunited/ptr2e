import { ContentTabName } from "../data.ts";
import { CompendiumBrowser } from "../index.ts";
import { CompendiumBrowserTab } from "./base.ts";
import { SpeciesFilters, CompendiumBrowserIndexData } from "./data.ts";
import * as R from "remeda";
import { formatSlug, ImageResolver, sluggify } from "@utils";
import SkillPTR2e from "@module/data/models/skill.ts";

export class CompendiumBrowserSpeciesTab extends CompendiumBrowserTab {
  tabName: ContentTabName = "species"
  filterData: SpeciesFilters;
  templatePath = "systems/ptr2e/templates/apps/compendium-browser/tabs/species.hbs";
  override scrollLimit = 50;

  override searchFields = ["name", "number"];
  override storeFields = ["type", "name", "img", "uuid", "number", "traits", "skills", "eggGroups", "moves"];

  constructor(browser: CompendiumBrowser) {
    super(browser);

    // Set the filterData object of this tab
    this.filterData = this.prepareFilterData();
  }

  protected override async loadData(): Promise<void> {
    const debug = (msg: string, ...params: unknown[]) => console.debug(`PTR2e | Compendium Browser | Species Tab | ${msg}`, params);
    debug("Stated loading data");
    const species: CompendiumBrowserIndexData[] = [];
    const indexFields = ["img", "system.number", "system.types", "system.traits", "system.moves", "system.skills", "system.eggGroups", "system.form"];
    const eggGroups = new Set<string>();
    const allTraits = new Set<string>();

    for await (const { pack, index } of this.browser.packLoader.loadPacks(
      "Item",
      this.browser.loadedPacks("species"),
      indexFields
    )) {
      debug(`${pack.metadata.label} - ${index.size} entries found`);
      for (const speciesData of index) {
        if (speciesData.type !== "species") continue;

        speciesData.filters = {};

        if (!this.hasAllIndexFields(speciesData, ["img", "system.number", "system.types", "system.traits", "system.moves", "system.skills", "system.eggGroups"])) {
          console.warn(`PTR2e | Compendium Browser | Species Tab | ${pack.metadata.label} | ${speciesData.name} does not have all required data fields.`);
          continue;
        }

        for (const eggGroup of speciesData.system.eggGroups ?? []) {
          eggGroups.add(eggGroup);
        }

        const traits = R.unique<string[]>([...(speciesData.system.traits ?? []), ...(speciesData.system.types ?? [])]);

        for (const trait of traits) {
          allTraits.add(trait);
        }

        species.push({
          name: speciesData.name,
          img: speciesData.img,
          uuid: speciesData.uuid,
          type: speciesData.type,
          traits,
          number: speciesData.system.number,
          skills: speciesData.system.skills ? R.fromEntries(speciesData.system.skills.map((skill: SkillPTR2e) => [skill.slug, skill.value])) : [],
          eggGroups: speciesData.system.eggGroups,
          moves: speciesData.system.moves
        })
      }
    }

    // Set Index Data
    this.indexData = species;

    // Set Filters
    this.filterData.selects.loadSpeciesImages.options = {
      // no: game.i18n.localize("PTR2E.CompendiumBrowser.Filters.LoadSpeciesImages.No"),
      yes: game.i18n.localize("PTR2E.CompendiumBrowser.Filters.LoadSpeciesImages.Yes")
    }
    this.filterData.checkboxes.skills.options = this.generateCheckboxOptions(game.ptr.data.skills.reduce((acc, skill) => {
      acc[skill.slug] = formatSlug(skill.slug);
      return acc;
    }, {} as Record<string, string>));
    this.filterData.multiselects.eggGroups.options = this.generateMultiselectOptions(Array.from(eggGroups).reduce((acc, eggGroup) => {
      acc[eggGroup] = formatSlug(eggGroup);
      return acc;
    }, {} as Record<string, string>));
    this.filterData.multiselects.traits.options = this.generateMultiselectOptions(allTraits.reduce((acc, trait) => {
      const traitData = game.ptr.data.traits.get(trait);
      if (!traitData) return acc;
      acc[traitData.slug] = traitData.label;
      return acc;
    }, {} as Record<string, string>));

    debug("Finished loading data");
  }

  override renderResults(start: number): Promise<HTMLLIElement[]> {
    return super.renderResults(start, async (entries) => {
      if(this.filterData.selects.loadSpeciesImages.selected !== "yes") return entries;
      return await Promise.all(
        entries.map(async (entry) => {
          const img = await (async () => {
            if (!["icons/svg/mystery-man.svg", "systems/ptr2e/img/icons/species_icon.webp"].includes(entry.img)) return entry.img;
            const config = game.ptr.data.artMap.get(sluggify(entry.name));
            if (!config) return entry.img;
            const resolver = await ImageResolver.createFromSpeciesData(
              {
                dexId: entry.number,
                shiny: false,
                forms: entry.form ? [entry.form] : [],
              },
              config
            );
            return resolver?.result || entry.img || "icons/svg/mystery-man.svg";
          })();
          return {
            ...entry,
            img
          }
        }));
    });
  }

  protected override filterIndexData(entry: CompendiumBrowserIndexData): boolean {
    const { checkboxes, multiselects } = this.filterData;

    // Skills
    if (!checkboxes.skills.selected.every(skill => !!entry.skills[skill])) return false;

    // Egg Groups
    if (!this.filterTraits(entry.eggGroups, multiselects.eggGroups.selected, multiselects.eggGroups.conjunction)) return false;

    // Traits
    if (!this.filterTraits(entry.traits, multiselects.traits.selected, multiselects.traits.conjunction)) return false;

    return true;
  }

  protected override prepareFilterData(): SpeciesFilters {
    return {
      checkboxes: {
        skills: {
          label: "PTR2E.CompendiumBrowser.Filters.Skills",
          options: {},
          selected: [],
          isExpanded: false
        }
      },
      selects: {
        loadSpeciesImages: {
          label: "PTR2E.CompendiumBrowser.Filters.LoadSpeciesImages.Label",
          options: {},
          selected: ""
        }
      },
      multiselects: {
        traits: {
          conjunction: "and",
          label: "PTR2E.CompendiumBrowser.Filters.Traits",
          options: [],
          selected: []
        },
        eggGroups: {
          conjunction: "and",
          label: "PTR2E.CompendiumBrowser.Filters.EggGroups",
          options: [],
          selected: []
        }
      },
      order: {
        by: "name",
        direction: "asc",
        options: {
          name: "PTR2E.CompendiumBrowser.Filters.Sort.Name",
          number: "PTR2E.CompendiumBrowser.Filters.Sort.Number"
        }
      },
      search: {
        text: ""
      }
    }
  }
}