import type { CombatantPTR2e } from "./document.ts";
import type { CharacterCombatantSystem } from "./models/character.ts";
import type { RoundCombatantSystem } from "./models/round.ts";
import type { SummonCombatantSchema, SummonCombatantSystem } from "./models/summon.ts";
import type { CombatantSystemPTR2e } from "./system.ts";
import type { CombatantSystemSchema } from "./system.ts";

export { default as CombatantPTR2e } from "./document.ts";

export * from "./models/index.ts";

export { default as CombatantSystemPTR2e } from "./system.ts";

declare global {
  namespace PTR {
    namespace Combatant {
      type Instance = CombatantPTR2e;
      type Source = foundry.data.fields.SchemaField.PersistedType<globalThis.Combatant.Schema>;
      type SystemSource = foundry.data.fields.SchemaField.PersistedType<CombatantSystemSchema>;
      type SourceWithSystem = Omit<Source, 'system'> & { system: SystemSource };
      type SystemInstance = CombatantSystemPTR2e;

      namespace System {
        namespace Character {
          type Schema = CombatantSystemSchema;
          type Instance = CharacterCombatantSystem;
          type Source = foundry.data.fields.SchemaField.PersistedType<CombatantSystemSchema>;
          type ParentInstance = PTR.Combatant.Instance & { type: "character", system: Instance };
          type ParentSource = PTR.Combatant.Source & { system: Source };
        }
        namespace Round {
          type Schema = CombatantSystemSchema;
          type Instance = RoundCombatantSystem;
          type Source = foundry.data.fields.SchemaField.PersistedType<CombatantSystemSchema>;
          type ParentInstance = PTR.Combatant.Instance & { type: "round", system: Instance };
          type ParentSource = PTR.Combatant.Source & { system: Source };
        }
        namespace Summon {
          type Schema = SummonCombatantSchema;
          type Instance = SummonCombatantSystem;
          type Source = foundry.data.fields.SchemaField.PersistedType<SummonCombatantSchema>;
          type ParentInstance = PTR.Combatant.Instance & { type: "summon", system: Instance };
          type ParentSource = PTR.Combatant.Source & { system: Source };
        }
      }
    }
  }
}