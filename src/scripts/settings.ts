import { default as TypeEffectiveness } from "./config/effectiveness.ts";
import { ClockDatabase } from "@data";
import { SkillsSettingsMenu } from "@module/apps/skills.ts";
import { TraitsSettingsMenu } from "@module/apps/traits.ts";
import { TypeMatrix } from "@module/apps/type-matrix/sheet.ts";
import { ExpTrackerSettings } from "@system/exp-tracker-model.ts";
import { TutorListSettings } from "@system/tutor-list/setting-model.ts";
import { registerSettings } from "./settings/index.ts";
import { TutorListEditor } from "@module/apps/tutor-list-editor.ts";
import { ArtMapSettingsMenu } from "@module/apps/custom-art-map/sheet.ts";

export function initializeSettings() {
  registerSettings();

  game.settings.registerMenu("ptr2e", "traits", {
    name: "PTR2E.Settings.Traits.Name",
    label: "PTR2E.Settings.Traits.Label",
    hint: "PTR2E.Settings.Traits.Hint",
    icon: "fa-solid fa-rectangle-list",
    type: TraitsSettingsMenu,
    restricted: true,
  });

  game.settings.registerMenu("ptr2e", "skills", {
    name: "PTR2E.Settings.Skills.Name",
    label: "PTR2E.Settings.Skills.Label",
    hint: "PTR2E.Settings.Skills.Hint",
    icon: "fa-solid fa-rectangle-list",
    type: SkillsSettingsMenu,
    restricted: true,
  });

  game.settings.registerMenu("ptr2e", "tutorLists", {
    name: "PTR2E.Settings.TutorList.Name",
    label: "PTR2E.Settings.TutorList.Label",
    hint: "PTR2E.Settings.TutorList.Hint",
    icon: "fa-solid fa-rectangle-list",
    type: TutorListEditor,
    restricted: true,
  });

  game.settings.registerMenu("ptr2e", "pokemonTypes", {
    "name": "PTR2E.Settings.PokemonTypes.Name",
    "label": "PTR2E.Settings.PokemonTypes.Label",
    "hint": "PTR2E.Settings.PokemonTypes.Hint",
    "icon": "fa-solid fa-shield-alt",
    type: TypeMatrix,
    restricted: true,
  });

  game.settings.registerMenu("ptr2e", "custom-art-map-menu", {
    name: "PTR2E.Settings.ArtMap.Name",
    label: "PTR2E.Settings.ArtMap.Label",
    hint: "PTR2E.Settings.ArtMap.Hint",
    icon: "fa-solid fa-image",
    type: ArtMapSettingsMenu,
    restricted: true,
  })

  game.settings.register("ptr2e", "custom-art-map", {
    name: "PTR2E.Settings.ArtMap.Name",
    hint: "PTR2E.Settings.ArtMap.Hint",
    scope: "world",
    config: false,
    requiresReload: true,
    type: new foundry.data.fields.JSONField({

    }),
    default: {}
  });

  game.settings.register("ptr2e", "dev-mode", {
    name: "PTR2E.Settings.DevMode.Name",
    hint: "PTR2E.Settings.DevMode.Hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register("ptr2e", "tokens.autoscale", {
    name: "PTR2E.Settings.Tokens.Autoscale.Name",
    hint: "PTR2E.Settings.Tokens.Autoscale.Hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      game.ptr.settings.tokens.autoscale = !!value;
    }
  });

  game.settings.register("ptr2e", "player-folder-create-permission", {
    name: "PTR2E.Settings.PlayerFolderCreatePermission.Name",
    hint: "PTR2E.Settings.PlayerFolderCreatePermission.Hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
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

  /* -- All of the below are Data Only Settings -- */

  game.settings.register("ptr2e", "worldSystemVersion", {
    name: "World System Version",
    scope: "world",
    config: false,
    default: game.system.version,
    type: String,
  });

  game.settings.register("ptr2e", "compendiumBrowserPacks", {
    name: "PTR2E.Settings.CompendiumBrowserPacks.Name",
    hint: "PTR2E.Settings.CompendiumBrowserPacks.Hint",
    default: {},
    type: Object,
    scope: "world",
    onChange: () => {
      game.ptr.compendiumBrowser.initCompendiumList();
    },
  });

  game.settings.register("ptr2e", "compendiumBrowserSources", {
    name: "PTR2E.Settings.compendiumBrowserSources.Name",
    hint: "PTR2E.Settings.compendiumBrowserSources.Hint",
    default: {
      ignoreAsGM: true,
      showEmptySources: true,
      showUnknownSources: true,
      sources: {},
    },
    config: false,

    type: Object,
    scope: "world",
    onChange: () => {
      game.ptr.compendiumBrowser.packLoader.reset();
      game.ptr.compendiumBrowser.initCompendiumList();
    },
  });

  game.settings.register("ptr2e", "clocks", {
    name: "PTR2E.Settings.Clocks.Name",
    hint: "PTR2E.Settings.Clocks.Hint",
    scope: "world",
    config: false,
    type: ClockDatabase,
    default: {},
    requiresReload: true,
  });

  game.settings.register("ptr2e", "clocksPosition", {
    name: "PTR2E.Settings.ClocksPosition.Name",
    hint: "PTR2E.Settings.ClocksPosition.Hint",
    scope: "client",
    config: false,
    type: Object,
    default: {
      x: null,
      y: null
    },
  });

  game.settings.register("ptr2e", "dev-identity", {
    name: "dev-identity",
    hint: "dev-identity",
    default: {},
    config: false,
    type: String,
    scope: "client"
  })

  game.settings.register("ptr2e", "expTrackerData", {
    name: "PTR2E.Settings.ExpTrackerData.Name",
    hint: "PTR2E.Settings.ExpTrackerData.Hint",
    default: {},
    config: false,
    type: ExpTrackerSettings,
    scope: "world"
  })

  game.settings.register("ptr2e", "global-perk-configs", {
    name: "PTR2E.Settings.GlobalPerkConfigs.Name",
    hint: "PTR2E.Settings.GlobalPerkConfigs.Hint",
    default: [],
    config: false,
    type: Object,
    scope: "world"
  })

  game.settings.register("ptr2e", "pokemonTypes", {
    name: "PTR2E.Settings.PokemonTypes.Name",
    hint: "PTR2E.Settings.PokemonTypes.Hint",
    scope: "world",
    config: false,
    type: Object,
    default: TypeEffectiveness,
    requiresReload: true,
  })

  game.settings.register("ptr2e", "skills", {
    name: "PTR2E.Settings.Skills.Name",
    hint: "PTR2E.Settings.Skills.Hint",
    scope: "world",
    config: false,
    type: Array,
    default: [],
    onChange: () => { game.ptr.data.skills.refresh(); }
  })

  game.settings.register("ptr2e", "traits", {
    name: "PTR2E.Settings.Traits.Name",
    hint: "PTR2E.Settings.Traits.Hint",
    scope: "world",
    config: false,
    type: Array,
    default: [],
    onChange: () => { game.ptr.data.traits.refresh(); }
  })

  game.settings.register("ptr2e", "tutorListData", {
    name: "PTR2E.Settings.TutorListData.Name",
    hint: "PTR2E.Settings.TutorListData.Hint",
    default: {},
    config: false,
    type: TutorListSettings,
    scope: "world",
    onChange: () => {
      game.ptr.data.tutorList = game.settings.get("ptr2e", "tutorListData");
    }
  });
}