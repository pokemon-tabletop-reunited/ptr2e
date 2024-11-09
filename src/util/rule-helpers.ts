import { ActorPTR2e, ActorSynthetics, EffectRoll } from "@actor";
import { ActionPTR2e, AttackPTR2e } from "@data";
import { BracketedValue, EffectSourcePTR2e } from "@effects";
import { ItemPTR2e } from "@item";
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
    const resolvables = { item, attack, action };
    return (
        await Promise.all(
            domains
                .flatMap((s) => effectsFrom.synthetics.ephemeralEffects[s]?.[affects] ?? [])
                .map((d) => d({ test: fullOptions, resolvables }))
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
}: Omit<ExtractEphemeralEffectsParams, 'affects'> & {affects: "self" | "origin" | "target", chanceModifier?: number, hasSenerenGrace?: boolean}): Promise<EffectRoll[]> {
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
    ).flatMap((e) => {
        if (e) {
            e.chance = e.chance + chanceModifier;
            return e;
        }
        return [];
    }).reduce((acc, val): EffectRoll[] => {
      const inMap = effectTargets.get(val.effect);
      if(!inMap) {
        effectTargets.set(val.effect, val);
        return [...acc, val];
      }
      if(inMap) {
        inMap.chance += val.chance;
      }
      return acc;
    }, [] as EffectRoll[]);

    const effectIncreases = (
      await Promise.all(
        domains
                .flatMap((s) => (affects === 'origin' ? target : origin).synthetics.effects[s+"-effect-chance"]?.[affects] ?? [])
                .map((d) => d({ test: fullOptions, resolvables }))
      )
    ).flatMap(e => e ? e : []);

    for(const effectIncrease of effectIncreases) {
      const inMap = effectTargets.get(effectIncrease.effect);
      if(inMap) {
        inMap.chance += effectIncrease.chance;
      }
    }
    
    return hasSenerenGrace ? effectRolls.map(e => {
      e.chance += e.chance;
      return e;
    }) : effectRolls;
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

// async function processPreUpdateActorHooks(
//     changed: Record<string, unknown>,
//     { pack }: { pack: string | null }
// ): Promise<void> {
//     const actorId = String(changed._id);
//     const actor = pack
//         ? await game.packs.get(pack)?.getDocument(actorId)
//         : game.actors.get(actorId);
//     if (!(actor instanceof ActorPTR2e)) return;

//     // Run preUpdateActor rule element callbacks
//     type WithPreUpdateActor = ChangeModel & {
//         preUpdateActor: NonNullable<ChangeModel["preUpdateActor"]>;
//     };
//     const rules = actor.rules.filter((r): r is WithPreUpdateActor => !!r.preUpdateActor);
//     if (rules.length === 0) return;

//     actor.flags.ptr2e.rollOptions = actor.clone(changed, { keepId: true }).flags.ptr2e.rollOptions;
//     const createDeletes = (
//         await Promise.all(
//             rules.map(
//                 (r): Promise<{ create: ItemSourcePTR2e[]; delete: string[] }> =>
//                     actor.items.has(r.item.id)
//                         ? r.preUpdateActor()
//                         : new Promise(() => ({ create: [], delete: [] }))
//             )
//         )
//     ).reduce(
//         (combined, cd) => {
//             combined.create.push(...cd.create);
//             combined.delete.push(...cd.delete);
//             return combined;
//         },
//         { create: [], delete: [] }
//     );
//     createDeletes.delete = R.uniq(createDeletes.delete).filter((id) => actor.items.has(id));

//     if (createDeletes.create.length > 0) {
//         await actor.createEmbeddedDocuments("Item", createDeletes.create, {
//             keepId: true,
//             render: false,
//         });
//     }
//     if (createDeletes.delete.length > 0) {
//         await actor.deleteEmbeddedDocuments("Item", createDeletes.delete, { render: false });
//     }
// }

export {
    extractModifiers,
    extractModifierAdjustments,
    extractNotes,
    extractEphemeralEffects,
    isBracketedValue,
    extractEffectRolls,
}
