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
import { storeInitialWorldVersions } from "@scripts/store-versions.ts";
import { MigrationList, MigrationRunner } from "@module/migration/index.ts";
import { MigrationSummary } from "@module/apps/migration-summary.ts";
// import { PerkWebTour } from "@module/tours/perk-web.ts";
// import { GeneratingPokemonTour } from "@module/tours/generating-pokemon.ts";

export const Init: PTRHook = {
    listen() {
        Hooks.once('init', () => {
            console.log('PTR 2e | Initializing');
            // Add initialization code here

            // By default, foundry.abstract.DataModel.defineSchema is coded to throw an error to remind developers to override it.
            // However, this messes up defineSchema() chaining in template mixins, so we'll scrap that behavior.
            foundry.abstract.DataModel.defineSchema = () => ({});

            // Add actor() to window
            //@ts-expect-error - Adding actor to window
            window.actor = function (): Actor | null {
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
                //@ts-expect-error - Application V2 Compatability
                Actors.registerSheet("ptr2e", ActorSheetPTR2e, { types: ["humanoid", "pokemon"], makeDefault: true })
                Actors.registerSheet("ptr2e", PTRCONFIG.Actor.sheetClasses["ptu-actor"], { types: ["ptu-actor"], makeDefault: true })

                Items.unregisterSheet("core", ItemSheet);
                for (const type in PTRCONFIG.Item.sheetClasses) {
                    const key = type as keyof typeof PTRCONFIG.Item.sheetClasses;
                    for (const sheet of PTRCONFIG.Item.sheetClasses[key]) {
                        //@ts-expect-error - Application V2 Compatability
                        Items.registerSheet("ptr2e", sheet, { types: [type], makeDefault: true });
                    }
                }

                DocumentSheetConfig.unregisterSheet(ActiveEffect, "core", ActiveEffectConfig);
                //@ts-expect-error - Application V2 Compatability
                DocumentSheetConfig.registerSheet(ActiveEffect, "ptr2e", PTRCONFIG.ActiveEffect.sheetClasses.effect, { makeDefault: true });
            }

            initializeSettings();

            // Register tours
            (async () => {
                // Monkeypatch the game.tooltip class to stop auto-dismissing tooltips
                const original = game.tooltip.deactivate.bind(game.tooltip);
                //@ts-expect-error - Monkeypatching game.tooltip
                game.tooltip.deactivate = (force) => {
                    if(Tour.tourInProgress && !force) return;
                    original();
                }

                try {
                    game.tours.register("ptr2e", "welcome", await WelcomeTour.fromJSON("systems/ptr2e/tours/welcome.json"));
                    game.tours.register("ptr2e", "folders", await FoldersTour.fromJSON("systems/ptr2e/tours/folders.json"));
                    game.tours.register("ptr2e", "character-creation", await CharacterCreationTour.fromJSON("systems/ptr2e/tours/character-creation.json"));
                    // game.tours.register("ptr2e", "perk-web", await PerkWebTour.fromJSON("systems/ptr2e/tours/perk-web.json"));
                    // game.tours.register("ptr2e", "generating-pokemon", await GeneratingPokemonTour.fromJSON("systems/ptr2e/tours/generating-pokemon.json"));
                    // game.tours.register("ptr2e", "combat", await CombatTour.fromJSON("systems/ptr2e/tours/combat.json"));
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

            // Determine whether a system migration is required and feasible
            const currentVersion = game.settings.get("ptr2e", "worldSchemaVersion") as number;

            // Save the current world schema version if hasn't before.
            storeInitialWorldVersions().then(async () => {
                // Ensure only a single GM will run migrations if multiple are logged in
                if (game.user !== game.users.activeGM) return;

                // Perform migrations, if any
                const migrationRunner = new MigrationRunner(MigrationList.constructFromVersion(currentVersion));
                if (migrationRunner.needsMigration()) {
                    if (currentVersion && currentVersion < MigrationRunner.MINIMUM_SAFE_VERSION) {
                        ui.notifications.error(
                            `Your PTR2E system data is from too old a Foundry version and cannot be reliably migrated to the latest version. The process will be attempted, but errors may occur.`,
                            { permanent: true },
                        );
                    }
                    await migrationRunner.runMigration();
                    new MigrationSummary().render(true);
                }

                // Update the world system version
                const previous = game.settings.get("ptr2e", "worldSystemVersion") as string;
                const current = game.system.version;
                if (fu.isNewerVersion(current, previous)) {
                    await game.settings.set("ptr2e", "worldSystemVersion", current);
                }

                // These modules claim compatibility with V12 but are abandoned
                const abandonedModules = new Set<string>([]);

                // Nag the GM for running unmaintained modules
                const subV10Modules = game.modules.filter(
                    (m) =>
                        m.active &&
                        (m.esmodules.size > 0 || m.scripts.size > 0) &&
                        // Foundry does not enforce the presence of `Module#compatibility.verified`, but modules
                        // without it will also not be listed in the package manager. Skip warning those without it in
                        // case they were made for private use.
                        !!m.compatibility.verified &&
                        (abandonedModules.has(m.id) || !fu.isNewerVersion(m.compatibility.verified, "10.312")),
                );

                for (const badModule of subV10Modules) {
                    const message = game.i18n.format("PTR2E.ErrorMessage.SubV9Module", { module: badModule.title });
                    ui.notifications.warn(message);
                    console.warn(message);
                }
            });
        })
    }
}