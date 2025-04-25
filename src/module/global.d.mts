import type ClockPanel from "./system/apps/clock-panel";
import type { ActorPTR2e } from "./system/data/actor/document";
import type { HumanoidActorSystem } from "./system/data/actor/models/humanoid";
import type { PokemonActorSystem } from "./system/data/actor/models/pokemon";
import type { ActorSystem } from "./system/data/actor/models/system";
import type { PTRCONFIG } from "./system/data/config";
import type { PokemonType } from "./system/data/constants";
import type { ItemPTR2e } from "./system/data/item/document";
import type ClockDatabase from "./system/data/models/clock-db";
import type { CustomSkill } from "./system/data/models/skill";
import type SkillsCollection from "./system/data/skills-collection";

export {};

declare global {
  interface Game {
    ptr: {
      clocks: {
        db: typeof ClockDatabase;
        panel: ClockPanel;
      }
      data: {
        skills: SkillsCollection;
      }
    }
  }

  interface CONFIG {
    PTR: typeof PTRCONFIG & {}
  }

  namespace globalThis {
    let fu: typeof foundry.utils;
    let actor: () => Actor.Implementation | null;
  }

  namespace PTR {
    namespace Documents {
      namespace Actor {
        type Document = ActorPTR2e;
        type System = ActorSystem;
        type Humanoid = HumanoidActorSystem;
        type Pokemon = PokemonActorSystem;
      }
    }
  }

  interface DocumentClassConfig {
    Actor: typeof ActorPTR2e
    Item: typeof ItemPTR2e
  }

  // foundry-vtt-types needs to know what data models you register with Foundry at runtime.
  interface DataModelConfig {
    Actor: {
      humanoid: typeof HumanoidActorSystem;
      pokemon: typeof PokemonActorSystem;
    };
  }

  interface SettingConfig {
    "ptr2e.clocks": typeof ClockDatabase,
    "ptr2e.skills": CustomSkill[],
    "ptr2e.pokemonTypes": PokemonType[],
  }

  interface AssumeHookRan {
    setup: never;
  }

  // Misc Type Helpers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type ConstructorOf<T> = new (...args: any[]) => T;
  type Maybe<T> = T | null | undefined;
  type SetElement<TSet extends Set<unknown>> = TSet extends Set<infer TElement> ? TElement : never;

  // Type Aliases
  type HexColorString = `#${string}`;
  type AudioFilePath = `${string}.${foundry.CONST.AUDIO_FILE_EXTENSIONS}`;
  type ImageFilePath = `${string}.${foundry.CONST.IMAGE_FILE_EXTENSIONS}`;
  type VideoFilePath = `${string}.${foundry.CONST.VIDEO_FILE_EXTENSIONS}`;
  type FilePath = AudioFilePath | ImageFilePath | VideoFilePath;

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
}