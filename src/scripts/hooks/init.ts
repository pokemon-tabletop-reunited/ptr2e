import { PTRActorSheet } from "../../module/actor/sheet.ts";
import { PTRCombatant } from "../../module/combat/combatant.ts";
import { PTRCombat } from "../../module/combat/document.ts";
import { registerHandlebarsHelpers } from "../../util/handlebars.ts";
import { registerTemplates } from "../../util/templates.ts";
import { PTRCONFIG } from "../config/index.ts";
import { GamePTR } from "../game-ptr2e.ts";

/** @type {PTRHook} */
export const Init = {
    listen() {
        Hooks.once('init', () => {
            console.log('PTR 2e | Initializing');
            // Add initialization code here

            // Add actor() to window
            /** @returns {Actor?} */
            window.actor = function () {
                return canvas.tokens.controlled[0]?.actor;
            }


            // Setup PTR Config
            CONFIG.PTR = PTRCONFIG;
            Object.freeze(CONFIG.PTR);

            // Set custom combat settings
            CONFIG.Combat.documentClass = PTRCombat;
            CONFIG.Combatant.documentClass = PTRCombatant;

            CONFIG.ui.combat = PTRCONFIG.ui.combat
            CONFIG.ui.perks = PTRCONFIG.ui.perks;

            // Define custom Entity classes
            CONFIG.Actor.documentClass = PTRCONFIG.Actor.proxy;
            CONFIG.Item.documentClass = PTRCONFIG.Item.documentClass;
            CONFIG.Item.dataModels = PTRCONFIG.Item.dataModels;

            // Register custom sheets
            {
                Actors.unregisterSheet("core", ActorSheet);
                Actors.registerSheet("ptr2e", PTRActorSheet, { makeDefault: true })
            }

            // Register handlebars helpers
            registerHandlebarsHelpers();
            registerTemplates();

            // Create and populate initial game.ptr interface
            GamePTR.onInit();
        });

        Hooks.once('setup', () => {
        })
    }
}