import type { ContentTabName } from "../data.ts";
import type { CompendiumBrowser } from "../index.ts";
import { CompendiumBrowserTab } from "./base.ts";
import type { CompendiumBrowserIndexData, CompendiumIndexData, MoveFilters } from "./data.ts";
import { PTRCONSTS } from "@data";
import { unique } from "remeda";
import { formatSlug } from "@utils";

export class CompendiumBrowserMoveTab extends CompendiumBrowserTab {
  tabName: ContentTabName = "move"
  filterData: MoveFilters;
  templatePath = "systems/ptr2e/templates/apps/compendium-browser/tabs/move.hbs";

  override searchFields = ["name", "description"];
  override storeFields = ["type", "name", "img", "uuid", "traits", "description", "category", "grade", "power", "accuracy", "types", "cost", "range", "target"];

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
    let maxRange = 10;

    for await (const { pack, index } of this.browser.packLoader.loadPacks(
      "Item",
      this.browser.loadedPacks("move"),
      indexFields
    )) {
      debug(`${pack.metadata.label} - ${index.size} entries found`);
      for (const moveData of index as unknown as (PTR.Item.System.Move.ParentSource & CompendiumIndexData)[]) {
        if (moveData.type !== "move") continue;

        moveData.filters = {};

        if (!this.hasAllIndexFields(moveData, ["img", "system.traits", "system.actions", "system.grade"])) {
          console.warn(`PTR2e | Compendium Browser | Move Tab | ${pack.metadata.label} | ${moveData.name} does not have all required data fields.`);
          continue;
        }

        const attack = (() => {
          const attack = moveData.system.actions?.find((action: PTR.Models.Action.Source) => action.type === "attack") as PTR.Models.Action.Models.Attack.Source;
          if (!attack) {
            const action = moveData.system.actions![0];
            if (!action) {
              console.warn(`PTR2e | Compendium Browser | Move Tab | ${pack.metadata.label} | ${moveData.name} does not have an action.`);
              return null;
            }
            debug(`${moveData.name} does not have an attack action, but has an action.`);
            return action;
          }
          return attack;
        })() as PTR.Models.Action.Models.Attack.Source;
        if (!attack) continue;

        const traits = unique<string[]>([...(moveData.system.traits ?? []), ...(attack.traits ?? []), ...(attack.types ?? [])]);

        for (const trait of traits) {
          allTraits.add(trait);
        }

        if (!isNaN(Number(attack.range?.distance))) {
          maxRange = Math.max(maxRange, Number(attack.range!.distance));
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
          accuracy: attack.accuracy,
          types: attack.types ?? [],
          range: Number(attack.range?.distance) || null,
          target: attack.range?.target,
          cost: attack.cost?.activation
        })
      }
    }

    // Set Index Data
    this.indexData = moves;

    // Set Filters
    this.filterData.checkboxes.grade.options = this.generateCheckboxOptions(PTRCONSTS.Grades.reduce((acc, grade) => {
      acc[grade] = grade;
      return acc;
    }, {} as Record<string, string>));
    this.filterData.checkboxes.target.options = this.generateCheckboxOptions(Object.values(PTRCONSTS.TargetOptions).reduce<Record<string, string>>((acc, target) => ({ ...acc, [target]: formatSlug(target) }), {}));
    this.filterData.selects.category.options = Object.values(PTRCONSTS.Categories).reduce<Record<string, string>>(
      (acc, category) => ({ ...acc, [category]: category }),
      {}
    )
    this.filterData.selects.cost.options = {
      "simple": game.i18n.localize("PTR2E.CompendiumBrowser.Filters.ActionCost.Simple"),
      "complex": game.i18n.localize("PTR2E.CompendiumBrowser.Filters.ActionCost.Complex"),
      "free": game.i18n.localize("PTR2E.CompendiumBrowser.Filters.ActionCost.Free")
    }
    this.filterData.multiselects.traits.options = this.generateMultiselectOptions(allTraits.reduce((acc, trait) => {
      const traitData = game.ptr.data.traits.get(trait);
      if (!traitData) return acc;
      acc[traitData.slug] = traitData.label;
      return acc;
    }, {} as Record<string, string>));
    this.filterData.sliders.range.values.upperLimit = this.filterData.sliders.range.values.max = maxRange;

    debug("Finished loading data");
  }

  protected override filterIndexData(entry: CompendiumBrowserIndexData): boolean {
    const { checkboxes, selects, multiselects, sliders } = this.filterData;

    // Grade
    if (checkboxes.grade.selected.length && !checkboxes.grade.selected.includes(entry.grade)) return false;

    // Category
    if (selects.category.selected.length && selects.category.selected !== entry.category) return false;

    // Cost
    if (selects.cost.selected.length && selects.cost.selected !== entry.cost) return false;

    // Target
    if (checkboxes.target.selected.length && !checkboxes.target.selected.includes(entry.target)) return false;

    // Power
    if (sliders.power.values.min === 0) {
      if (!(entry.power === undefined || entry.power === null)) {
        if (!(entry.power >= sliders.power.values.min && entry.power <= sliders.power.values.max)) return false;
      }
    }
    else {
      if (!(entry.power >= sliders.power.values.min && entry.power <= sliders.power.values.max)) return false;
    }

    // Accuracy
    if (sliders.accuracy.values.min === 0) {
      if (!(entry.accuracy === undefined || entry.accuracy === null)) {
        if (!(entry.accuracy >= sliders.accuracy.values.min && entry.accuracy <= sliders.accuracy.values.max)) return false;
      }
    }
    else {
      if (!(entry.accuracy >= sliders.accuracy.values.min && entry.accuracy <= sliders.accuracy.values.max)) return false;
    }

    // Range
    if (sliders.range.values.min === 0) {
      if (!(entry.range === undefined || entry.range === null)) {
        if (!(entry.range >= sliders.range.values.min && entry.range <= sliders.range.values.max)) return false;
      }
    }
    else {
      if (!(entry.range >= sliders.range.values.min && entry.range <= sliders.range.values.max)) return false;
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
        },
        target: {
          label: "PTR2E.CompendiumBrowser.Filters.Target",
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
        },
        cost: {
          label: "PTR2E.CompendiumBrowser.Filters.ActionCost.Label",
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
        },
        range: {
          label: "PTR2E.CompendiumBrowser.Filters.Range",
          isExpanded: false,
          values: {
            lowerLimit: 0,
            upperLimit: 10,
            min: 0,
            max: 10,
            step: 1
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