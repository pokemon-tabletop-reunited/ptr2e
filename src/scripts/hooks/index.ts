import { Init } from "@scripts/hooks/init.ts";
import { GetSceneControlButtons } from "./scene-control-buttons.ts";
import { PTRHook } from "./data.ts";
import { SettingUpdated } from "./setting-updated.ts";
import { DropCanvasData } from "./drop-canvas-data.ts";
import { ChatContext } from "./chat-context.ts";
import { GearColor } from "./gear-color.ts";
import { RenderSidebar } from "./render-sidebar.ts";
import { Sockets } from "./socket.ts";

export const PTRHooks = {
    listen() {
        const listeners: PTRHook[] = [
            // Add listeners here
            Init,
            GetSceneControlButtons,
            SettingUpdated,
            DropCanvasData,
            ChatContext,
            GearColor,
            RenderSidebar,
            Sockets
        ]
        for (const listener of listeners) listener.listen();
    }
}

