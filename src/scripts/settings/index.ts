import { SettingsMenuPTR2e } from "./base.ts";
import { BlueprintDefaultsMenu } from "./blueprint.ts";
import { MetagameMenu } from "./metagame.ts";
import { monkeyPatchSettings } from "./overrides.ts";
import { PreferencesMenu } from "./preferences.ts";

const menus: (typeof SettingsMenuPTR2e)[] = [
  PreferencesMenu,
  BlueprintDefaultsMenu,
  MetagameMenu
]

export function registerSettings() {
  monkeyPatchSettings();

  for (const menu of menus) {
    game.settings.registerMenu("ptr2e", menu.prefix, menu.registrationSettings)
    for (const [key, setting] of Object.entries(menu.settings)) {
      const settingKey = `${menu.prefix}.${key}`;
      game.settings.register("ptr2e", settingKey, { ...setting, config: true });
    }
  }
}