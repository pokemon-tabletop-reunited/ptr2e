import { Init } from "./init.ts";

export const PTRHooks = {
    listen() {
        /**
         * @type {PTRHook[]}
         */
        const listeners = [
            // Add listeners here
            Init
        ]
        for(const listener of listeners) listener.listen();
    }
}

