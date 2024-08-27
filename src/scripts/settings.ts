import { default as TypeEffectiveness } from "./config/effectiveness.ts";
import { ClockDatabase } from "@data";
import { SkillsSettingsMenu } from "@module/apps/skills.ts";
import { TraitsSettingsMenu } from "@module/apps/traits.ts";

export function initializeSettings() {

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

    game.settings.register("ptr2e", "player-folder-create-permission", {
      name: "PTR2E.Settings.PlayerFolderCreatePermission.Name",
      hint: "PTR2E.Settings.PlayerFolderCreatePermission.Hint",
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

    game.settings.register("ptr2e", "artmap", {
        name: "PTR2E.Settings.ArtMap.Name",
        hint: "PTR2E.Settings.ArtMap.Hint",
        scope: "world",
        config: false,
        type: Object,
        default: {},
        onChange: () => {game.ptr.data.artMap.refresh();}
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

    game.settings.register("ptr2e", "worldSystemVersion", {
        name: "World System Version",
        scope: "world",
        config: false,
        default: game.system.version,
        type: String,
    });

    game.settings.register("ptr2e", "worldSchemaVersion", {
        name: "PTR2E.Settings.WorldSchemaVersion.Name",
        hint: "PTR2E.Settings.WorldSchemaVersion.Hint",
        scope: "world",
        config: true,
        default: 0,
        type: Number,
        requiresReload: true,
    });
}