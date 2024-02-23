import { ActorSheetPTR2e } from "@actor";
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
            CONFIG.ui.combat = PTRCONFIG.ui.combat
            //CONFIG.ui.perksTab = PTRCONFIG.ui.perks;

            // Define custom Entity classes
            CONFIG.ActiveEffect.documentClass = PTRCONFIG.ActiveEffect.documentClass;
            CONFIG.ActiveEffect.dataModels = PTRCONFIG.ActiveEffect.dataModels;
            CONFIG.ActiveEffect.legacyTransferral = false;
            CONFIG.Actor.documentClass = PTRCONFIG.Actor.documentClass;
            CONFIG.Actor.dataModels = PTRCONFIG.Actor.dataModels;
            CONFIG.ChatMessage.documentClass = PTRCONFIG.ChatMessage.documentClass;
            CONFIG.ChatMessage.dataModels = PTRCONFIG.ChatMessage.dataModels;
            CONFIG.Combat.documentClass = PTRCONFIG.Combat.documentClass;
            CONFIG.Combatant.documentClass = PTRCONFIG.Combatant.documentClass;
            CONFIG.Combatant.dataModels = PTRCONFIG.Combatant.dataModels;
            CONFIG.Item.documentClass = PTRCONFIG.Item.documentClass;
            CONFIG.Item.dataModels = PTRCONFIG.Item.dataModels;
            CONFIG.Change = {
                documentClass: PTRCONFIG.Change.documentClass,
                dataModels: PTRCONFIG.Change.dataModels,
                typeLabels: {},
                typeIcons: {},
            };

            // Register custom sheets
            {
                Actors.unregisterSheet("core", ActorSheet);
                Actors.registerSheet("ptr2e", ActorSheetPTR2e, { makeDefault: true })

                Items.unregisterSheet("core", ItemSheet);
                //@ts-expect-error
                Items.registerSheet("ptr2e", PTRCONFIG.Item.sheetClasses.ability, { types: ["ability"], makeDefault: true });
            }

            // Register handlebars helpers
            registerHandlebarsHelpers();
            registerTemplates();

            // Create and populate initial game.ptr interface
            GamePTR.onInit();
        });

        Hooks.once('setup', () => {
            console.log('PTR 2e | Setup');
            // Add setup code here
            GamePTR.onSetup();
        })

        Hooks.once('ready', () => {
            console.log('PTR 2e | Ready');
            // Add ready code here
            GamePTR.onReady();
        })
    }
}