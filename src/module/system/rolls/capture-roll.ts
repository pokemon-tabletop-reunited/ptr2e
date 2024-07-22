import { ActorPTR2e } from "@actor";
import { CheckRoll, CheckRollDataPTR2e } from "./check-roll.ts";
import { AttackCheckModifier } from "@module/effects/modifiers.ts";
import { ActiveEffectPTR2e } from "@effects";

class CaptureRoll extends CheckRoll {
    static override createFromData(
        options: CheckRollDataPTR2e,
        data?: CaptureRollCreationData,
        type?: "accuracy" | "crit" | "shake1" | "shake2" | "shake3" | "shake4"
    ): CheckRoll | null {
        if (!type) throw new Error("CaptureRoll must have a type.");
        if (!data) throw new Error("CaptureRoll must have data.");

        switch (type) {
            case "accuracy":
                return CaptureRoll.createAccuracyRoll(data, options);
            case "crit":
                return CaptureRoll.createCritRoll(data, options);
            case "shake1":
            case "shake2":
            case "shake3":
            case "shake4":
                return CaptureRoll.createShakeRoll(data, options);
        }
    }

    static createAccuracyRoll(
        data: CaptureRollCreationData,
        options: CheckRollDataPTR2e
    ): CaptureRoll | null {
        options.moveAccuracy = 100;

        const formula = "1d100ms@dc";
        const dc = ((
            baseAccuracy: number,
            accuracyModifiers: { flat: number; stage: number },
            evasionStage: number
        ) => {
            const { flat: accuracyFlat, stage: accuracyStage } = accuracyModifiers;
            const stageBonus = (() => {
                const accuracy = accuracyStage;
                if (Math.abs(accuracy) === Infinity) return -Infinity;
                const evasion = evasionStage;
                const stages = Math.clamp(accuracy - evasion, -6, 6);
                options.adjustedStages = stages;
                return stages >= 0 ? (3 + stages) / 3 : 3 / (3 - stages);
            })();
            options.otherModifiers = accuracyFlat;
            options.stageModifier = stageBonus;

            if (stageBonus === -Infinity) return 0;
            if (options.outOfRange) return 0;

            return Math.clamp(Math.floor((baseAccuracy + accuracyFlat) * stageBonus), 1, 100);
        })(
            options.moveAccuracy,
            data.check.total?.accuracy ?? { flat: 0, stage: 0 },
            data.check.total?.evasion?.stage ?? 0
        );

        options.accuracyDC = dc;

        return new CaptureRoll(formula, { dc }, options);
    }

    static createCritRoll(
        data: CaptureRollCreationData,
        options: CheckRollDataPTR2e
    ): CaptureRoll | null {
        const formula = "1d100ms@dc";
        const catchRate = this.getCatchRate(data);
        if (!catchRate) return null;

        const dc = new Roll(this.critDcFormula, {
            catchRate: catchRate.total,
            // TODO: Implement
            caught: 0,
            bonus: data.critBonus || 1,
        }).evaluateSync();

        options.critDC = dc;

        return new CaptureRoll(formula, { dc: dc.total }, options);
    }

    static createShakeRoll(
        data: CaptureRollCreationData,
        options: CheckRollDataPTR2e
    ): CaptureRoll | null {
        const formula = "1d100ms@dc";

        const catchRate = this.getCatchRate(data);
        if (!catchRate) return null;

        const dc = new Roll(
            this.shakeDcFormula,
            { catchRate: catchRate.total },
            { catchRate }
        ).evaluateSync();
        options.shakeDC = dc;

        return new CaptureRoll(formula, { dc: dc.total }, options);
    }

    static getCatchRate(data: CaptureRollCreationData) {
        if (!data.target) return null;

        const effects = data.target.effects as unknown as ActiveEffectPTR2e[];
        return new Roll(this.catchRateFormula, {
            hpMax: data.target.system.health.max,
            hpCurrent: data.target.system.health.value,
            rate: data.target.system.species?.captureRate || 45,
            bonusBall: data.ballBonus || 1,
            bonusStatus: new Roll(this.bonusStatusFormula, {
                major: effects.filter((effect) => effect.traits.has("major-affliction")).length,
                minor: effects.filter((effect) => effect.traits.has("minor-affliction")).length,
            }).evaluateSync().total,
            bonusStage: new Roll(this.bonusStageFormula, {
                netStages: data.target.netStages,
            }).evaluateSync().total,
            bonusLevel: Math.pow(0.75, (data.target.level - (data.user?.level ?? 0) + 5) / 5 || 0), //Math.max((36 - 2 * (data.target.level || 1)) / 10, 1),
            bonusMisc: data.miscBonus || 1,
        }).evaluateSync();
    }

    static get shakeDcFormula() {
        return "floor(100 * pow((@catchRate / 255), (3/16)))";
    }
    static get critDcFormula() {
        return "(@catchRate * min(8, @caught / 75) * @bonus) / (357 / 10) + 1";
    }
    static get catchRateFormula() {
        return "((3 * @hpMax - 2 * @hpCurrent) / (3 * @hpMax)) * @rate * @bonusBall * @bonusStatus * @bonusStage * @bonusLevel * @bonusMisc";
    }
    static get bonusStatusFormula() {
        return "pow(1.225, @major) * pow(1.05, @minor)";
    }
    static get bonusStageFormula() {
        return "pow(1.02, -@netStages)";
    }
}

type CaptureRollCreationData = {
    target: Maybe<ActorPTR2e>;
    user: Maybe<ActorPTR2e>;
    ballBonus: number;
    miscBonus: number;
    critBonus: number;
    check: AttackCheckModifier;
};

export { CaptureRoll, type CaptureRollCreationData };
