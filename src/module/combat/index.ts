import type CombatSystem from "./system.ts";
import type { CombatSystemSchema } from "./system.ts";

// Base
export {default as CombatPTR2e} from "./document.ts";
export {default as CombatSystemPTR2e} from "./system.ts";

// Combatant
export * from "./combatant/index.ts";

// Tracker
export {default as CombatTrackerPTR2e} from "./tracker.ts";

// Other Data Models

declare global {
  namespace PTR {
    namespace Combat {
      type Source = foundry.data.fields.SchemaField.PersistedType<globalThis.Combat.Schema>;
      type SystemSource = foundry.data.fields.SchemaField.PersistedType<CombatSystemSchema>;
      type SourceWithSystem = Omit<Source, 'system'> & { system: SystemSource };
      type SystemInstance = CombatSystem;
    }
  }
}