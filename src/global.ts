import type { ActorPTR2e, HumanoidActorSystem, PokemonActorSystem} from "@actor";
import type { ItemPTR2e} from "@item";
import type { PerkManager } from "@module/apps/perk-manager/perk-manager.ts";
import type { ArtMapCollection, ClockDatabase, SkillsCollection, TraitsCollection } from "@data";
import type TooltipsPTR2e from "@module/tooltips/tooltips.ts";
import type { PTRCONFIG } from "@scripts/config/index.ts";
import type { ImageResolver, sluggify } from "@utils";
import type EnJSON from "static/lang/en.json";
import type ClockPanel from "@module/apps/clocks/clock-panel.ts";
import type TokenPanel from "@module/apps/token-panel.ts";
import type { remigrate } from "@system/remigrate.ts";
import type { CompendiumBrowser } from "@module/apps/compendium-browser/index.ts";
import type { TutorListSettings } from "@system/tutor-list/setting-model.ts";
import type { TutorListApp } from "@module/apps/tutor-list.ts";
import type GithubManager from "@module/apps/github.ts";
import { ExpTrackerSettings } from "@system/exp-tracker-model.ts";
import type { ItemFlagsPTR2e } from "@item/data/data.ts";
import type AbilitySystem from "@item/data/ability.ts";
import type { ActiveEffectPTR2e } from "@effects";
import type PerkSystem from "@item/data/perk.ts";
import type { TypeEffectiveness } from "@scripts/config/effectiveness.ts";
import type { CompendiumBrowserSettings, CompendiumBrowserSources } from "@module/apps/compendium-browser/data.ts";
import type { CombatantPTR2e, CombatPTR2e, CombatSystemPTR2e } from "@combat";
import type { ScenePTR2e } from "@module/canvas/scene.ts";
import type { TokenPTR2e } from "@module/canvas/token/object.ts";
import type { TokenDocumentPTR2e } from "@module/canvas/token/document.ts";

declare global {
  // interface ConfigPTR2e extends ConfiguredConfig {
  //   PTR: typeof PTRCONFIG;
  //   ui: ConfiguredConfig["ui"] & {
  //     perksTab: new () => PerkDirectory;
  //   };
  //   Change: {
  //     documentClass: typeof ChangeModel;
  //     dataModels: Record<string, Partial<foundry.abstract.TypeDataModel>>;
  //   };
  // }

  // const CONFIG: ConfigPTR2e;
  // const canvas: Canvas<
  //   ScenePTR2e,
  //   AmbientLight<AmbientLightDocument<ScenePTR2e>>,
  //   MeasuredTemplate<MeasuredTemplateDocument<ScenePTR2e>>,
  //   TokenPTR2e<TokenDocumentPTR2e<ScenePTR2e>>,
  //   EffectsCanvasGroup
  // >;

  // interface ClientSettings {
  //   get(module: "ptr2e", key: "compendiumBrowserSources"): CompendiumBrowserSources
  //   get(module: "ptr2e", key: "compendiumBrowserPacks"): CompendiumBrowserSettings
  //   get(module: "ptr2e", key: "tutorListData"): TutorListSettings
  //   get(module: "ptr2e", key: "expTrackerData"): ExpTrackerSettings
  //   get(module: "ptr2e", key: "tokens.autoscale"): boolean
  //   set(module: "ptr2e", key: "expTrackerData", value: ExpTrackerSettings['_source']): ExpTrackerSettings
  // }

  // // eslint-disable-next-line @typescript-eslint/no-namespace
  // namespace globalThis {
  //   let game: GamePTR2e;

  //   let fu: typeof foundry.utils;

  //   let ui: FoundryUI<
  //     ActorDirectory<ActorPTR2e<ActorSystemPTR2e, null>>,
  //     ItemDirectory<ItemPTR2e<ItemSystemPTR, null>>,
  //     ChatLog,
  //     CompendiumDirectory,
  //     CombatTracker<Combat | null>
  //   > & {
  //     perksTab: PerkDirectory;
  //   };

  //   function getTexture(src: string): PIXI.Texture | PIXI.Spritesheet | null;

  //   let actor: () => ActorPTR2e<ActorSystemPTR2e, TokenDocumentPTR2e<ScenePTR2e> | null> | null;

  //   let _maxZ: number;
  // }

  const BUILD_MODE: "development" | "production";
  const EN_JSON: typeof EnJSON;
}

declare global {
  interface Game {
    ptr: {
      util: {
        sluggify: typeof sluggify;
        image: ImageResolver;
        github: typeof GithubManager
      };
      compendiumBrowser: CompendiumBrowser;
      data: {
        traits: TraitsCollection;
        skills: SkillsCollection;
        artMap: ArtMapCollection;
        // afflictions: Map<string, StatusEffect>;
        tutorList: TutorListSettings;
      };
      perks: PerkManager;
      tooltips: TooltipsPTR2e;
      clocks: {
        db: typeof ClockDatabase;
        panel: ClockPanel;
      };
      tokenPanel: TokenPanel;
      tutorList: TutorListApp;
      system: {
        remigrate: typeof remigrate;
      }
      settings: {
        tokens: {
          autoscale: boolean;
        }
      }
    };
  }

  interface CONFIG {
    PTR: typeof PTRCONFIG;
  }

  interface AssumeHookRan {
    init: never;
    i18nready: never;
    setup: never;
    ready: never;
  }

  interface DocumentClassConfig {
    Actor: typeof ActorPTR2e;
    Item: typeof ItemPTR2e;
    ActiveEffect: typeof ActiveEffectPTR2e;
    Combat: typeof CombatPTR2e;
    Combatant: typeof CombatantPTR2e;
    Scene: typeof ScenePTR2e;
    Token: typeof TokenPTR2e;
    TokenDocument: typeof TokenDocumentPTR2e;
  }

  interface DataModelConfig {
    Item: {
      "ability": typeof AbilitySystem, 
      "blueprint": object,
      "consumable": object, 
      "container": object, 
      "effect": object,
      "equipment": object,
      "gear": object, 
      "move": object, 
      "perk": typeof PerkSystem, 
      "species": object,
      "ptu-item": object,
      "weapon": object,
      "summon": object
    },
    Actor: {
      "humanoid": HumanoidActorSystem
      "pokemon": PokemonActorSystem
      "ptu-actor": object
    },
    ActiveEffect: {
      "affliction": object,
      "passive": object,
      "summon": object,
      "form":object
    },
    ChatMessage: {
      "item": object,
      "attack": object,
      "damage-applied": object,
      "skill": object,
      "capture": object,
      "combat": object
    },
    Combatant: {
      "character": object,
      "round": object,
      "summon": object
    },
    Combat: {
      base: CombatSystemPTR2e
    }
  }

  interface ConfiguredDocuments {
    Actions: object;
  }

  interface FlagConfig {
    Item: ItemFlagsPTR2e;
    Folder: {
      core?: Record<string, unknown>;
      ptr2e?: {
        owner: string;
        party: string[];
        team: string[];
      }
    }
  }

  interface SettingConfig {
    "ptr2e.compendiumBrowserSources": CompendiumBrowserSources
    "ptr2e.compendiumBrowserPacks": CompendiumBrowserSettings
    "ptr2e.tutorListData": TutorListSettings
    "ptr2e.expTrackerData": ExpTrackerSettings
    "ptr2e.tokens.autoscale": boolean
    "ptr2e.pokemonTypes": TypeEffectiveness
    "ptr2e.clocks": ClockDatabase
    "ptr2e.dev-mode": boolean
    "ptr2e.player-folder-create-permission": boolean
    "ptr2e.traits": unknown[]
    "ptr2e.skills": unknown[]
    "ptr2e.artMap": unknown
    "ptr2e.worldSystemVersion": string
    "ptr2e.worldSchemaVersion": number
  }

  // Misc Type Helpers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type ConstructorOf<T> = new (...args: any[]) => T;
  type Maybe<T> = T | null | undefined;
  type SetElement<TSet extends Set<unknown>> = TSet extends Set<infer TElement> ? TElement : never;

  // Type Aliases
  type TokenDocumentUUID = `Scene.${string}.Token.${string}`;
  type CompendiumActorUUID = `Compendium.${string}.Actor.${string}`;
  type ActorUUID = `Actor.${string}` | `${TokenDocumentUUID}.Actor.${string}` | CompendiumActorUUID;
  type EmbeddedItemUUID = `Actor.${string}.Item.${string}`;
  type CompendiumItemUUID = `Compendium.${string}.Item.${string}`;
  type ItemUUID = `Item.${string}` | EmbeddedItemUUID | CompendiumItemUUID;

  type HexColorString = `#${string}`;

  type AudioFileExtension = keyof typeof CONST.AUDIO_FILE_EXTENSIONS;
  type ImageFileExtension = keyof typeof CONST.IMAGE_FILE_EXTENSIONS;
  type VideoFileExtension = keyof typeof CONST.VIDEO_FILE_EXTENSIONS;
  type ActiveEffectChangeMode = (typeof CONST.ACTIVE_EFFECT_MODES)[keyof typeof CONST.ACTIVE_EFFECT_MODES];
  type TokenDisplayMode = (typeof CONST.TOKEN_DISPLAY_MODES)[keyof typeof CONST.TOKEN_DISPLAY_MODES];

  type AudioFilePath = `${string}.${AudioFileExtension}`;
  type ImageFilePath = `${string}.${ImageFileExtension}`;
  type VideoFilePath = `${string}.${VideoFileExtension}`;
  type FilePath = AudioFilePath | ImageFilePath | VideoFilePath;
}