import { ActorPTR2e, ActorSystemPTR2e } from "@actor";
import { CombatPTR2e, CombatantPTR2e, CombatTrackerPTR2e } from "@combat";
import { ItemPTR2e, ItemSystemPTR } from "@item";
import { PerkManager } from "@module/apps/perk-manager/perk-manager.ts";
import { PerkDirectory } from "@module/apps/sidebar/perks-directory.ts";
import { ScenePTR2e } from "@module/canvas/scene.ts";
import { TokenDocumentPTR2e } from "@module/canvas/token/document.ts";
import { TokenPTR2e } from "@module/canvas/token/object.ts";
import { ArtMapCollection, ChangeModel, ClockDatabase, SkillsCollection, TraitsCollection } from "@data";
import TooltipsPTR2e from "@module/tooltips/tooltips.ts";
import { PTRCONFIG } from "@scripts/config/index.ts";
import { ImageResolver, sluggify } from "@utils";
import type EnJSON from "static/lang/en.json";
import ClockPanel from "@module/apps/clocks/clock-panel.ts";
import TokenPanel from "@module/apps/token-panel.ts";
import { remigrate } from "@system/remigrate.ts";
import { CompendiumBrowserSettings, CompendiumBrowserSources } from "@module/apps/compendium-browser/data.ts";
import { CompendiumBrowser } from "@module/apps/compendium-browser/index.ts";
import { TutorListSettings } from "@system/tutor-list/setting-model.ts";
import { TutorListApp } from "@module/apps/tutor-list.ts";
import GithubManager from "@module/apps/github.ts";
import { ExpTrackerSettings } from "@system/exp-tracker-model.ts";
import type { HasBaseSchema } from "@module/data/mixins/has-base.ts";
import type { ItemFlagsPTR2e } from "@item/data/system.ts";
import type AbilitySystem from "@item/data/ability.ts";
import type { ActiveEffectPTR2e } from "@effects";

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

  interface AssumeHookRan {
    init: never;
    setup: never;
    ready: never;
  }

  interface DocumentClassConfig {
    Actor: typeof ActorPTR2e;
    Item: typeof ItemPTR2e;
    ActiveEffect: typeof ActiveEffectPTR2e;
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
      "perk": object, 
      "species": object,
      "ptu-item": object,
      "weapon": object,
      "summon": object
    },
    Actor: {
      "humanoid": object
      "pokemon": object
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
  }

  interface ConfiguredDocuments {
    Actions: object;
  }

  interface FlagConfig {
    Item: ItemFlagsPTR2e;
  }
}