export { ActiveEffectSource, default as BaseActiveEffect } from "./active-effect.ts";
export { default as BaseActorDelta } from "./actor-delta.ts";
export { ActorFlags, ActorSource, default as BaseActor } from "./actor.ts";
export { AdventureSource, default as BaseAdventure } from "./adventure.ts";
export { default as BaseAmbientLight } from "./ambient-light.ts";
export { AmbientSoundSource, default as BaseAmbientSound } from "./ambient-sound.ts";
export { default as BaseCard, CardFaceData } from "./card.ts";
export { default as BaseCards } from "./cards.ts";
export { default as BaseChatMessage, ChatMessageFlags, ChatMessageSource, ChatSpeakerData } from "./chat-message.ts";
export { default as BaseCombat, CombatSource } from "./combat.ts";
export { default as BaseCombatant, CombatantSource } from "./combatant.ts";
export { default as BaseDrawing, DrawingSource } from "./drawing.ts";
export { default as BaseFogExploration, FogExplorationSource } from "./fog-exploration.ts";
export { default as BaseFolder, FolderSource } from "./folder.ts";
export { default as BaseItem, ItemFlags, ItemSchema, ItemSource } from "./item.ts";
export { default as BaseJournalEntryPage } from "./journal-entry-page.ts";
export { default as BaseJournalEntry, JournalEntrySource } from "./journal-entry.ts";
export { default as BaseMacro, MacroSource } from "./macro.ts";
export { default as BaseMeasuredTemplate, MeasuredTemplateSource } from "./measured-template.ts";
export { default as BaseNote, NoteSource } from "./note.ts";
export { default as BasePlaylistSound, PlaylistSoundSource } from "./playlist-sound.ts";
export { default as BasePlaylist } from "./playlist.ts";
export { default as BaseRollTable, RollTableSource } from "./roll-table.ts";
export { default as BaseScene, SceneSource } from "./scene.ts";
export { default as BaseSetting } from "./setting.ts";
export { default as BaseTableResult, TableResultSource } from "./table-result.ts";
export { default as BaseTile, TileSource } from "./tile.ts";
export { default as BaseToken, TokenSource } from "./token.ts";
export { default as BaseUser, UserSource } from "./user.ts";
export { default as BaseWall, WallSource } from "./wall.ts";
export const collections: {Actors: typeof Actors, Items: typeof Items}
export const modifyBatch: (batch: BatchUpdate[]) => Promise<void>;

export type BatchUpdate = {
  documentName: string;
  broadcast?: boolean;
  parent?: object | null;
  pack?: string | null;
  parentUuid?: string | null;
  dryRun?: boolean;
  modifiedTime?: number;
  noHook?: boolean;
} & ({
  action: "create";
  documentName: string;
  data: object[];
  keepId?: boolean;
  keepEmbeddedIds?: boolean;
  render?: boolean;
  controlObject?: boolean;
  renderSheet?: boolean;
} | {
  action: "update";
  documentName: string;
  updates: object[];
  diff?: boolean;
  recursive?: boolean;
  render?: boolean;
} | {
  action: "delete";
  documentName: string;
  ids: string[];
  deleteAll?: boolean;
  replacements?: Record<string, string>;
  noHook?: boolean;
})