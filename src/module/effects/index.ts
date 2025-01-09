import type {
  ModifierPTR2e,
  RawModifier,
  ModifierAdjustment, 
  DeferredValue as _DeferredValue, 
  DeferredPromise as _DeferredPromise, 
  DeferredValueParams as _DefferedValueParams, 
  TestableDeferredValueParams as _TestableDeferredValueParams,
  StatisticModifier,
  CheckModifier,
  AttackCheckModifier
} from './modifiers.ts';
import type ActiveEffectSystem from './system.ts';
import type { ActiveEffectSystemSchema } from './system.ts';

export { default as ActiveEffectPTR2e } from './document.ts';

export { default as ActiveEffectSystem } from './system.ts';

export type * from './data.ts';

declare global {
  namespace PTR {
    namespace ActiveEffect {
      type Source = foundry.data.fields.SchemaField.PersistedType<globalThis.ActiveEffect.Schema>;
      type SystemSchema = ActiveEffectSystemSchema;
      type SystemSource = foundry.data.fields.SchemaField.PersistedType<SystemSchema>
      type SourceWithSystem = Omit<Source, 'system'> & { system: SystemSource }
      type SystemInstance = ActiveEffectSystem
    }
    namespace Models {
      namespace Modifier {
        type Instance = ModifierPTR2e;
        type Source = RawModifier;
        type Adjustment = ModifierAdjustment;
  
        type DeferredValue<T> = _DeferredValue<T>;
        type DeferredPromise<T> = _DeferredPromise<T>;
        type DefferedValueParams = _DefferedValueParams;
        type TestableDeferredValueParams = _TestableDeferredValueParams;

        namespace Statistic {
          type Instance = StatisticModifier;

          type Check = CheckModifier;
          type AttackCheck = AttackCheckModifier;
        }
      }
    }
  }
}