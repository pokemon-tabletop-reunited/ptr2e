import { Init } from "@scripts/hooks/init.ts";
import { GetSceneControlButtons } from "./scene-control-buttons.ts";
import { PTRHook } from "./data.ts";
import { SettingUpdated } from "./setting-updated.ts";
import { DropCanvasData } from "./drop-canvas-data.ts";

export const PTRHooks = {
    listen() {
        const listeners: PTRHook[] = [
            // Add listeners here
            Init,
            GetSceneControlButtons,
            SettingUpdated,
            DropCanvasData
        ]
        for (const listener of listeners) listener.listen();
    }
}

