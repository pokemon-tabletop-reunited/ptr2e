import type { PTRHook } from "./data.ts";

export const SettingUpdated: PTRHook = {
  listen: () => {
    Hooks.on("updateSetting", (setting: ClientSettings.SettingConfig) => {
      if (setting.key === "ptr2e.clocks") {
        game.ptr.clocks.db.refresh();
      }
    });
  }
}