import { Init } from "@scripts/hooks/init.ts";
import { GetSceneControlButtons } from "./scene-control-buttons.ts";
import { PTRHook } from "./data.ts";
import { SettingUpdated } from "./setting-updated.ts";

export const PTRHooks = {
    listen() {
        const listeners: PTRHook[] = [
            // Add listeners here
            Init,
            GetSceneControlButtons,
            SettingUpdated,
        ]
        for (const listener of listeners) listener.listen();
    }
}

