import { ChatMessagePTR2e } from "@chat";
import { ConsumablePTR2e } from "@item";
import { ModifierPopup } from "@module/apps/modifier-popup/modifier-popup.ts";
import { CheckModifier } from "@module/effects/modifiers.ts";
import { RollNote } from "@system/notes.ts";
import { CheckRoll, CheckRollCallback } from "@system/rolls/check-roll.ts";
import { CheckRollContext } from "@system/rolls/data.ts";
import { DegreeOfSuccess } from "@system/rolls/degree-of-success.ts";
import { sluggify } from "@utils";
import { eventToRollParams } from "src/util/sheet-util.ts";
import { CheckContext } from "./data.ts";

class CheckPTR2e {
    static async rolls(
        context: Omit<CheckRollContext, 'target' | 'targets'> & {contexts: Record<string, CheckContext>},
        event: JQuery.TriggeredEvent | Event | null = null,
        callback?: CheckRollCallback
    ): Promise<Rolled<CheckRoll>[]> {
        throw new Error("Method not implemented." + context + event + callback);
    }

    static async roll(
        check: CheckModifier,
        context: CheckRollContext = {},
        event: JQuery.TriggeredEvent | Event | null = null,
        callback?: CheckRollCallback
    ): Promise<Rolled<CheckRoll> | null> {
        // If event is supplied, merge into context
        // Eventually the event parameter will go away entirely
        if (event) fu.mergeObject(context, eventToRollParams(event, { type: "check" }));
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

            if(!dialog) {
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
            breakdown: check.breakdown
        };

        const roll = await CheckRoll.createFromData(options).evaluate();

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

        const message: Maybe<ChatMessagePTR2e> = await (() => {
            if (!context.createMessage) return null;

            return ChatMessagePTR2e.createFromRoll(messageContext, roll);
        })();

        if (callback) {
            await callback(
                roll,
                context.outcome,
                message,
                !!event && event instanceof Event ? event : event?.originalEvent ?? null
            );
        }

        const item = context.item ?? null;
        if (
            item &&
            item.type === "consumable" &&
            item.actor.items.has(item.id) &&
            (item as ConsumablePTR2e).system.charges.value > 0
        ) {
            await item.update({
                "system.charges.value": (item as ConsumablePTR2e).system.charges.value - 1,
            });
        }

        return roll;
    }
}

export { CheckPTR2e };
