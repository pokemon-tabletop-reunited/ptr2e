
import type ActiveEffectSystem from "../system.ts";
import type { RuleValue } from "../data.ts";
import type { RawPredicate } from "@system/predication/predication.ts";

interface ChangeModelOptions {
  parent: ActiveEffectSystem;
  strict?: boolean | undefined;
  sourceIndex?: number | undefined;
  suppressWarnings?: boolean | undefined;
}

interface ResolveValueParams {
  evaluate?: boolean;
  resolvables?: Record<string, unknown>;
  warn?: boolean;
}

// interface ChangeSchema extends foundry.data.fields.DataSchema {
//   // Core Foundry Fields
//   /** Key Field, different functionality for each Change Model */
//   key: foundry.data.fields.StringField<string, string, true, false, true>
//   /** Value Field, different functionality for each Change Model */
//   value: ResolvableValueField<true, false, true>
//   /** AE Application Mode, valid values are 0-5. See `CONST.ACTIVE_EFFECT_MODES` */
//   mode: foundry.data.fields.NumberField<ActiveEffectChangeMode, ActiveEffectChangeMode, false, false, true>
//   /** Unused Field */
//   priority: foundry.data.fields.NumberField;

//   // Custom Fields
//   /** The Type field, defining which type of change model this is. */
//   type: foundry.data.fields.StringField<string, string, true, false, true>;

//   /** Label field used for most modifier related Changes */
//   label: foundry.data.fields.StringField<string, string, false, false, true>;
//   /** @See[Predicate] */
//   predicate: PredicateField;
//   /** Whether this effect failed its predication or otherwise should be disabled. */
//   ignored: foundry.data.fields.BooleanField;
// };

interface ChangeSource {
  key: string;
  value: RuleValue;
  mode: number;
  priority?: number | null;
  type: string;
  label?: string;
  predicate?: RawPredicate;
  ignored?: boolean;
  [key: string]: unknown;
}

export type {
  ChangeModelOptions,
  ChangeSource,
  ResolveValueParams,
}