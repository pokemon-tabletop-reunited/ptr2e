import { SearchResult } from "minisearch";
import { SortDirection } from "../data.ts";

type CheckboxOptions = Record<string, { label: string; selected: boolean }>;
interface CheckboxData {
  isExpanded: boolean;
  label: string;
  options: CheckboxOptions;
  selected: string[];
}

interface MultiselectData<T extends string = string> {
  label: string;
  conjunction: "and" | "or";
  options: { label: string; value: T }[];
  selected: { label: string; not?: boolean; value: T }[];
}

interface SelectData {
  label: string;
  options: Record<string, string>;
  selected: string;
}

interface OrderData {
  by: string;
  direction: SortDirection;
  /** The key must be present as an index key in the database */
  options: Record<string, string>;
}

interface RangesInputData {
  changed: boolean;
  isExpanded: boolean;
  values: {
    min: number;
    max: number;
    inputMin: string;
    inputMax: string;
  };
  label: string;
}

interface SliderData {
  isExpanded: boolean;
  values: {
    lowerLimit: number;
    upperLimit: number;
    min: number;
    max: number;
    step: number;
  };
  label: string;
}

interface BaseFilterData {
  order: OrderData;
  search: {
    text: string;
  };
}

interface AbilityFilters extends BaseFilterData {
  multiselects: {
    traits: MultiselectData<string>;
  };
}

interface GearFilters extends BaseFilterData {
  checkboxes: Record<"type" | "rarity" | "grade" | "flingType" | "carrySlot", CheckboxData>;
  multiselects: {
    traits: MultiselectData<string>;
  };
  sliders: {
    cost: SliderData;
    power: SliderData;
    accuracy: SliderData;
  };
}

interface MoveFilters extends BaseFilterData {
  checkboxes: Record<"grade" | "target", CheckboxData>;
  selects: Record<"category" | "cost", SelectData>;
  multiselects: {
    traits: MultiselectData<string>;
  };
  sliders: Record<"power" | "accuracy" | "range", SliderData>;
}

interface PerkFilters extends BaseFilterData {
  multiselects: {
    traits: MultiselectData<string>;
    prerequisites: MultiselectData<string>;
  };
  sliders: {
    apCost: SliderData;
  };
}

interface SpeciesFilters extends BaseFilterData {
  selects: Record<"loadSpeciesImages", SelectData>;
  checkboxes: Record<"skills", CheckboxData>;
  multiselects: Record<"traits" | "eggGroups" | "levelUpMoves" | "tutorMoves", MultiselectData<string>>;
  // ranges: Record<"baseStatTotal", RangesInputData>;
  // sliders: Record<"height" | "weight", SliderData>;
}


type BrowserFilter =
  | AbilityFilters
  | GearFilters
  | MoveFilters
  | PerkFilters
  | SpeciesFilters;

type CompendiumBrowserIndexData = Omit<CompendiumIndexData, "_id"> & Partial<SearchResult>;

interface RenderResultListOptions {
  list?: HTMLUListElement;
  start?: number;
  replace?: boolean;
}

export type {
  BaseFilterData,
  BrowserFilter,
  CheckboxData,
  CheckboxOptions,
  CompendiumBrowserIndexData,
  MultiselectData,
  RangesInputData,
  RenderResultListOptions,
  SelectData,
  SliderData,
  AbilityFilters,
  GearFilters,
  MoveFilters,
  PerkFilters,
  SpeciesFilters
};