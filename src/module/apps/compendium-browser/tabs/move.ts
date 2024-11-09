import { grades } from "@module/data/mixins/has-gear-data.ts";
import { ContentTabName } from "../data.ts";
import { CompendiumBrowser } from "../index.ts";
import { CompendiumBrowserTab } from "./base.ts";
import { CompendiumBrowserIndexData, MoveFilters } from "./data.ts";
import { ActionPTR2e, AttackPTR2e, PTRCONSTS } from "@data";
import { unique } from "remeda";

export class CompendiumBrowserMoveTab extends CompendiumBrowserTab {
  tabName: ContentTabName = "move"
  filterData: MoveFilters;
  templatePath = "systems/ptr2e/templates/apps/compendium-browser/tabs/move.hbs";

  override searchFields = ["name", "description"];
  override storeFields = ["type", "name", "img", "uuid", "traits", "description", "category", "grade", "power", "accuracy"];

  constructor(browser: CompendiumBrowser) {
    super(browser);

    // Set the filterData object of this tab
    this.filterData = this.prepareFilterData();
  }

  protected override async loadData(): Promise<void> {
    const debug = (msg: string, ...params: unknown[]) => console.debug(`PTR2e | Compendium Browser | Move Tab | ${msg}`, params);
    debug("Stated loading data");
    const moves: CompendiumBrowserIndexData[] = [];
    const indexFields = ["img", "system.description", "system.traits", "system.actions", "system.grade"];
    const allTraits = new Set<string>();

    for await (const { pack, index } of this.browser.packLoader.loadPacks(
      "Item",
      this.browser.loadedPacks("move"),
      indexFields
    )) {
      debug(`${pack.metadata.label} - ${index.size} entries found`);
      for (const moveData of index) {
        if(moveData.type !== "move") continue;

        moveData.filters = {};

        if (!this.hasAllIndexFields(moveData, ["img", "system.traits", "system.actions", "system.grade"])) {
          console.warn(`PTR2e | Compendium Browser | Move Tab | ${pack.metadata.label} | ${moveData.name} does not have all required data fields.`);
          continue;
        }

        const attack = (() => {
          const attack = moveData.system.actions.find((action: ActionPTR2e) => action.type === "attack") as AttackPTR2e;
          if(!attack) {
            const action = moveData.system.actions[0];
            if(!action) {
              console.warn(`PTR2e | Compendium Browser | Move Tab | ${pack.metadata.label} | ${moveData.name} does not have an action.`);
              return null;
            }
            debug(`${moveData.name} does not have an attack action, but has an action.`);
            return action;
          }
          return attack;
        })() as AttackPTR2e;
        if(!attack) continue;

        const traits = unique<string[]>([...(moveData.system.traits ?? []), ...(attack.traits ?? []), ...(attack.types ?? [])]);

        for(const trait of traits) {
          allTraits.add(trait);
        }

        moves.push({
          name: moveData.name,
          img: moveData.img,
          uuid: moveData.uuid,
          type: moveData.type,
          traits,
          description: moveData.system.description ?? attack.description,
          grade: moveData.system.grade,
          category: attack.category,
          power: attack.power,
          accuracy: attack.accuracy
        })
      }
    }

    // Set Index Data
    this.indexData = moves;

    // Set Filters
    this.filterData.checkboxes.grade.options = this.generateCheckboxOptions(grades.reduce((acc, grade) => {
      acc[grade] = grade;
      return acc;
    }, {} as Record<string, string>));
    this.filterData.selects.category.options = Object.values(PTRCONSTS.Categories).reduce<Record<string, string>>(
      (acc, category) => ({ ...acc, [category]: category }),
      {}
    )
    this.filterData.multiselects.traits.options = this.generateMultiselectOptions(allTraits.reduce((acc, trait) => {
      const traitData = game.ptr.data.traits.get(trait);
      if (!traitData) return acc;
      acc[traitData.slug] = traitData.label;
      return acc;
    }, {} as Record<string, string>));

    debug("Finished loading data");
  }

  protected override filterIndexData(entry: CompendiumBrowserIndexData): boolean {
    const { checkboxes, selects, multiselects, sliders } = this.filterData;

    // Grade
    if(checkboxes.grade.selected.length && !checkboxes.grade.selected.includes(entry.grade)) return false;

    // Category
    if(selects.category.selected.length && selects.category.selected !== entry.category) return false;

    // Power
    if(sliders.power.values.min === 0) {
      if(!(entry.power === undefined || entry.power === null)) {
        if(!(entry.power >= sliders.power.values.min && entry.power <= sliders.power.values.max)) return false;
      }
    }
    else {
      if(!(entry.power >= sliders.power.values.min && entry.power <= sliders.power.values.max)) return false;
    }

    // Accuracy
    if(sliders.accuracy.values.min === 0) {
      if(!(entry.accuracy === undefined || entry.accuracy === null)) {
        if(!(entry.accuracy >= sliders.accuracy.values.min && entry.accuracy <= sliders.accuracy.values.max)) return false;
      }
    }
    else {
      if(!(entry.accuracy >= sliders.accuracy.values.min && entry.accuracy <= sliders.accuracy.values.max)) return false;
    }

    // Traits
    if (!this.filterTraits(entry.traits, multiselects.traits.selected, multiselects.traits.conjunction)) return false;

    return true;
  }

  protected override prepareFilterData(): MoveFilters {
    return {
      checkboxes: {
        grade: {
          label: "PTR2E.CompendiumBrowser.Filters.Grade",
          options: {},
          selected: [],
          isExpanded: false
        }
      },
      selects: {
        category: {
          label: "PTR2E.CompendiumBrowser.Filters.Category",
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
        }
      },
      sliders: {
        power: {
          label: "PTR2E.CompendiumBrowser.Filters.Power",
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
          label: "PTR2E.CompendiumBrowser.Filters.Accuracy",
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