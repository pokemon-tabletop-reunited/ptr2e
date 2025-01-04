import type { ActorPTR2e, HumanoidActorSystem, PokemonActorSystem } from "@actor";
import { ItemPTR2e, data } from "@item";
import type { PerkManager } from "@module/apps/perk-manager/perk-manager.ts";
import type { ArtMapCollection, ClockDatabase, SkillsCollection, Trait, TraitsCollection } from "@data";
import type TooltipsPTR2e from "@module/tooltips/tooltips.ts";
import type { PTRCONFIG } from "@scripts/config/index.ts";
import type { ImageResolver, sluggify, SpeciesImageDataSource } from "@utils";
import type EnJSON from "static/lang/en.json";
import type ClockPanel from "@module/apps/clocks/clock-panel.ts";
import type TokenPanel from "@module/apps/token-panel.ts";
import type { remigrate } from "@system/remigrate.ts";
import type { CompendiumBrowser } from "@module/apps/compendium-browser/index.ts";
import type { TutorListSettings } from "@system/tutor-list/setting-model.ts";
import type { TutorListApp } from "@module/apps/tutor-list.ts";
import type GithubManager from "@module/apps/github.ts";
import { ExpTrackerSettings } from "@system/exp-tracker-model.ts";
import type { ItemFlagsPTR2e, ItemGrantData } from "@item/data/data.ts";
import type { ActiveEffectPTR2e } from "@effects";
import type { TypeEffectiveness } from "@scripts/config/effectiveness.ts";
import type { CompendiumBrowserSettings, CompendiumBrowserSources } from "@module/apps/compendium-browser/data.ts";
import type { CharacterCombatantSystem, CombatantPTR2e, CombatPTR2e, CombatSystemPTR2e, RoundCombatantSystem, SummonCombatantSystem } from "@combat";
import type { ScenePTR2e } from "@module/canvas/scene.ts";
import type { TokenPTR2e } from "@module/canvas/token/object.ts";
import type { TokenDocumentPTR2e } from "@module/canvas/token/document.ts";
import type { PerkDirectory } from "@module/apps/sidebar/perks-directory.ts";
import type { RollOptionDomains, RollOptions } from "@module/data/roll-option-manager.ts";
import type FolderPTR2e from "@module/folder/document.ts";
import type { PickableThing } from "@module/apps/pick-a-thing-prompt.ts";
import type { ActionUUID } from "./util/uuid.ts";
import type { AttackMessageSystem, CaptureMessageSystem, ChatMessagePTR2e, DamageAppliedMessageSystem, ItemMessageSystem, SkillMessageSystem } from "@chat";
import type AfflictionActiveEffectSystem from "@module/effects/data/affliction.ts";
import type PassiveActiveEffectSystem from "@module/effects/data/passive.ts";
import type SummonActiveEffectSystem from "@module/effects/data/summon.ts";
import type FormActiveEffectSystem from "@module/effects/data/form.ts";
import type { MeasuredTemplatePTR2e } from "@module/canvas/measured-template.ts";

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
        afflictions: Map<string, CONFIG.StatusEffect>;
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

  namespace CONFIG {
    interface UI {
      perksTab: typeof PerkDirectory;
    }
  }
  interface CONFIG {
    PTR: typeof PTRCONFIG;
  }

  interface AssumeHookRan {
    ready: never;
  }

  interface DocumentClassConfig {
    Actor: typeof ActorPTR2e;
    Item: typeof ItemPTR2e;
    ActiveEffect: typeof ActiveEffectPTR2e;
    Combat: typeof CombatPTR2e;
    Combatant: typeof CombatantPTR2e;
    Scene: typeof ScenePTR2e;
    Token: typeof TokenDocumentPTR2e;
    Folder: typeof FolderPTR2e;
    ChatMessage: typeof ChatMessagePTR2e;
  }
  
  interface PlaceableObjectClassConfig {
    Token: typeof TokenPTR2e;
    MeasuredTemplate: typeof MeasuredTemplatePTR2e;
  }

  interface DataModelConfig {
    Item: {
      "ability": typeof data.AbilitySystemModel,
      "blueprint": typeof data.BlueprintSystemModel,
      "consumable": typeof data.ConsumableSystemModel,
      "container": typeof data.ContainerSystemModel,
      "effect": typeof data.EffectSystemModel,
      "equipment": typeof data.EquipmentSystemModel,
      "gear": typeof data.GearSystemModel,
      "move": typeof data.MoveSystemModel,
      "perk": typeof data.PerkSystemModel,
      "species": typeof data.SpeciesSystemModel,
      "ptu-item": foundry.abstract.DataModel.AnyConstructor,
      "weapon": typeof data.WeaponSystemModel,
      "summon": typeof data.SummonSystemModel
    },
    Actor: {
      "humanoid": typeof HumanoidActorSystem
      "pokemon": typeof PokemonActorSystem
      "ptu-actor": foundry.abstract.DataModel.AnyConstructor
    },
    ActiveEffect: {
      "affliction": typeof AfflictionActiveEffectSystem,
      "passive": typeof PassiveActiveEffectSystem,
      "summon": typeof SummonActiveEffectSystem,
      "form": typeof FormActiveEffectSystem
    },
    ChatMessage: {
      "item": typeof ItemMessageSystem,
      "attack": typeof AttackMessageSystem,
      "damage-applied": typeof DamageAppliedMessageSystem,
      "skill": typeof SkillMessageSystem,
      "capture": typeof CaptureMessageSystem,
      "combat": foundry.abstract.DataModel.AnyConstructor
    },
    Combatant: {
      "character": typeof CharacterCombatantSystem,
      "round": typeof RoundCombatantSystem,
      "summon": typeof SummonCombatantSystem
    },
    Combat: {
      base: typeof CombatSystemPTR2e
    }
  }

  interface ConfiguredDocuments {
    Actions: object;
  }

  interface FlagConfig {
    Actor: {
      core?: {
        sourceId?: string;
      }
      ptr2e?: {
        rollOptions?: RollOptions & object;
        sheet?: {
          perkFlash?: boolean;
        };
        disableActionOptions?: {
          collection: Collection<PTR.Models.Action.AnyInstance>;
          get options(): PickableThing[];
          disabled: ActionUUID[];
        }
        editedSkills?: boolean
      }
    };
    Item: ItemFlagsPTR2e;
    Folder: {
      core?: Record<string, unknown>;
      ptr2e?: {
        owner: string;
        party: string[];
        team: string[];
      }
    },
    ActiveEffect: {
      // core?: {
      //   sourceId?: string;
      // },
      ptr2e?: {
        itemGrants?: Record<string, ItemGrantData>;
        grantedBy?: ItemGrantData | null;
        choiceSelections?: Record<string, string | number | object | null>;
        rollOptions?: {
          [domain in keyof typeof RollOptionDomains]: Record<string, boolean>;
        }
        aura?: {
          slug: string;
          origin: ActorUUID;
          removeOnExit: boolean;
          amount?: number;
        };
      }
    }
    ChatMessage: {
      ptr2e?: {
        undoData: unknown
      }
    }
    User: {
      ptr2e?: {
        "dev-identity": string;
        "exp-training-slots": Record<string, unknown>;
        "appSettings": Record<string, Record<string, unknown>>;
      }
    }
    Token: {
      ptr2e?: {
        autoscale?: boolean;
        linkToActorSize?: boolean;
      }
    }
  }

  interface SettingConfig {
    "ptr2e.compendiumBrowserSources": CompendiumBrowserSources
    "ptr2e.compendiumBrowserPacks": CompendiumBrowserSettings
    "ptr2e.tutorListData": typeof TutorListSettings
    "ptr2e.expTrackerData": typeof ExpTrackerSettings
    "ptr2e.tokens.autoscale": boolean
    "ptr2e.pokemonTypes": TypeEffectiveness
    "ptr2e.clocks": typeof ClockDatabase
    "ptr2e.dev-mode": boolean
    "ptr2e.player-folder-create-permission": boolean
    "ptr2e.traits": Trait[]
    "ptr2e.skills": unknown[]
    "ptr2e.artmap": Record<string, SpeciesImageDataSource>
    "ptr2e.worldSystemVersion": string
    "ptr2e.worldSchemaVersion": number
  }

  // Misc Type Helpers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type ConstructorOf<T> = new (...args: any[]) => T;
  type Maybe<T> = T | null | undefined;
  type SetElement<TSet extends Set<unknown>> = TSet extends Set<infer TElement> ? TElement : never;

  // Type Aliases
  type CompendiumDocumentType = (typeof CONST.COMPENDIUM_DOCUMENT_TYPES)[number];
  type CompendiumUUID = `Compendium.${string}.${CompendiumDocumentType}.${string}`;
  type TokenDocumentUUID = `Scene.${string}.Token.${string}`;
  type CompendiumActorUUID = `Compendium.${string}.Actor.${string}`;
  type ActorUUID = `Actor.${string}` | `${TokenDocumentUUID}.Actor.${string}` | CompendiumActorUUID;
  type EmbeddedItemUUID = `Actor.${string}.Item.${string}`;
  type CompendiumItemUUID = `Compendium.${string}.Item.${string}`;
  type ItemUUID = `Item.${string}` | EmbeddedItemUUID | CompendiumItemUUID;
  type FolderUUID = `Folder.${string}`;
  //FIXME: This type shouldn't be necessary, but currently it makes life easy.
  type ValidUUID = ActorUUID | ItemUUID | TokenDocumentUUID | CompendiumUUID | FolderUUID;

  type HexColorString = `#${string}`;

  type AudioFileExtension = keyof typeof CONST.AUDIO_FILE_EXTENSIONS;
  type ImageFileExtension = keyof typeof CONST.IMAGE_FILE_EXTENSIONS;
  type VideoFileExtension = keyof typeof CONST.VIDEO_FILE_EXTENSIONS;
  type ActiveEffectChangeMode = (typeof CONST.ACTIVE_EFFECT_MODES)[keyof typeof CONST.ACTIVE_EFFECT_MODES];

  type AudioFilePath = `${string}.${AudioFileExtension}`;
  type ImageFilePath = `${string}.${ImageFileExtension}`;
  type VideoFilePath = `${string}.${VideoFileExtension}`;
  type FilePath = AudioFilePath | ImageFilePath | VideoFilePath;

  interface Point { x: number; y: number }

  interface Module {
    flags: Record<string, {
      "ptr2e-species-art"?: string;
      "ptr2e-species-art-priority"?: number;
      [key: string]: unknown;
    }>
  }

  type FolderableDocuments = Macro.ConfiguredInstance | Actor.ConfiguredInstance | Item.ConfiguredInstance | Scene.ConfiguredInstance | Cards.ConfiguredInstance | Playlist.ConfiguredInstance | RollTable.ConfiguredInstance | Adventure.ConfiguredInstance | JournalEntry.ConfiguredInstance;
}