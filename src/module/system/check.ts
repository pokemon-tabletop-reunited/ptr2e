import { ChatMessagePTR2e } from "@chat";
import { ConsumablePTR2e } from "@item";
import { ModifierPopup } from "@module/apps/modifier-popup/modifier-popup.ts";
import { AttackCheckModifier, CheckModifier, ModifierPTR2e } from "@module/effects/modifiers.ts";
import { RollNote } from "@system/notes.ts";
import {
    AttackRollCallback,
    AttackRollResult,
    CheckRoll,
    CheckRollCallback,
    PokeballRollCallback,
    PokeballRollResults,
} from "@system/rolls/check-roll.ts";
import { CheckRollContext } from "@system/rolls/data.ts";
import { DegreeOfSuccess } from "@system/rolls/degree-of-success.ts";
import { sluggify } from "@utils";
import { CheckContext } from "./data.ts";
import { AttackModifierPopup } from "@module/apps/modifier-popup/attack-modifier-popup.ts";
import { AttackRoll, AttackRollCreationData, AttackRollDataPTR2e } from "./rolls/attack-roll.ts";
import { CaptureRoll, CaptureRollCreationData } from "./rolls/capture-roll.ts";
import { ConsumableSystemModel } from "@item/data/index.ts";
import { ActorPTR2e } from "@actor";
import { ActiveEffectPTR2e } from "@effects";

class CheckPTR2e {
    static async rollPokeball(
        check: AttackCheckModifier,
        context: CheckRollContext,
        callback?: PokeballRollCallback
    ): Promise<PokeballRollResults | null> {
        // TODO: Add user setting
        context.skipDialog ??= false;
        context.createMessage ??= true;

        const rollOptions = context.options ?? new Set();

        // Figure out the default roll mode (if not already set by the event)
        if (rollOptions.has("secret")) context.rollMode ??= game.user.isGM ? "gmroll" : "blindroll";
        context.rollMode ??= "roll";

        if (rollOptions.size > 0 && !context.isReroll) {
            check.calculateTotal(rollOptions);
        }

        if (!context.skipDialog) {
            // Show dialog for adding/editing modifiers, unless skipped or flat check
            const dialog = await new ModifierPopup(check, context).wait();

            if (!dialog) {
                return null;
            }
            context.rollMode = dialog.rollMode ?? context.rollMode;
        }

        const isReroll = context.isReroll ?? false;

        const options = {
            type: context.type,
            identifier: context.identifier,
            action: context.action ? sluggify(context.action) || null : null,
            domains: context.domains,
            isReroll,
            totalModifier: check.totalModifier,
            damaging: !!context.damaging,
            rollerId: game.userId,
            showBreakdown: !!context.actor?.hasPlayerOwner,
            breakdown: check.breakdown,
        };

        const data: CaptureRollCreationData = {
            check,
            ballBonus: (context.item?.system instanceof ConsumableSystemModel && context.item.system.consumableType === "pokeball" ? context.item.system.modifier : 1) || 1,
            critBonus: 1,
            miscBonus: 1,
            target: context.target?.actor,
            user: context.actor
        }

        const rolls: PokeballRollResults["rolls"] = await (async () => {
            const [accuracy, crit, shake1, shake2, shake3, shake4] = await Promise.all([
                CaptureRoll.createFromData(options, data, "accuracy")?.evaluate() ?? null,
                CaptureRoll.createFromData(options, data, "crit")?.evaluate() ?? null,
                CaptureRoll.createFromData(options, data, "shake1")?.evaluate() ?? null,
                CaptureRoll.createFromData(options, data, "shake2")?.evaluate() ?? null,
                CaptureRoll.createFromData(options, data, "shake3")?.evaluate() ?? null,
                CaptureRoll.createFromData(options, data, "shake4")?.evaluate() ?? null,
            ]);
            return {
                accuracy,
                crit,
                shake1,
                shake2,
                shake3,
                shake4,
            };
        })();

        const degrees: PokeballRollResults['degrees'] = {
            accuracy: rolls.accuracy
                ? DegreeOfSuccess.create(rolls.accuracy)
                : null,
            crit: rolls.crit
                ? DegreeOfSuccess.create(rolls.crit)
                : null,
            shake1: rolls.shake1
                ? DegreeOfSuccess.create(rolls.shake1)
                : null,
            shake2: rolls.shake2
                ? DegreeOfSuccess.create(rolls.shake2)
                : null,
            shake3: rolls.shake3
                ? DegreeOfSuccess.create(rolls.shake3)
                : null,
            shake4: rolls.shake4
                ? DegreeOfSuccess.create(rolls.shake4)
                : null,
        };

        const results: PokeballRollResults = {
            rolls,
            degrees,
            options,
            context,
            check,
        };

        const notes =
            context.notes
                ?.map((n) => (n instanceof RollNote ? n : new RollNote(n)))
                .filter((note) => {
                    if (
                        !note.predicate.test([
                            ...rollOptions,
                            ...(note.change?.item?.getRollOptions("parent") ?? []),
                        ])
                    ) {
                        return false;
                    }

                    // Always show the note if the check has no DC or no outcome is specified
                    return true;
                }) ?? [];
        const notesList = RollNote.notesToHTML(notes);

        const messageContext: CheckRollContext & {
            notesList?: HTMLUListElement | null;
        } = {
            notesList,
            type: context.type,
            identifier: context.identifier,
            action: context.action,
            title: context.title,
            actor: context.actor,
            token: context.token,
            item: context.item,
            options: context.options,
            target: context.target,
            notes: context.notes,
            domains: context.domains,
            damaging: context.damaging,
            createMessage: context.createMessage,
            modifiers: check.modifiers
        };

        const message = await (() => {
            if (!context.createMessage) return null;

            return ChatMessagePTR2e.createFromPokeballResults(messageContext, results);
        })();

        if (callback) {
            await callback(context, results, message);
        }

        const item = context.item ?? null;
        if (
            item &&
            item.type === "consumable" &&
            item.actor.items.has(item.id) &&
            (item as ConsumablePTR2e).system.quantity > 0
        ) {
            const newQuantity = (item as ConsumablePTR2e).system.quantity - 1;
            if (newQuantity > 0) {
                await item.update({
                    "system.quantity": newQuantity,
                });
            } else {
                await item.delete();
            }
        }

        return results;
    }

    static async rolls(
        check: CheckModifier,
        context: Omit<CheckRollContext, "target" | "targets"> & {
            contexts: Record<string, CheckContext>;
        },
        callback?: AttackRollCallback
    ): Promise<AttackRollResult["rolls"][] | null> {
        // TODO: Add user setting
        context.skipDialog ??= false;
        context.createMessage ??= true;

        const sharedModifiers = new Collection<ModifierPTR2e>();
        for (const targetContext of Object.values(context.contexts)) {
            if (targetContext.self.modifiers?.length) {
                for (const modifier of targetContext.self.modifiers) {
                    const slug = modifier.slug.split("-unicqi-")[0];

                    let handled = false;
                    for (const sharedModifier of sharedModifiers.filter((sm) =>
                        sm.slug.startsWith(slug)
                    )) {
                        if (modifier.value !== sharedModifier.value) continue;
                        for (const [uuid, enabled] of modifier.appliesTo.entries()) {
                            sharedModifier.appliesTo.set(uuid, enabled);
                        }
                        handled = true;
                    }
                    if (handled) continue;

                    sharedModifiers.set(modifier.slug, modifier);
                }
            }
        }

        for (const modifier of sharedModifiers.values()) {
            let ignored = true;
            for (const uuid of modifier.appliesTo.keys()) {
                const rollOptions = new Set(
                    [
                        ...(context.options ?? []),
                        ...(context.contexts[uuid]?.options ?? []),
                        ...(modifier.change?.getRollOptions() ?? []),
                    ].flat()
                );

                if (rollOptions.size > 0) {
                    const enabled = modifier.predicate.test(rollOptions);
                    modifier.appliesTo.set(uuid, enabled);
                    if (ignored && enabled) ignored = false;
                }
            }
            modifier.ignored = ignored;
        }

        const rollOptions = context.options ?? new Set();

        // Figure out the default roll mode (if not already set by the event)
        if (rollOptions.has("secret")) context.rollMode ??= game.user.isGM ? "gmroll" : "blindroll";
        context.rollMode ??= "roll";

        if (rollOptions.size > 0 && !context.isReroll) {
            check.calculateTotal(rollOptions);
        }

        if (!context.skipDialog) {
            // Show dialog for adding/editing modifiers, unless skipped or flat check
            const dialog = await new AttackModifierPopup(check, sharedModifiers, context).wait();

            if (!dialog) {
                return null;
            }
            context.rollMode = dialog.rollMode ?? context.rollMode;
        }

        const isReroll = context.isReroll ?? false;

        const results: AttackRollResult[] = [];
        for (const [uuid, targetContext] of Object.entries(context.contexts) as [
            ActorUUID,
            CheckContext,
        ][]) {
            const targetCheck = (() => {
                const modifiers = sharedModifiers.filter((m) => m.appliesTo.get(uuid) ?? false);
                return new AttackCheckModifier(`${check.slug}-${uuid}`, check, modifiers);
            })();

            const skippedRolls = new Set(
                [
                    ...(context.omittedSubrolls ?? []),
                    ...(targetContext.omittedSubrolls ?? []),
                ].flat()
            );

            const data: AttackRollCreationData = {
                attack: targetContext.self.attack,
                check: targetCheck,
            };

            const options: AttackRollDataPTR2e = {
                type: context.type,
                identifier: context.identifier,
                action: context.action ? sluggify(context.action) || null : null,
                domains: context.domains,
                isReroll,
                totalModifier: targetCheck.totalModifier,
                damaging: !!context.damaging,
                rollerId: game.userId,
                showBreakdown: !!context.actor?.hasPlayerOwner,
                breakdown: targetCheck.breakdown,
                attack: targetContext.self.attack,
                rip: !!targetContext.target?.rangeIncrement,
                outOfRange: !!targetContext.outOfRange,
            };

            const rolls: {
                accuracy: Rolled<CheckRoll> | null;
                crit: Rolled<CheckRoll> | null;
                damage: Rolled<CheckRoll> | null;
            } = await (async () => {
                const [accuracy, crit, damage] = await Promise.all([
                    skippedRolls.has("accuracy")
                        ? null
                        : AttackRoll.createFromData(data, options, "accuracy")?.evaluate() ?? null,
                    skippedRolls.has("crit")
                        ? null
                        : AttackRoll.createFromData(data, options, "crit")?.evaluate() ?? null,
                    skippedRolls.has("damage")
                        ? null
                        : AttackRoll.createFromData(data, options, "damage")?.evaluate() ?? null,
                ]);
                return { accuracy, crit, damage };
            })();

            const degrees: {
                accuracy: DegreeOfSuccess | null;
                crit: DegreeOfSuccess | null;
                damage: DegreeOfSuccess | null;
            } = {
                accuracy: rolls.accuracy
                    ? DegreeOfSuccess.create(rolls.accuracy)
                    : null,
                crit: rolls.crit ? DegreeOfSuccess.create(rolls.crit) : null,
                damage: rolls.damage ? DegreeOfSuccess.create(rolls.damage) : null,
            };

            const notes =
                targetContext.notes
                    ?.map((n) => (n instanceof RollNote ? n : new RollNote(n)))
                    .filter((note) => {
                        if (
                            !note.predicate.test([
                                ...rollOptions,
                                ...(note.change?.item?.getRollOptions("parent") ?? []),
                            ])
                        ) {
                            return false;
                        }

                        // Always show the note if the check has no DC or no outcome is specified
                        return true;
                    }) ?? [];
            const notesList = RollNote.notesToHTML(notes);

            for(const effectRoll of targetContext.effectRolls.origin) {
              effectRoll.roll = await new Roll("1d100ms@dc", {dc: effectRoll.chance}).roll();
              effectRoll.success = effectRoll.roll.total <= 0;
            }
            for(const effectRoll of targetContext.effectRolls.target) {
              effectRoll.roll = await new Roll("1d100ms@dc", {dc: effectRoll.chance}).roll();
              effectRoll.success = effectRoll.roll.total <= 0;
            }

            const messageContext: CheckRollContext & {
                notesList?: HTMLUListElement | null;
            } = {
                notesList,
                type: context.type,
                identifier: context.identifier,
                action: context.action,
                title: context.title,
                actor: targetContext.self.actor,
                token: targetContext.self.token,
                item: targetContext.self.item,
                options: targetContext.options,
                target: targetContext.target,
                notes: targetContext.notes,
                domains: context.domains,
                damaging: context.damaging,
                createMessage: context.createMessage,
                effectRolls: targetContext.effectRolls
            };

            results.push({
                rolls,
                degrees,
                options,
                context: messageContext,
                check: targetCheck,
            });
        }

        if(context.ppCost && context.consumePP) {
            const actor = await fromUuid<ActorPTR2e>(context.actor?.uuid) ?? game.actors.get(context.actor?.id);
            if(actor) {
                const pp = actor.system.powerPoints.value;
                await actor.update({
                    "system.powerPoints.value": Math.max(0, pp - context.ppCost),
                });
                ui.notifications.info(`You have ${pp - context.ppCost} power points remaining. (Used ${context.ppCost})`);
            }
        }

        const effectsToApply: ActiveEffectPTR2e['_source'][] = [];
        if(context.selfEffectRolls?.length) {
          for(const effectRoll of context.selfEffectRolls) {
            effectRoll.roll ??= await new Roll("1d100ms@dc", {dc: effectRoll.chance}).roll();
            effectRoll.success = effectRoll.roll.total <= 0;
            if(effectRoll.success) {
              const item = await fromUuid(effectRoll.effect);
              if(!item || item.type !== "effect") {
                console.error(`Failed to find effect item with uuid ${effectRoll.effect}`);
                continue;
              }

              effectsToApply.push(...item.toObject().effects as ActiveEffectPTR2e['_source'][]);
            }
          }
        }

        const message = await (() => {
            if (!context.createMessage) return null;

            return ChatMessagePTR2e.createFromResults(context, results);
        })();

        if (callback) {
            await callback(context, results, message);
        }

        const item = context.item ?? null;
        if (
            item &&
            item.type === "consumable" &&
            item.actor.items.has(item.id) &&
            (item as ConsumablePTR2e).system.quantity > 0
        ) {
            const newQuantity = (item as ConsumablePTR2e).system.quantity - 1;
            if (newQuantity > 0) {
                await item.update({
                    "system.quantity": newQuantity,
                });
            } else {
                await item.delete();
            }
        }

        if(effectsToApply.length) {
          await context.actor?.applyRollEffects(effectsToApply);
        }

        return results.map((r) => r.rolls);
    }

    static async roll(
        check: CheckModifier,
        context: CheckRollContext = {},
        callback?: CheckRollCallback
    ): Promise<Rolled<CheckRoll> | null> {
        // TODO: Add user setting
        context.skipDialog ??= false;
        context.createMessage ??= true;

        const rollOptions = context.options ?? new Set();

        // Figure out the default roll mode (if not already set by the event)
        if (rollOptions.has("secret")) context.rollMode ??= game.user.isGM ? "gmroll" : "blindroll";
        context.rollMode ??= "roll";

        if (rollOptions.size > 0 && !context.isReroll) {
            check.calculateTotal(rollOptions);
        }

        if (!context.skipDialog) {
            // Show dialog for adding/editing modifiers, unless skipped or flat check
            const dialog = await new ModifierPopup(check, context).wait();

            if (!dialog) {
                return null;
            }
            context.rollMode = dialog.rollMode ?? context.rollMode;
        }

        const isReroll = context.isReroll ?? false;

        const options = {
            type: context.type,
            identifier: context.identifier,
            action: context.action ? sluggify(context.action) || null : null,
            domains: context.domains,
            isReroll,
            totalModifier: check.totalModifier,
            damaging: !!context.damaging,
            rollerId: game.userId,
            showBreakdown: !!context.actor?.hasPlayerOwner,
            breakdown: check.breakdown,
        };

        const roll = await CheckRoll.createFromData(options)!.evaluate();

        const degree = context.dc ? new DegreeOfSuccess(roll) : null;
        if (degree) {
            context.outcome = degree.value;
            context.unadjustedOutcome = degree.unadjusted;
            roll.options.degreeOfSuccess = degree.value;
        }

        const notes =
            context.notes
                ?.map((n) => (n instanceof RollNote ? n : new RollNote(n)))
                .filter((note) => {
                    if (
                        !note.predicate.test([
                            ...rollOptions,
                            ...(note.change?.item?.getRollOptions("parent") ?? []),
                        ])
                    ) {
                        return false;
                    }

                    // Always show the note if the check has no DC or no outcome is specified
                    if (!context.dc || note.outcome.length === 0) return true;

                    const outcome = context.outcome ?? context.unadjustedOutcome;
                    return !!(outcome && note.outcome.includes(outcome));
                }) ?? [];
        const notesList = RollNote.notesToHTML(notes);

        const messageContext: CheckRollContext & {
            notesList?: HTMLUListElement | null;
        } = context;
        messageContext.notesList = notesList;
        messageContext.modifiers = check.modifiers;

        const message: Maybe<ChatMessagePTR2e> = await (() => {
            if (!context.createMessage) return null;

            return ChatMessagePTR2e.createFromRoll(messageContext, roll);
        })();

        if (callback) {
            await callback(roll, context.outcome, message);
        }

        const item = context.item ?? null;
        if (
            item &&
            item.type === "consumable" &&
            item.actor.items.has(item.id) &&
            (item as ConsumablePTR2e).system.quantity > 0
        ) {
            const newQuantity = (item as ConsumablePTR2e).system.quantity - 1;
            if (newQuantity > 0) {
                await item.update({
                    "system.quantity": newQuantity,
                });
            } else {
                await item.delete();
            }
        }

        return roll;
    }
}

export { CheckPTR2e };
