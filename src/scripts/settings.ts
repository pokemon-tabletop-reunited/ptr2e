import { default as TypeEffectiveness } from "./config/effectiveness.ts";
import { ClockDatabase } from "@data";
import { SkillsSettingsMenu } from "@module/apps/skills.ts";
import { TraitsSettingsMenu } from "@module/apps/traits.ts";
import { TypeMatrix } from "@module/apps/type-matrix/sheet.ts";
import { ExpTrackerSettings } from "@system/exp-tracker-model.ts";
import { TutorListSettings } from "@system/tutor-list/setting-model.ts";
import { natures } from "./config/natures.ts";

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

  game.settings.registerMenu("ptr2e", "pokemonTypes", {
    "name": "PTR2E.Settings.PokemonTypes.Name",
    "label": "PTR2E.Settings.PokemonTypes.Label",
    "hint": "PTR2E.Settings.PokemonTypes.Hint",
    "icon": "fa-solid fa-shield-alt",
    type: TypeMatrix,
    restricted: true,
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

  game.settings.register("ptr2e", "dev-mode", {
    name: "PTR2E.Settings.DevMode.Name",
    hint: "PTR2E.Settings.DevMode.Hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
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
    onChange: () => { game.ptr.data.traits.refresh(); }
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
    onChange: () => { game.ptr.data.skills.refresh(); }
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
    onChange: () => { game.ptr.data.artMap.refresh(); }
  });

  // game.keybindings.register("ptr2e", "undo", {
  //   name: "PTR2E.Keybindings.Undo.Name",
  //   hint: "PTR2E.Keybindings.Undo.Hint",
  //   editable: [
  //     {
  //       key: "KeyZ",
  //       modifiers: ["Control"]
  //     }
  //   ],
  //   onDown: (context) => game.ptr.web?.onUndo(context),
  // });

  // game.keybindings.register("ptr2e", "delete", {
  //   name: "PTR2E.Keybindings.Delete.Name",
  //   hint: "PTR2E.Keybindings.Delete.Hint",
  //   editable: [
  //     {
  //       key: "Delete",
  //       modifiers: []
  //     }
  //   ],
  //   onDown: (context) => game.ptr.web?.onDelete(context),
  // });

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
    type: Object,
    scope: "world",
    onChange: () => {
      game.ptr.compendiumBrowser.packLoader.reset();
      game.ptr.compendiumBrowser.initCompendiumList();
    },
  });

  game.settings.register("ptr2e", "tutorListData", {
    name: "PTR2E.Settings.TutorListData.Name",
    hint: "PTR2E.Settings.TutorListData.Hint",
    default: {},
    type: TutorListSettings,
    scope: "world",
    onChange: () => {
      game.ptr.data.tutorList = game.settings.get("ptr2e", "tutorListData");
    }
  })

  game.settings.register("ptr2e", "expTrackerData", {
    name: "PTR2E.Settings.ExpTrackerData.Name",
    hint: "PTR2E.Settings.ExpTrackerData.Hint",
    default: {},
    config: false,
    type: ExpTrackerSettings,
    scope: "world"
  })

  game.settings.register("ptr2e", "dev-identity", {
    name: "dev-identity",
    hint: "dev-identity",
    default: {},
    config: false,
    type: String,
    scope: "client"
  })

  game.settings.register("ptr2e", "expand-rolls", {
    name: "PTR2E.Settings.ExpandRolls.Name",
    hint: "PTR2E.Settings.ExpandRolls.Hint",
    default: false,
    config: true,
    type: Boolean,
    scope: "client"
  })

  game.settings.register("ptr2e", "preferences.must-target", {
    name: "PTR2E.Settings.Preferences.MustTarget.Name",
    hint: "PTR2E.Settings.Preferences.MustTarget.Hint",
    default: true,
    config: true,
    type: Boolean,
    scope: "client"
  })

  game.settings.register("ptr2e", "global-perk-configs", {
    name: "PTR2E.Settings.GlobalPerkConfigs.Name",
    hint: "PTR2E.Settings.GlobalPerkConfigs.Hint",
    default: [],
    config: false,
    type: Object,
    scope: "world"
  });

  game.settings.register("ptr2e", "defaults.blueprint.level", {
    name: "PTR2E.Settings.Defaults.Blueprint.Level.Name",
    hint: "PTR2E.Settings.Defaults.Blueprint.Level.Hint",
    config: true,
    default: null,
    type: new foundry.data.fields.StringField({
      required: true,
      nullable: true,
      initial: null,
      validate: (value) => {
        // Level can be either a integer value, a range in the format `a-b`, a Rolltable UUID or null
        if (value === null) return true;

        // Check if the value is a number
        const number = Number(value);
        if (!isNaN(number)) {
          if (Number.isInteger(number) && number >= 1) return true;
          throw new Error("The level must be a positive integer.");
        }
        if (typeof value !== "string") return false;

        // Check if the value is a range
        if (value.match(/^\d+-\d+$/)) {
          const [min, max] = value.split("-").map(Number);
          if (min >= 1 && max >= min) return true;

          throw new Error("The range must be in the format `a-b` where `a` and `b` are integers and `a` is less than or equal to `b`.");
        }

        // Check if the value is a Rolltable UUID
        const uuid = fu.parseUuid(value);
        if (uuid && uuid.documentId) {
          if (uuid.documentType === "RollTable") return true;
          throw new Error("The UUID must point to a Rolltable.");
        }

        return false;
      },
    }),
    scope: "world"
  });

  game.settings.register("ptr2e", "defaults.blueprint.nature", {
    name: "PTR2E.Settings.Defaults.Blueprint.Nature.Name",
    hint: "PTR2E.Settings.Defaults.Blueprint.Nature.Hint",
    config: true,
    default: null,
    type: new foundry.data.fields.StringField({
      required: true, initial: null, nullable: true, trim: true, validate: (value) => {
        //Natures can either be a valid nature typed out, a UUID to a Rolltable or null
        if (value === null) return true;
        if (typeof value !== "string") return false;

        // Check if the value is a valid nature
        const nature = value.toLowerCase();
        if (natures[nature] !== undefined) return true;

        // Check if the value is a Rolltable UUID
        const uuid = fu.parseUuid(value);
        if (uuid && uuid.documentId) {
          if (uuid.documentType === "RollTable") return true;
          throw new Error("The UUID must point to a Rolltable.");
        }

        return false;
      }, validationError: "The nature must be a valid nature, a UUID to a Rolltable or null."
    }),
    scope: "world"
  });

  game.settings.register("ptr2e", "defaults.blueprint.gender", {
    name: "PTR2E.Settings.Defaults.Blueprint.Gender.Name",
    hint: "PTR2E.Settings.Defaults.Blueprint.Gender.Hint",
    config: true,
    default: null,
    type: new foundry.data.fields.StringField({
      required: true, 
      initial: null, 
      nullable: true, 
      trim: true, 
      choices: ["random", "male", "female", "genderless"].reduce((acc, val) => ({ ...acc, [val]: val }), {}),
    }),
    scope: "world"
  });

  game.settings.register("ptr2e", "defaults.blueprint.shiny", {
    name: "PTR2E.Settings.Defaults.Blueprint.Shiny.Name",
    hint: "PTR2E.Settings.Defaults.Blueprint.Shiny.Hint",
    config: true,
    default: 1,
    type: new foundry.data.fields.NumberField({
      required: true,
      initial: 1,
      nullable: false,
      min: 0,
      max: 100,
      step: 1
    }),
    scope: "world"
  });

  game.settings.register("ptr2e", "defaults.blueprint.perk", {
    name: "PTR2E.Settings.Defaults.Blueprint.Perk.Name",
    hint: "PTR2E.Settings.Defaults.Blueprint.Perk.Hint",
    config: true,
    default: null,
    type: String,
    scope: "world"
  });
}