import type ActorPTR2e from "./base.ts";
import type { ActorSystemPTR2e, ActorSystemSchema } from "./data/system.ts";

type PTUActor = ActorPTR2e;
export type {PTUActor};

// Base
export {default as ActorPTR2e} from "./base.ts";

// Sheets
export {default as ActorSheetPTR2e} from "./sheet.ts";

// Systems
export * from "./data/index.ts";

// Other Data Models
export type * from "./data.ts";

declare global {
  namespace PTR {
    namespace Actor {
      type Source = foundry.data.fields.SchemaField.PersistedType<globalThis.Actor.Schema>;
      type SystemSource = foundry.data.fields.SchemaField.PersistedType<ActorSystemSchema>
      type SourceWithSystem = Omit<Source, 'system'> & { system: SystemSource }
      type SystemInstance = ActorSystemPTR2e
    }
  }
}