import { AccuracySuccessCategory } from "@data";

type AccuracyCalc = {
    category: AccuracySuccessCategory;
    context: AccuracyContext;
}

type AccuracyContext = {
    moveAccuracy: number | null;
    otherModifiers?: number;
    adjustedStages?: number;
    stageModifier?: number;
    accuracyRoll?: number;
    accuracyDC?: number;
    override: boolean;
}

type DamageCalc = {
    roll: Rolled<Roll>;
    value: number;
    context: DamageContext;
} | {
    value: 0;
    context: DamageContext;
}
type DamageContext = {
    level: number;
    power: number;
    attack: number;
    defense: number;
    targets: number;
    critical: number;
    random: number;
    stab: number;
    type: number;
    other: number;
}

export type {
    AccuracyCalc,
    AccuracyContext,
    DamageCalc,
    DamageContext
}