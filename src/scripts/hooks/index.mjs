import { Init } from "./init.mjs";

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

