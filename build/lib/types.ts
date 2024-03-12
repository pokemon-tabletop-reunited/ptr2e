// import { ActorPTR2e } from "@actor";
// import { ItemPTR2e } from "@item";

// type CompendiumDocumentPTR2e = ActorPTR2e | ItemPTR2e | JournalEntry | Macro | RollTable;
type CompendiumDocumentPTR2e = Actor | Item | JournalEntry | Macro | RollTable;
type PackEntry = CompendiumDocumentPTR2e['_source'];

export type { PackEntry }