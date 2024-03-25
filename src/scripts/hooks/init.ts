import { ActorSheetPTR2e } from "@actor";
import { PTRCONFIG } from "@scripts/config/index.ts";
import { GamePTR } from "@scripts/game-ptr2e.ts";
import { HandlebarTemplates, registerHandlebarsHelpers } from "@utils";
import { default as TypeEffectiveness } from "../config/effectiveness.ts";
import { PTRHook } from "./data.ts";
import { ClockDatabase } from "@data";

export const Init: PTRHook = {
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
                dataModels: PTRCONFIG.Change.dataModels
            };

            CONFIG.Scene.documentClass = PTRCONFIG.Scene.documentClass;
            CONFIG.MeasuredTemplate.defaults.angle = 75;
            // TODO: Revisit this once v12 is properly out and we can look at how other systems handle the changes.
            // CONFIG.MeasuredTemplate.objectClass = PTRCONFIG.MeasuredTemplate.objectClass;
            // CONFIG.MeasuredTemplate.layerClass = PTRCONFIG.MeasuredTemplate.layerClass;
            // CONFIG.Canvas.layers.templates.layerClass = PTRCONFIG.MeasuredTemplate.layerClass;

            // Register custom sheets
            {
                Actors.unregisterSheet("core", ActorSheet);
                Actors.registerSheet("ptr2e", ActorSheetPTR2e, { types: ["humanoid", "pokemon"], makeDefault: true })
                //@ts-ignore
                Actors.registerSheet("ptr2e", PTRCONFIG.Actor.sheetClasses["ptu-actor"], { types: ["ptu-actor"], makeDefault: true })

                Items.unregisterSheet("core", ItemSheet);
                //@ts-ignore
                Items.registerSheet("ptr2e", PTRCONFIG.Item.sheetClasses.ability, { types: ["ability"], makeDefault: true });
                for (const type in PTRCONFIG.Item.sheetClasses) {
                    const key = type as keyof typeof PTRCONFIG.Item.sheetClasses;
                    for (const sheet of PTRCONFIG.Item.sheetClasses[key]) {
                        //@ts-ignore
                        Items.registerSheet("ptr2e", sheet, { types: [type], makeDefault: true });
                    }
                }
            }

            game.settings.register("ptr2e", "pokemonTypes", {
                name: "PTR2E.Settings.PokemonTypes.Name",
                hint: "PTR2E.Settings.PokemonTypes.Hint",
                scope: "world",
                config: false,
                type: Object,
                default: TypeEffectiveness,
                requiresReload: true,
            })

            game.settings.register("ptr2e", "clocks", {
                name: "PTR2E.Settings.Clocks.Name",
                hint: "PTR2E.Settings.Clocks.Hint",
                scope: "world",
                config: false,
                type: ClockDatabase,
                default: {},
                requiresReload: true,
            });

            // Register handlebars helpers
            registerHandlebarsHelpers();
            HandlebarTemplates.register();

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