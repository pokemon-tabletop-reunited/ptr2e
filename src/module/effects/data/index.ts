import type { AfflictionActiveEffectSystem, AfflictionSystemSchema } from './affliction.ts';
import type { FormActiveEffectSchema, FormActiveEffectSystem } from './form.ts';
import type { PassiveActiveEffectSystem } from './passive.ts';
import type { SummonActiveEffectSystem } from './summon.ts';

export { default as AfflictionActiveEffectSystem } from './affliction.ts';
export { default as PassiveActiveEffectSystem } from './passive.ts';
export { default as SummonActiveEffectSystem } from './summon.ts';
export { default as FormActiveEffectSystem } from './form.ts';

declare global {
  namespace PTR {
    namespace ActiveEffect {
      namespace System {
        namespace Affliction {
          type Schema = AfflictionSystemSchema;
          type Instance = AfflictionActiveEffectSystem;
          type Source = foundry.data.fields.SchemaField.PersistedType<AfflictionSystemSchema>;
          type ParentSource = Omit<ActiveEffect.Source, 'system'> & { system: Source };
          type ParentInstance = globalThis.ActiveEffect.ConfiguredInstance & {system: Instance};
        }
        namespace Passive {
          type Schema = ActiveEffect.SystemSchema
          type Instance = PassiveActiveEffectSystem;
          type Source = foundry.data.fields.SchemaField.PersistedType<ActiveEffect.SystemSchema>;
          type ParentSource = Omit<ActiveEffect.Source, 'system'> & { system: Source };
          type ParentInstance = globalThis.ActiveEffect.ConfiguredInstance & {system: Instance};          
        }
        namespace Summon {
          type Schema = ActiveEffect.SystemSchema
          type Instance = SummonActiveEffectSystem;
          type Source = foundry.data.fields.SchemaField.PersistedType<ActiveEffect.SystemSchema>;
          type ParentSource = Omit<ActiveEffect.Source, 'system'> & { system: Source };
          type ParentInstance = globalThis.ActiveEffect.ConfiguredInstance & {system: Instance};
        }
        namespace Form {
          type Schema = FormActiveEffectSchema
          type Instance = FormActiveEffectSystem;
          type Source = foundry.data.fields.SchemaField.PersistedType<FormActiveEffectSchema>;
          type ParentSource = Omit<ActiveEffect.Source, 'system'> & { system: Source };
          type ParentInstance = globalThis.ActiveEffect.ConfiguredInstance & {system: Instance};
        }
      }
    }
  }
}