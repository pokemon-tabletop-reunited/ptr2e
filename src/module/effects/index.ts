import type ActiveEffectSystem from './system.ts';
import type { ActiveEffectSystemSchema } from './system.ts';

export {default as ActiveEffectPTR2e } from './document.ts';

export {default as ActiveEffectSystem } from './system.ts';

export type * from './data.ts';

declare global {
  namespace PTR {
    namespace ActiveEffect {
      type Source = foundry.data.fields.SchemaField.PersistedType<globalThis.ActiveEffect.Schema>;
      type SystemSource = foundry.data.fields.SchemaField.PersistedType<ActiveEffectSystemSchema>
      type SourceWithSystem = Omit<Source, 'system'> & { system: SystemSource }
      type SystemInstance = ActiveEffectSystem
    }
  }
}