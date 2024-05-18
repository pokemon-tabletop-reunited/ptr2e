import { AttackPTR2e } from "@data";
import { CheckRoll, CheckRollDataPTR2e } from "./check-roll.ts";
import { AttackCheckModifier } from "@module/effects/modifiers.ts";
// @ts-expect-error
class AttackRoll extends CheckRoll {
    static override createFromData(
        data: AttackRollCreationData,
        options: AttackRollDataPTR2e,
        type: "accuracy" | "crit" | "damage" = "accuracy"
    ): AttackRoll | null {
        switch (type) {
            case "accuracy":
                return AttackRoll.createAccuracyRoll(data, options);
            case "crit":
                return AttackRoll.createCritRoll(data, options);
            case "damage":
                return AttackRoll.createDamageRoll(options);
        }
    }

    static createAccuracyRoll(
        data: AttackRollCreationData,
        options: AttackRollDataPTR2e
    ): AttackRoll | null {
        const attack = data.attack;
        // If the attack has no accuracy, it always hits
        if (attack.accuracy === null && !options.rip) return null;

        const formula = "1d100ms@dc";
        const dc = ((baseAccuracy: number, accuracyModifiers: {flat: number, stage: number}, evasionStage: number) => {
            const { flat: accuracyFlat, stage: accuracyStage } = accuracyModifiers
            const stageBonus = (() => {
                const evasion = evasionStage
                const accuracy = accuracyStage;
                const stages = Math.clamp(accuracy - evasion, -6, 6);
                return stages >= 0 ? (3 + stages) / 3 : 3 / (3 - stages);
            })();

            return Math.clamp(
                Math.floor((baseAccuracy + accuracyFlat) * stageBonus),
                1,
                100
            );
        })(
            attack.accuracy ?? 100,
            data.check.total?.accuracy ?? { flat: 0, stage: 0 },
            data.check.total?.evasion?.stage ?? 0
        );

        return new AttackRoll(formula, {dc}, options);
    }

    static createCritRoll(
        data: AttackRollCreationData,
        options: AttackRollDataPTR2e
    ): AttackRoll | null {
        const attack = data.attack;
        // Status moves cannot crit
        if(attack.category === "status") return null;

        const formula = "1d100ms@dc";
        // @ts-expect-error
        const dc = ((critStages: number): number => {
            const stage = Math.clamp(critStages, 0, 3);
            switch (stage) {
                case 0: return Math.floor(100 * (1 / 24));
                case 1: return Math.floor(100 * (1 / 8));
                case 2: return Math.floor(100 * (1 / 2));
                case 3: return 100;
            }
        })(
            data.check.total?.crit?.stage ?? 0
        )

        return new AttackRoll(formula, {dc}, options);
    }

    static createDamageRoll(
        options: AttackRollDataPTR2e
    ): AttackRoll | null {
        return new AttackRoll("2d8", {}, options);
    }
}

type AttackRollCreationData = {
    attack: AttackPTR2e;
    check: AttackCheckModifier;
};

type AttackRollDataPTR2e = CheckRollDataPTR2e & {
    rip: boolean;
};

export { AttackRoll, type AttackRollDataPTR2e, type AttackRollCreationData };
