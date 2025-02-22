import { grades } from "@module/data/mixins/has-gear-data.ts";
import { ContentTabName } from "../data.ts";
import { CompendiumBrowser } from "../index.ts";
import { CompendiumBrowserTab } from "./base.ts";
import { CompendiumBrowserIndexData, GearFilters } from "./data.ts";
import { formatSlug } from "@utils";

export class CompendiumBrowserGearTab extends CompendiumBrowserTab {
  tabName: ContentTabName = "gear"
  filterData: GearFilters;
  templatePath = "systems/ptr2e/templates/apps/compendium-browser/tabs/gear.hbs";

  override searchFields = ["name", "description"];
  override storeFields = ["type", "name", "img", "uuid", "traits", "description", "rarity", "grade", "cost", "fling", "slot"];

  constructor(browser: CompendiumBrowser) {
    super(browser);

    // Set the filterData object of this tab
    this.filterData = this.prepareFilterData();
  }

  protected override async loadData(): Promise<void> {
    const debug = (msg: string, ...params: unknown[]) => console.debug(`PTR2e | Compendium Browser | Gear Tab | ${msg}`, params);
    debug("Stated loading data");
    const gear: CompendiumBrowserIndexData[] = [];
    const indexFields = ["img", "system.description", "system.traits", "system.rarity", "system.grade", "system.cost", "system.fling", "system.equipped.slot"];
    const traits = new Set<string>();
    const flingTypes = new Set<string>();
    let highestIpCost = 10;

    for await (const { pack, index } of this.browser.packLoader.loadPacks(
      "Item",
      this.browser.loadedPacks("gear"),
      indexFields
    )) {
      debug(`${pack.metadata.label} - ${index.size} entries found`);
      for (const gearData of index) {
        if (!["consumable", "equipment", "gear", "weapon"].includes(gearData.type)) continue;

        gearData.filters = {};

        if (!this.hasAllIndexFields(gearData, ["img", "system.description", "system.traits", "system.rarity", "system.grade"])) {
          console.warn(`PTR2e | Compendium Browser | Gear Tab | ${pack.metadata.label} | ${gearData.name} does not have all required data fields.`);
          continue;
        }

        for (const trait of gearData.system.traits ?? []) {
          traits.add(trait);
        }
        if(gearData.system.cost > highestIpCost) highestIpCost = gearData.system.cost;

        if(gearData.system.fling?.type) {
          flingTypes.add(gearData.system.fling.type);
        }

        gear.push({
          name: gearData.name,
          img: gearData.img,
          uuid: gearData.uuid,
          type: gearData.type,
          traits: gearData.system.traits,
          description: gearData.system.description,
          rarity: gearData.system.rarity,
          grade: gearData.system.grade,
          cost: gearData.system.cost,
          fling: gearData.system.fling,
          slot: gearData.system.equipped?.slot
        })
      }
    }

    // Set Index Data
    this.indexData = gear;

    // Set Filters
    this.filterData.checkboxes.type.options = this.generateCheckboxOptions({
      "consumable": "TYPES.Item.consumable",
      "equipment": "TYPES.Item.equipment",
      "gear": "TYPES.Item.gear",
      "weapon": "TYPES.Item.weapon"
    });
    this.filterData.checkboxes.rarity.options = this.generateCheckboxOptions({
      common: "PTR2E.FIELDS.gear.rarity.common",
      uncommon: "PTR2E.FIELDS.gear.rarity.uncommon",
      rare: "PTR2E.FIELDS.gear.rarity.rare",
      unique: "PTR2E.FIELDS.gear.rarity.unique"
    });
    this.filterData.checkboxes.grade.options = this.generateCheckboxOptions(grades.reduce((acc, grade) => {
      acc[grade] = grade;
      return acc;
    }, {} as Record<string, string>));
    this.filterData.checkboxes.flingType.options = this.generateCheckboxOptions(flingTypes.reduce((acc, type) => {
      acc[type] = formatSlug(type);
      return acc;
    }, {} as Record<string, string>));
    this.filterData.checkboxes.carrySlot.options = this.generateCheckboxOptions({
      held: "PTR2E.FIELDS.gear.equipped.slot.held",
      worn: "PTR2E.FIELDS.gear.equipped.slot.worn",
      accessory: "PTR2E.FIELDS.gear.equipped.slot.accessory",
      belt: "PTR2E.FIELDS.gear.equipped.slot.belt",
      backpack: "PTR2E.FIELDS.gear.equipped.slot.backpack"
    });
    this.filterData.multiselects.traits.options = this.generateMultiselectOptions(traits.reduce((acc, trait) => {
      const traitData = game.ptr.data.traits.get(trait);
      if (!traitData) return acc;
      acc[traitData.slug] = traitData.label;
      return acc;
    }, {} as Record<string, string>));
    this.filterData.sliders.cost.values.upperLimit = this.filterData.sliders.cost.values.max = highestIpCost;

    debug("Finished loading data");
  }

  protected override filterIndexData(entry: CompendiumBrowserIndexData): boolean {
    const { checkboxes, multiselects, sliders } = this.filterData;

    // Gear Type
    if(checkboxes.type.selected.length && !checkboxes.type.selected.includes(entry.type)) return false;

    // Rarity
    if(checkboxes.rarity.selected.length && !checkboxes.rarity.selected.includes(entry.rarity)) return false;

    // Grade
    if(checkboxes.grade.selected.length && !checkboxes.grade.selected.includes(entry.grade)) return false;

    // Cost
    if(sliders.cost.values.min === 0) {
      if(!(entry.cost === undefined || entry.cost === null)) {
        if(!(entry.cost >= sliders.cost.values.min && entry.cost <= sliders.cost.values.max)) return false;
      }
    }
    else {
      if(!(entry.cost >= sliders.cost.values.min && entry.cost <= sliders.cost.values.max)) return false;
    }

    // Fling Type
    if(checkboxes.flingType.selected.length && !checkboxes.flingType.selected.includes(entry.fling?.type)) return false;

    // Fling Power
    if(sliders.power.values.min === 0) {
      if(!(entry.fling?.power === undefined || entry.fling?.power === null)) {
        if(!(entry.fling?.power >= sliders.power.values.min && entry.fling?.power <= sliders.power.values.max)) return false;
      }
    }
    else {
      if(!(entry.fling?.power >= sliders.power.values.min && entry.fling?.power <= sliders.power.values.max)) return false;
    }

    // Fling Accuracy
    if(sliders.accuracy.values.min === 0) {
      if(!(entry.fling?.accuracy === undefined || entry.fling?.accuracy === null)) {
        if(!(entry.fling?.accuracy >= sliders.accuracy.values.min && entry.fling?.accuracy <= sliders.accuracy.values.max)) return false;
      }
    }
    else {
      if(!(entry.fling?.accuracy >= sliders.accuracy.values.min && entry.fling?.accuracy <= sliders.accuracy.values.max)) return false;
    }

    // Traits
    if (!this.filterTraits(entry.traits, multiselects.traits.selected, multiselects.traits.conjunction)) return false;

    return true;
  }

  protected override prepareFilterData(): GearFilters {
    return {
      checkboxes: {
        type: {
          label: "PTR2E.CompendiumBrowser.Filters.Type",
          options: {},
          selected: [],
          isExpanded: true
        },
        rarity: {
          label: "PTR2E.CompendiumBrowser.Filters.Rarity",
          options: {},
          selected: [],
          isExpanded: false
        },
        grade: {
          label: "PTR2E.CompendiumBrowser.Filters.Grade",
          options: {},
          selected: [],
          isExpanded: false
        },
        carrySlot: {
          label: "PTR2E.CompendiumBrowser.Filters.CarrySlot",
          options: {},
          selected: [],
          isExpanded: false
        },
        flingType: {
          label: "PTR2E.CompendiumBrowser.Filters.FlingType",
          options: {},
          selected: [],
          isExpanded: false
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
      sliders: {
        cost: {
          label: "PTR2E.CompendiumBrowser.Filters.Cost",
          isExpanded: false,
          values: {
            lowerLimit: 0,
            upperLimit: 12,
            min: 0,
            max: 12,
            step: 1
          }
        },
        power: {
          label: "PTR2E.CompendiumBrowser.Filters.FlingPower",
          isExpanded: false,
          values: {
            lowerLimit: 0,
            upperLimit: 250,
            min: 0,
            max: 250,
            step: 5
          }
        },
        accuracy: {
          label: "PTR2E.CompendiumBrowser.Filters.FlingAccuracy",
          isExpanded: false,
          values: {
            lowerLimit: 0,
            upperLimit: 100,
            min: 0,
            max: 100,
            step: 5
          }
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