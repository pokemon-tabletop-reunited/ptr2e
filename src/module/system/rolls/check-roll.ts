import { ChatMessagePTR2e } from "@chat";
import { DegreeOfSuccess } from "./degree-of-success.ts";
import { CheckRollContext } from "./data.ts";
import { CheckModifier } from "@module/effects/modifiers.ts";
import { AttackRollDataPTR2e } from "./attack-roll.ts";
import { CheckContext } from "@system/data.ts";

class CheckRoll extends Roll {
    static createFromData(options: CheckRollDataPTR2e): CheckRoll | null {
        const { formula, data } = CheckRoll.createFormula(options);
        return new CheckRoll(formula, data, options);
    }

    static createFormula(options: CheckRollDataPTR2e): {
        formula: string;
        data: Record<string, unknown>;
    } {
        switch (options.type ?? "check") {
            case "check":
                return CheckRoll.createCheckFormula(options);
            case "attack-roll":
                return CheckRoll.createAttackRollFormula(options);
            case "skill-check":
            case "luck-check":
                return CheckRoll.createSkillCheckFormula(options);
            case "luck-roll":
                return { formula: "1d6+4", data: { type: "luck-roll" } };
            case "pokeball-check":
                return { formula: "1d100", data: { type: "pokeball-check" } };
        }
    }

    static createSkillCheckFormula(options: CheckRollDataPTR2e): {
        formula: string;
        data: Record<string, unknown>;
    } {
        const formula = "1d100ms@modifier";
        const data = {
            modifier: options.totalModifier ?? 0,
            type: "skill-check",
            breakdown: options.showBreakdown ? options.breakdown : null,
        };

        return { formula, data };
    }

    static createCheckFormula(options: CheckRollDataPTR2e): {
        formula: string;
        data: Record<string, unknown>;
    } {
        const formula = "1d100ms+modifier";
        const data = {
            modifier: options.totalModifier ?? 0,
            type: "check",
            breakdown: options.showBreakdown ? options.breakdown : null,
        };

        return { formula, data };
    }

    static createAttackRollFormula(options: CheckRollDataPTR2e): {
        formula: string;
        data: Record<string, unknown>;
    } {
        const formula = "1d100";
        const data = {
            type: "attack-roll",
            breakdown: options.showBreakdown ? options.breakdown : null,
        };

        return { formula, data };
    }
}

interface CheckRoll extends Roll {
    data: CheckRollDataPTR2e;
}

interface RollDataPTR2e extends RollOptions {
    rollerId?: string;
    totalModifier?: number;
    /** Whether to show roll formula and tooltip to players */
    showBreakdown?: boolean;
    breakdown?: string;
}

interface CheckRollDataPTR2e extends RollDataPTR2e {
    type?: CheckType;
    /** A string of some kind to help system API identify the roll */
    identifier?: Maybe<string>;
    /** The slug of an action associated with this roll */
    action?: Maybe<string>;
    isReroll?: boolean;
    degreeOfSuccess?: number;
    /** Whether the check is part of a damaging action */
    damaging?: boolean;
    domains?: string[];
}

interface AttackRollResult {
    rolls: {
        accuracy: Rolled<CheckRoll> | null;
        crit: Rolled<CheckRoll> | null;
        damage: Rolled<CheckRoll> | null;
    };
    degrees: {
        accuracy: DegreeOfSuccess | null;
        crit: DegreeOfSuccess | null;
        damage: DegreeOfSuccess | null;
    };
    options: AttackRollDataPTR2e;
    context: CheckRollContext;
    check: CheckModifier;
}

interface PokeballRollResults {
    rolls: {
        accuracy: Rolled<CheckRoll> | null;
        crit: Rolled<CheckRoll> | null;
        shake1: Rolled<CheckRoll> | null;
        shake2: Rolled<CheckRoll> | null;
        shake3: Rolled<CheckRoll> | null;
        shake4: Rolled<CheckRoll> | null;
    };
    degrees: {
        accuracy: DegreeOfSuccess | null;
        crit: DegreeOfSuccess | null;
        shake1: DegreeOfSuccess | null;
        shake2: DegreeOfSuccess | null;
        shake3: DegreeOfSuccess | null;
        shake4: DegreeOfSuccess | null;
    };
    options: CheckRollDataPTR2e;
    context: CheckRollContext;
    check: CheckModifier;
}

type CheckType = "check" | "attack-roll" | "skill-check" | "luck-roll" | "luck-check" | "pokeball-check";

type CheckRollCallback = (
    roll: Rolled<CheckRoll>,
    outcome: number | null | undefined,
    message: Maybe<ChatMessagePTR2e>
) => Promise<void> | void;

type AttackRollCallback = (
    context: Omit<CheckRollContext, "target" | "targets"> & {
        contexts: Record<string, CheckContext>;
    },
    results: AttackRollResult[],
    message: Maybe<ChatMessagePTR2e>
) => Promise<void> | void;

type PokeballRollCallback = (
    context: CheckRollContext,
    results: PokeballRollResults,
    message: Maybe<ChatMessagePTR2e>
) => Promise<void> | void;

export { CheckRoll };
export type {
    CheckRollDataPTR2e,
    CheckType,
    CheckRollCallback,
    AttackRollCallback,
    AttackRollResult,
    PokeballRollResults,
    PokeballRollCallback,
};
