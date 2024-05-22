import { ActorSheetPTR2e } from "@actor";
import { PTRCONFIG } from "@scripts/config/index.ts";
import { GamePTR } from "@scripts/game-ptr2e.ts";
import { HandlebarTemplates, registerHandlebarsHelpers } from "@utils";
import { default as TypeEffectiveness } from "../config/effectiveness.ts";
import { PTRHook } from "./data.ts";
import { ClockDatabase } from "@data";
import { TraitsSettingsMenu } from "@module/apps/traits.ts";
import ActorSheetPTRV2 from "@actor/sheetv2.ts";
import { HTMLStringTagsElementPTR2e } from "@module/apps/string-tags.ts";
import { SkillsSettingsMenu } from "@module/apps/skills.ts";

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
                Actors.registerSheet("ptr2e", ActorSheetPTR2e, { types: ["humanoid", "pokemon"], makeDefault: false })
                //@ts-ignore
                Actors.registerSheet("ptr2e", ActorSheetPTRV2, { types: ["humanoid", "pokemon"], makeDefault: true })
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

            game.settings.register("ptr2e", "dev-mode", {
                name: "PTR2E.Settings.DevMode.Name",
                hint: "PTR2E.Settings.DevMode.Hint",
                scope: "world",
                config: true,
                type: Boolean,
                default: true,
            });

            game.settings.register("ptr2e", "traits", {
                name: "PTR2E.Settings.Traits.Name",
                hint: "PTR2E.Settings.Traits.Hint",
                scope: "world",
                config: false,
                type: Array,
                default: [],
                onChange: () => {game.ptr.data.traits.refresh();}
            })

            game.settings.registerMenu("ptr2e", "traits", {
                name: "PTR2E.Settings.Traits.Name",
                label: "PTR2E.Settings.Traits.Label",
                hint: "PTR2E.Settings.Traits.Hint",
                icon: "fa-solid fa-rectangle-list",
                type: TraitsSettingsMenu,
                restricted: true,
            });

            game.settings.register("ptr2e", "skills", {
                name: "PTR2E.Settings.Skills.Name",
                hint: "PTR2E.Settings.Skills.Hint",
                scope: "world",
                config: false,
                type: Array,
                default: [],
                onChange: () => {game.ptr.data.skills.refresh();}
            })

            game.settings.registerMenu("ptr2e", "skills", {
                name: "PTR2E.Settings.Skills.Name",
                label: "PTR2E.Settings.Skills.Label",
                hint: "PTR2E.Settings.Skills.Hint",
                icon: "fa-solid fa-rectangle-list",
                type: SkillsSettingsMenu,
                restricted: true,
            });

            game.keybindings.register("ptr2e", "undo",{
                name: "PTR2E.Keybindings.Undo.Name",
                hint: "PTR2E.Keybindings.Undo.Hint",
                editable: [
                    {
                        key: "KeyZ",
                        modifiers: ["Control"]
                    }
                ],
                onDown: (context) => game.ptr.web?.onUndo(context),
            });
            game.keybindings.register("ptr2e", "delete",{
                name: "PTR2E.Keybindings.Delete.Name",
                hint: "PTR2E.Keybindings.Delete.Hint",
                editable: [
                    {
                        key: "Delete",
                        modifiers: []
                    }
                ],
                onDown: (context) => game.ptr.web?.onDelete(context),
            });

            window.customElements.define(HTMLStringTagsElementPTR2e.tagName, HTMLStringTagsElementPTR2e);

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