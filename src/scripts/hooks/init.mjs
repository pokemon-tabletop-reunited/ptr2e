import { PTRCombatant } from "../../module/combat/combatant.mjs";
import { PTRCombat } from "../../module/combat/document.mjs";
import { PTRCombatTracker } from "../../module/combat/tracker.mjs";

/** @type {PTRHook} */
export const Init = {
    listen() {
        Hooks.on('init', () => {
            console.log('PTR 2e | Initializing');
            // Add initialization code here

            // Add actor() to window
            /** @returns {Actor?} */
            // @ts-ignore
            window.actor = function () {
                // @ts-ignore
                return canvas.tokens.controlled[0]?.actor;
            }

            // Set custom combat settings
            CONFIG.Combat.documentClass = PTRCombat;
            CONFIG.Combatant.documentClass = PTRCombatant;
            CONFIG.ui.combat = PTRCombatTracker;
            
        });
    }
}