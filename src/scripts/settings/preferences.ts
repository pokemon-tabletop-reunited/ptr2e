import { SettingsMenuPTR2e, SettingsPTR2e } from "./base.ts";

export class PreferencesMenu extends SettingsMenuPTR2e {
  static override get settings(): SettingsPTR2e {
    return {
      "must-target": {
        name: "PTR2E.Settings.Preferences.MustTarget.Name",
        hint: "PTR2E.Settings.Preferences.MustTarget.Hint",
        default: true,
        type: Boolean,
        scope: "client"
      },
      "expand-rolls":
      {
        name: "PTR2E.Settings.ExpandRolls.Name",
        hint: "PTR2E.Settings.ExpandRolls.Hint",
        default: false,
        config: true,
        type: Boolean,
        scope: "client"
      },
      "open-sidebar": {
        name: "PTR2E.Settings.Preferences.OpenSidebar.Name",
        hint: "PTR2E.Settings.Preferences.OpenSidebar.Hint",
        default: true,
        type: Boolean,
        scope: "client"
      },
      "sidebar-tab": {
        name: "PTR2E.Settings.Preferences.SidebarTab.Name",
        hint: "PTR2E.Settings.Preferences.SidebarTab.Hint",
        default: "chat",
        type: String,
        choices: {
          chat: "PTR2E.Settings.Preferences.SidebarTab.Chat",
          combat: "PTR2E.Settings.Preferences.SidebarTab.Combat",
          scenes: "PTR2E.Settings.Preferences.SidebarTab.Scenes",
          actors: "PTR2E.Settings.Preferences.SidebarTab.Actors",
          items: "PTR2E.Settings.Preferences.SidebarTab.Items",
          journal: "PTR2E.Settings.Preferences.SidebarTab.Journals",
          tables: "PTR2E.Settings.Preferences.SidebarTab.Tables",
          cards: "PTR2E.Settings.Preferences.SidebarTab.Cards",
          macros: "PTR2E.Settings.Preferences.SidebarTab.Macros",
          playlists: "PTR2E.Settings.Preferences.SidebarTab.Playlists",
          compendium: "PTR2E.Settings.Preferences.SidebarTab.Compendium",
          settings: "PTR2E.Settings.Preferences.SidebarTab.Settings",
        },
        scope: "client"
      }
    }
  }

  static override get registrationSettings(): SettingSubmenuConfig {
    return {
      name: "PTR2E.Settings.Preferences.Name",
      label: "PTR2E.Settings.Preferences.Label",
      hint: "PTR2E.Settings.Preferences.Hint",
      icon: "fa fa-cog",
      type: PreferencesMenu,
      restricted: false
    };
  }

  static override get prefix(): string {
    return "preferences";
  }
}