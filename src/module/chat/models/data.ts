import { AccuracySuccessCategory } from "@data";

interface AccuracyCalc {
    category: AccuracySuccessCategory;
    context: AccuracyContext;
}

interface AccuracyContext {
    moveAccuracy?: number | null;
    otherModifiers?: number;
    adjustedStages?: number;
    stageModifier?: number;
    accuracyRoll?: number;
    accuracyDC?: number;
    override?: boolean;
    critDC?: number;
    critStages?: number;
    critRoll?: number;
}

type DamageCalc = {
    roll: Rolled<Roll>;
    value: number;
    context: Partial<DamageContext>;
} | {
    value: 0;
    context: Partial<DamageContext>;
}
interface DamageContext {
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
    [key: string]: number;
}

export type {
    AccuracyCalc,
    AccuracyContext,
    DamageCalc,
    DamageContext
}