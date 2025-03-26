import type ClockPanel from "./apps/clock-panel";
import type ClockDatabase from "./data/models/clock-db";

export {};

declare global {
  interface Game {
    ptr: {
      clocks: {
        db: typeof ClockDatabase;
        panel: ClockPanel;
      }
    }
  }

  interface SettingConfig {
    "ptr2e.clocks": ClockDatabase
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