import { CheckContext } from "@system/data.ts";
import { CheckRoll } from "./check-roll.ts";

class DegreeOfSuccess {
    /** The calculated degree of success */
    readonly value: number;

    /** The degree of success prior to adjustment. If there was no adjustment, it is identical to the `value` */
    readonly unadjusted: number;

    /** The roll which generated this degree of success */
    readonly dieResult: number;

    /** The total of the roll including modifiers */
    readonly rollTotal: number;

    constructor(roll: Rolled<CheckRoll> | RollBrief) {
        if (roll instanceof Roll) {
            this.dieResult =
                (roll.isDeterministic
                    ? roll.terms.find((t): t is NumericTerm => t instanceof NumericTerm)
                    : roll.dice.find((d): d is Die => d instanceof Die && d.faces === 20)
                )?.total ?? 1;
            this.rollTotal = roll.total;
        } else {
            this.dieResult = roll.dieValue;
            this.rollTotal = roll.dieValue + roll.modifier;
        }

        this.unadjusted = this.#calculateDegreeOfSuccess();
        // TODO: Future proofing for DoS adjustments
        this.value = this.unadjusted;
    }

    #calculateDegreeOfSuccess(): number {
        return this.rollTotal > 0
            ? Math.ceil(this.rollTotal / -10) - 1
            : Math.floor(this.rollTotal / -10) + 1;
    }

    static create(
        roll: Rolled<CheckRoll>,
        _context?: CheckContext
    ): DegreeOfSuccess | null {
        // TODO: Implement
        const dos = new DegreeOfSuccess(roll);
        roll.options.degreeOfSuccess = dos.value;
        return dos;
    }
}

type RollBrief = { dieValue: number; modifier: number };

interface CheckDC {
    slug?: string | null;
    // statistic?: StatisticDifficultyClass | null;
    label?: string;
    scope?: "attack" | "check";
    value: number;
    visible?: boolean;
}

export { DegreeOfSuccess, type RollBrief, type CheckDC };
