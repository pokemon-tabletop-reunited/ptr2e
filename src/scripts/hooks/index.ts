import { Init } from "@scripts/hooks/init.ts";

export const PTRHooks = {
    listen() {
        const listeners = [
            // Add listeners here
            Init
        ]
        for(const listener of listeners) listener.listen();
    }
}

