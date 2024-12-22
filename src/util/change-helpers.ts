import { ActorPTR2e, ActorSynthetics, EffectRoll } from "@actor";
import { ActionPTR2e, AttackPTR2e, ChangeModel } from "@data";
import { ActiveEffectPTR2e, BracketedValue, EffectSourcePTR2e } from "@effects";
import { ItemPTR2e, ItemSourcePTR2e } from "@item";
import {
  DeferredValueParams,
  ModifierAdjustment,
  ModifierPTR2e,
} from "@module/effects/modifiers.ts";
import { RollNote } from "@system/notes.ts";
import * as R from "remeda";

/** Extracts a list of all cloned modifiers across all given keys in a single list. */
function extractModifiers(
  synthetics: Pick<ActorSynthetics, "modifierAdjustments" | "modifiers">,
  selectors: string[],
  options: DeferredValueParams = {}
): ModifierPTR2e[] {
  const { modifierAdjustments, modifiers: syntheticModifiers } = synthetics;
  const modifiers = Array.from(new Set(selectors))
    .flatMap((s) => syntheticModifiers[s] ?? [])
    .flatMap((d) => d(options) ?? []);
  for (const modifier of modifiers) {
    modifier.adjustments = extractModifierAdjustments(
      modifierAdjustments,
      selectors,
      modifier.slug
    );
  }

  return modifiers;
}

async function extractTargetModifiers({
  origin,
  target,
  item,
  attack,
  action,
  domains,
  options,
}: Omit<ExtractEphemeralEffectsParams, 'affects'>): Promise<ModifierPTR2e[]> {
  if (!(origin && target)) return [];

  const fullOptions = [
    ...options,
    target.getRollOptions(domains),
    origin.getSelfRollOptions("origin"),
  ].flat();
  const resolvables = { item, attack, action };
  return (
    await Promise.all(
      domains
        .flatMap((s) => target.synthetics.ephemeralModifiers[s] ?? [])
        .map((d) => d({ test: fullOptions, resolvables }))
    )
  ).flatMap((e) => e ?? [])
    .map(m => {
      m.appliesTo = new Map([[target.uuid, true]]);
      return m;
    });
}

function extractModifierAdjustments(
  adjustmentsRecord: ActorSynthetics["modifierAdjustments"],
  selectors: string[],
  slug: string
): ModifierAdjustment[] {
  const adjustments = Array.from(new Set(selectors.flatMap((s) => adjustmentsRecord[s] ?? [])));
  return adjustments.filter((a) => [slug, null].includes(a.slug));
}

/** Extracts a list of all cloned notes across all given keys in a single list. */
function extractNotes(rollNotes: Record<string, RollNote[]>, selectors: string[]): RollNote[] {
  return selectors.flatMap((s) => (rollNotes[s] ?? []).map((n) => n.clone()));
}

// function extractDamageDice(
//     deferredDice: DamageDiceSynthetics,
//     selectors: string[],
//     options: TestableDeferredValueParams,
// ): DamageDicePTR2e[] {
//     return selectors.flatMap((s) => deferredDice[s] ?? []).flatMap((d) => d(options) ?? []);
// }

async function extractEphemeralEffects({
  affects,
  origin,
  target,
  item,
  attack,
  action,
  domains,
  options,
}: ExtractEphemeralEffectsParams): Promise<EffectSourcePTR2e[]> {
  if (!(origin && target)) return [];

  const [effectsFrom, effectsTo] = affects === "target" ? [origin, target] : [target, origin];
  const fullOptions = [
    ...options,
    effectsFrom.getRollOptions(domains),
    effectsTo.getSelfRollOptions(affects),
  ].flat();
  const resolvables = { item, attack, action, origin, target };
  return (
    await Promise.all(
      domains
        .flatMap((s) => {
          const toReturn = effectsFrom.synthetics.ephemeralEffects[s]?.[affects] ?? [];
          if (affects === "origin") return [...toReturn, ...(effectsTo.synthetics.ephemeralEffects[s]?.self ?? [])]
          return toReturn;
        })
        .map((d) => d({ test: fullOptions, resolvables })),
    )
  ).flatMap((e) => e ?? []);
}

async function extractEffectRolls({
  affects,
  origin,
  target,
  item,
  attack,
  action,
  domains,
  options,
  chanceModifier = 0,
  hasSenerenGrace = false,
}: Omit<ExtractEphemeralEffectsParams, 'affects'> & { affects: "self" | "origin" | "target", chanceModifier?: number, hasSenerenGrace?: boolean }): Promise<EffectRoll[]> {
  if (!(origin && target)) return [];

  const [effectsFrom, effectsTo] = affects === "target" ? [origin, target] : [target, origin];
  const fullOptions = [
    ...options,
    effectsFrom.getRollOptions(domains),
    effectsTo.getSelfRollOptions(affects),
  ].flat();
  const resolvables = { item, attack, action };
  const effectTargets = new Map<string, EffectRoll>();
  const effectRolls = (
    await Promise.all(
      domains
        .flatMap((s) => (affects === 'origin' ? target : origin).synthetics.effects[s]?.[affects] ?? [])
        .map((d) => d({ test: fullOptions, resolvables }))
    )
  ).reduce((acc, val): EffectRoll[] => {
    if(!val) return acc;
    const inMap = effectTargets.get(val.effect + (val.critOnly ? '-crit' : ''));
    const sameType = inMap?.critOnly === val.critOnly;
    if (!inMap) {
      effectTargets.set(val.effect + (val.critOnly ? '-crit' : ''), val);
      return [...acc, val];
    }
    if (inMap && sameType) {
      inMap.chance += val.chance;
    }
    return acc;
  }, [] as EffectRoll[]).flatMap((e) => {
    if (e) {
      e.chance = e.chance + chanceModifier;
      return e;
    }
    return [];
  });

  const effectIncreases = (
    await Promise.all(
      domains
        .flatMap((s) => (affects === 'origin' ? target : origin).synthetics.effects[s + "-effect-chance"]?.[affects] ?? [])
        .map((d) => d({ test: fullOptions, resolvables }))
    )
  ).flatMap(e => e ? e : []);

  for (const effectIncrease of effectIncreases) {
    const inMap = effectTargets.get(effectIncrease.effect);
    if (inMap) {
      inMap.chance += effectIncrease.chance;
    }
  }

  return (hasSenerenGrace ? effectRolls.map(e => {
    e.chance += e.chance;
    return e;
  }) : effectRolls).map(e => {
    if (e.effect.endsWith("-crit")) {
      e.effect = e.effect.slice(0, -5) as ItemUUID;
    }
    return e;
  });
}

interface ExtractEphemeralEffectsParams {
  affects: "target" | "origin";
  origin: ActorPTR2e | null;
  target: Maybe<ActorPTR2e>;
  item: ItemPTR2e | null;
  attack: AttackPTR2e | null;
  action: ActionPTR2e | null;
  domains: string[];
  options: Set<string> | string[];
}

// function extractRollSubstitutions(
//     substitutions: Record<string, RollSubstitution[]>,
//     domains: string[],
//     rollOptions: Set<string>
// ): RollSubstitution[] {
//     return domains
//         .flatMap((d) => fu.deepClone(substitutions[d] ?? []))
//         .filter((s) => s.predicate?.test(rollOptions) ?? true);
// }

// function extractDegreeOfSuccessAdjustments(
//     synthetics: Pick<ActorSynthetics, "degreeOfSuccessAdjustments">,
//     selectors: string[]
// ): DegreeOfSuccessAdjustment[] {
//     return Object.values(R.pick(synthetics.degreeOfSuccessAdjustments, selectors)).flat();
// }

function isBracketedValue(value: unknown): value is BracketedValue {
  return (
    R.isPlainObject(value) &&
    Array.isArray(value.brackets) &&
    (typeof value.field === "string" || !("fields" in value))
  );
}

async function processPreUpdateHooks(document: ActorPTR2e | ActiveEffectPTR2e | ItemPTR2e) {
  const actor = (() => {
    if (document instanceof ActorPTR2e) return document;
    if (document instanceof ActiveEffectPTR2e) return document.targetsActor() ? document.target : null;
    if (document instanceof ItemPTR2e) return document.actor;
    return null;
  })();
  if (!(actor instanceof ActorPTR2e)) return;

  // Run preUpdateActor rule element callbacks
  type WithPreUpdateActor = ChangeModel & {
    preUpdateActor: NonNullable<ChangeModel["preUpdateActor"]>;
  };
  const changes = actor.appliedEffects.flatMap(e => e.changes).filter((c): c is WithPreUpdateActor => !!(c as ChangeModel).preUpdateActor);
  if (changes.length === 0) return;

  // actor.flags.ptr2e.rollOptions = actor.clone(changed, { keepId: true }).flags.ptr2e.rollOptions;
  const createDeletes = (
    await Promise.all(
      changes.map(
        (c): Promise<{ create: ItemSourcePTR2e[]; delete: string[] } | { createEffects: EffectSourcePTR2e[]; deleteEffects: string[] }> => c.preUpdateActor()
      )
    )
  ).reduce(
    (combined: { create: ItemSourcePTR2e[]; delete: string[]; createEffects: EffectSourcePTR2e[]; deleteEffects: string[] }, cd) => {
      if ('create' in cd) {
        combined.create.push(...cd.create);
        combined.delete.push(...cd.delete);
      } else {
        combined.createEffects.push(...cd.createEffects);
        combined.deleteEffects.push(...cd.deleteEffects);
      }
      return combined;
    },
    { create: [], delete: [], createEffects: [], deleteEffects: [] }
  );
  createDeletes.delete = R.unique(createDeletes.delete).filter((id) => actor.items.has(id));

  if (createDeletes.create.length > 0) {
    await actor.createEmbeddedDocuments("Item", createDeletes.create, {
      keepId: true,
      render: true,
    });
  }
  if (createDeletes.delete.length > 0) {
    await actor.deleteEmbeddedDocuments("Item", createDeletes.delete, { render: true, ignoreRestricted: true });
  }
  if(createDeletes.createEffects.length > 0) {
    await actor.createEmbeddedDocuments("ActiveEffect", createDeletes.createEffects, {
      keepId: true,
      render: true,
    });
  }
  if(createDeletes.deleteEffects.length > 0) {
    await actor.deleteEmbeddedDocuments("ActiveEffect", createDeletes.deleteEffects, { render: true, ignoreRestricted: true});
  }
}

export {
  extractModifiers,
  extractModifierAdjustments,
  extractNotes,
  extractTargetModifiers,
  extractEphemeralEffects,
  isBracketedValue,
  extractEffectRolls,
  processPreUpdateHooks,
}
