import { ActorSheetPTR2e } from "@actor";
import { CombatPTR2e, CombatantPTR2e } from "@combat";
import { PTRCONFIG } from "@scripts/config/index.ts";
import { GamePTR } from "@scripts/game-ptr2e.ts";
import { registerHandlebarsHelpers, registerTemplates } from "@utils";

export const Init = {
    listen() {
        Hooks.once('init', () => {
            console.log('PTR 2e | Initializing');
            // Add initialization code here

            // By default, foundry.abstract.DataModel.defineSchema is coded to throw an error to remind developers to override it.
            // However, this messes up defineSchema() chaining in template mixins, so we'll scrap that behavior.
            foundry.abstract.DataModel.defineSchema = () => ({});

            // Add actor() to window
            /** @returns {Actor?} */
            window.actor = function () {
                return canvas.tokens.controlled[0]?.actor;
            }


            // Setup PTR Config
            CONFIG.PTR = PTRCONFIG;
            Object.freeze(CONFIG.PTR);

            // Set custom combat settings
            CONFIG.Combat.documentClass = CombatPTR2e;
            CONFIG.Combatant.documentClass = CombatantPTR2e;

            CONFIG.ui.combat = PTRCONFIG.ui.combat
            //CONFIG.ui.perksTab = PTRCONFIG.ui.perks;

            // Define custom Entity classes
            CONFIG.Actor.documentClass = PTRCONFIG.Actor.documentClass;
            CONFIG.Item.documentClass = PTRCONFIG.Item.documentClass;
            CONFIG.Actor.dataModels = PTRCONFIG.Actor.dataModels;
            CONFIG.Item.dataModels = PTRCONFIG.Item.dataModels;


            // Register custom sheets
            {
                Actors.unregisterSheet("core", ActorSheet);
                Actors.registerSheet("ptr2e", ActorSheetPTR2e, { makeDefault: true })
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