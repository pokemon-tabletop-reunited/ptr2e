import { PTRActorProxy } from "../../module/actor/base.mjs";
import { PTRActorSheet } from "../../module/actor/sheet.mjs";
import { PTRPerkTreeNodeData } from "../../module/canvas/perk-tree/perk-tree-node.mjs";
import { PTRCombatant } from "../../module/combat/combatant.mjs";
import { PTRCombat } from "../../module/combat/document.mjs";
import { registerHandlebarsHelpers } from "../../util/handlebars.mjs";
import { registerTemplates } from "../../util/templates.mjs";
import { PTRCONFIG } from "../config/index.mjs";
import { GamePTR } from "../game-ptr2e.mjs";

/** @type {PTRHook} */
export const Init = {
    listen() {
        Hooks.once('init', () => {
            console.log('PTR 2e | Initializing');
            // Add initialization code here

            // Add actor() to window
            /** @returns {Actor?} */
            // @ts-ignore
            window.actor = function () {
                // @ts-ignore
                return canvas.tokens.controlled[0]?.actor;
            }

            // Setup PTR Config
            CONFIG.PTR = PTRCONFIG;
            Object.freeze(CONFIG.PTR);

            // Set custom combat settings
            CONFIG.Combat.documentClass = PTRCombat;
            CONFIG.Combatant.documentClass = PTRCombatant;

            for (const [id, cls] of Object.entries(PTRCONFIG.ui)) {
                CONFIG.ui[id] = cls;
            }

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