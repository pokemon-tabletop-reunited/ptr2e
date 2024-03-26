import { PTRHook } from "./data.ts";

export const SettingUpdated: PTRHook = {
    listen: () => {
        Hooks.on("updateSetting", (args) => {
            const setting = args as Setting
            if(setting.key === "ptr2e.clocks") {
                game.ptr.clocks.db.refresh();
            }
        });
    }
}