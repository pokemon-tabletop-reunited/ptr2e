import * as browserTabs from "./tabs/index.ts";

interface PackInfo {
  load: boolean;
  name: string;
  package: string;
}

interface SourceInfo {
  load: boolean;
  name: string;
}

interface BrowserTabs {
  ability: browserTabs.Abilities;
  gear: browserTabs.Gear;
  move: browserTabs.Moves;
  perk: browserTabs.Perks;
  species: browserTabs.Species;
}

type TabName = "ability" | "gear" | "move" | "perk" | "species" | "settings";
type ContentTabName = Exclude<TabName, "settings">;
type BrowserTab = InstanceType<(typeof browserTabs)[keyof typeof browserTabs]>;
type TabData<T> = Record<TabName, T | null>;

type CommonSortByOption = "name";
type SortByOption = CommonSortByOption | "cost";
type SortDirection = "asc" | "desc";

type CompendiumBrowserSettings = Omit<TabData<Record<string, PackInfo | undefined>>, "settings">;

type CompendiumBrowserSourcesList = Record<string, SourceInfo | undefined>;
interface CompendiumBrowserSources {
    ignoreAsGM: boolean;
    showEmptySources: boolean;
    showUnknownSources: boolean;
    sources: CompendiumBrowserSourcesList;
}

interface CompendiumBrowserSheetData {
    user: Active<User>;
    settings?: { settings: CompendiumBrowserSettings; sources: CompendiumBrowserSources };
    scrollLimit?: number;
    showCampaign: boolean;
}

export type {
  BrowserTab,
  BrowserTabs,
  CommonSortByOption,
  ContentTabName,
  PackInfo,
  SortByOption,
  SortDirection,
  SourceInfo,
  TabData,
  TabName,
  CompendiumBrowserSettings,
  CompendiumBrowserSheetData,
  CompendiumBrowserSources,
  CompendiumBrowserSourcesList,
};