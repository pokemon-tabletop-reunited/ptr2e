import { SettingsMenuPTR2e, SettingsPTR2e } from "./base.ts";

export class PlaytestMenu extends SettingsMenuPTR2e {
  static override get settings(): SettingsPTR2e {
    return {
      "av-changes": {
        name: "PTR2E.Settings.Playtest.AVChanges.Name",
        hint: "PTR2E.Settings.Playtest.AVChanges.Hint",
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
      }
    }
  }

  static override get registrationSettings(): SettingSubmenuConfig {
    return {
      name: "PTR2E.Settings.Playtest.Name",
      label: "PTR2E.Settings.Playtest.Label",
      hint: "PTR2E.Settings.Playtest.Hint",
      icon: "fa fa-cog",
      type: PlaytestMenu,
      restricted: false
    };
  }

  static override get prefix(): string {
    return "playtest";
  }
}