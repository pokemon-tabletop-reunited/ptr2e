import { Init } from "@scripts/hooks/init.ts";
import { GetSceneControlButtons } from "./scene-control-buttons.ts";

export const PTRHooks = {
    listen() {
        const listeners = [
            // Add listeners here
            Init,
            GetSceneControlButtons,
        ]
        for(const listener of listeners) listener.listen();
    }
}

