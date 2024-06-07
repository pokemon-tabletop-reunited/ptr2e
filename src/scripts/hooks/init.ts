import { ActorSheetPTR2e } from "@actor";
import { PTRCONFIG } from "@scripts/config/index.ts";
import { GamePTR } from "@scripts/game-ptr2e.ts";
import { HandlebarTemplates, registerHandlebarsHelpers } from "@utils";
import { PTRHook } from "./data.ts";
import { HTMLStringTagsElementPTR2e } from "@module/apps/string-tags.ts";
import { initializeSettings } from "@scripts/settings.ts";
import { default as enrichers} from "@scripts/ui/text-enrichers.ts";
import { WelcomeTour } from "@module/tours/welcome.ts";
import { FoldersTour } from "@module/tours/folders.ts";
import { CharacterCreationTour } from "@module/tours/character-creation.ts";
import { PerkWebTour } from "@module/tours/perk-web.ts";
import { GeneratingPokemonTour } from "@module/tours/generating-pokemon.ts";

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
            CONFIG.ui.perksTab = PTRCONFIG.ui.perks;

            // Define custom Entity classes
            CONFIG.ActiveEffect.documentClass = PTRCONFIG.ActiveEffect.documentClass;
            CONFIG.ActiveEffect.dataModels = PTRCONFIG.ActiveEffect.dataModels;
            CONFIG.ActiveEffect.legacyTransferral = false;
            CONFIG.Actor.documentClass = PTRCONFIG.Actor.documentClass;
            CONFIG.Actor.dataModels = PTRCONFIG.Actor.dataModels;
            CONFIG.ChatMessage.documentClass = PTRCONFIG.ChatMessage.documentClass;
            CONFIG.ChatMessage.dataModels = PTRCONFIG.ChatMessage.dataModels;
            CONFIG.Combat.documentClass = PTRCONFIG.Combat.documentClass;
            CONFIG.Combat.dataModels = PTRCONFIG.Combat.dataModels;
            CONFIG.Combatant.documentClass = PTRCONFIG.Combatant.documentClass;
            CONFIG.Combatant.dataModels = PTRCONFIG.Combatant.dataModels;
            CONFIG.Item.documentClass = PTRCONFIG.Item.documentClass;
            CONFIG.Item.dataModels = PTRCONFIG.Item.dataModels;
            CONFIG.Change = {
                documentClass: PTRCONFIG.Change.documentClass,
                dataModels: PTRCONFIG.Change.dataModels
            };
            CONFIG.Token.documentClass = PTRCONFIG.Token.documentClass;
            CONFIG.Token.objectClass = PTRCONFIG.Token.objectClass;
            CONFIG.Dice.rolls = CONFIG.Dice.rolls.concat(PTRCONFIG.Dice.rolls);

            CONFIG.Folder.documentClass = PTRCONFIG.Folder.documentClass;

            CONFIG.Scene.documentClass = PTRCONFIG.Scene.documentClass;
            CONFIG.MeasuredTemplate.defaults.angle = 75;
            // TODO: Revisit this once v12 is properly out and we can look at how other systems handle the changes.
            // CONFIG.MeasuredTemplate.objectClass = PTRCONFIG.MeasuredTemplate.objectClass;
            // CONFIG.MeasuredTemplate.layerClass = PTRCONFIG.MeasuredTemplate.layerClass;
            // CONFIG.Canvas.layers.templates.layerClass = PTRCONFIG.MeasuredTemplate.layerClass;

            // Setup Active Effects
            CONFIG.statusEffects = PTRCONFIG.statusEffects;
            CONFIG.specialStatusEffects = PTRCONFIG.specialStatusEffects;

            CONFIG.ui.items = PTRCONFIG.ui.items;
            CONFIG.ui.actors = PTRCONFIG.ui.actors;

            // Register custom sheets
            {
                Actors.unregisterSheet("core", ActorSheet);
                //@ts-ignore
                Actors.registerSheet("ptr2e", ActorSheetPTR2e, { types: ["humanoid", "pokemon"], makeDefault: true })
                //@ts-ignore
                Actors.registerSheet("ptr2e", PTRCONFIG.Actor.sheetClasses["ptu-actor"], { types: ["ptu-actor"], makeDefault: true })

                Items.unregisterSheet("core", ItemSheet);
                for (const type in PTRCONFIG.Item.sheetClasses) {
                    const key = type as keyof typeof PTRCONFIG.Item.sheetClasses;
                    for (const sheet of PTRCONFIG.Item.sheetClasses[key]) {
                        //@ts-ignore
                        Items.registerSheet("ptr2e", sheet, { types: [type], makeDefault: true });
                    }
                }

                DocumentSheetConfig.unregisterSheet(ActiveEffect, "core", ActiveEffectConfig);
                // @ts-ignore
                DocumentSheetConfig.registerSheet(ActiveEffect, "ptr2e", PTRCONFIG.ActiveEffect.sheetClasses.effect, { makeDefault: true });
            }

            initializeSettings();

            // Register tours
            (async () => {
                try {
                    game.tours.register("ptr2e", "welcome", await WelcomeTour.fromJSON("/systems/ptr2e/tours/welcome.json"));
                    game.tours.register("ptr2e", "folders", await FoldersTour.fromJSON("/systems/ptr2e/tours/folders.json"));
                    game.tours.register("ptr2e", "character-creation", await CharacterCreationTour.fromJSON("/systems/ptr2e/tours/character-creation.json"));
                    game.tours.register("ptr2e", "perk-web", await PerkWebTour.fromJSON("/systems/ptr2e/tours/perk-web.json"));
                    game.tours.register("ptr2e", "generating-pokemon", await GeneratingPokemonTour.fromJSON("/systems/ptr2e/tours/generating-pokemon.json"));
                    // game.tours.register("ptr2e", "combat", await CombatTour.fromJSON("/systems/ptr2e/tours/combat.json"));
                }
                catch(err) {
                    console.error(err);
                }

            })();

            window.customElements.define(HTMLStringTagsElementPTR2e.tagName, HTMLStringTagsElementPTR2e);

            CONFIG.TextEditor.enrichers.push(...enrichers);

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