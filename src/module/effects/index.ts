import { BaseEffectSourcePTR2e } from './data.ts';

export {default as ActiveEffectPTR2e } from './document.ts';

export {default as ActiveEffectSystem } from './system.ts';

export type EffectSourcePTR2e = 
    | BaseEffectSourcePTR2e<'passive'>
    | BaseEffectSourcePTR2e<'affliction'>;

export type * from './data.ts';