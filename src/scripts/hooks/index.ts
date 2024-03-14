import { Init } from "@scripts/hooks/init.ts";
import { GetSceneControlButtons } from "./scene-control-buttons.ts";
import { PTRHook } from "./data.ts";

export const PTRHooks = {
    listen() {
        const listeners: PTRHook[] = [
            // Add listeners here
            Init,
            GetSceneControlButtons,
        ]
        for (const listener of listeners) listener.listen();
    }
}

