import { ModifierPTR2e, RawModifier } from "@module/effects/modifiers.ts";
import { CheckType } from "@system/rolls/check-roll.ts";

interface BaseStatisticData {
    /** An identifier such as "accounting" or "ember" */
    slug: string;
    label: string;
    /** Base domains for fetching actor roll options */
    domains?: string[];
    /** Modifiers not retrieved from the actor's synthetics record */
    modifiers?: ModifierPTR2e[];
}

/** Used to build the actual statistic object */
interface StatisticData extends BaseStatisticData {
    check?: StatisticCheckData;
    dc?: StatisticDifficultyClassData;
    /** If given, filters all automatically acquired modifiers */
    filter?: (m: ModifierPTR2e) => boolean;
    /**
     * Any static roll options that should be added to the list of roll options.
     * This does not include actor or basic item roll options.
     */
    rollOptions?: string[];
}

interface StatisticCheckData {
    type: CheckType;
    label?: string;
    /** Additional domains for fetching actor roll options */
    domains?: string[];
    /** Modifiers not retrieved from the actor's synthetics record */
    modifiers?: ModifierPTR2e[];
}

interface StatisticDifficultyClassData {
    /** Additional domains for fetching actor roll options */
    domains?: string[];
    label?: string;
    /** Modifiers not retrieved from the actor's synthetics record */
    modifiers?: ModifierPTR2e[];
}

/** Defines view data for chat message and sheet rendering */
interface StatisticChatData {
    slug: string;
    label: string;
    check: {
        label: string;
        mod: number;
        breakdown: string;
    };
    dc: {
        value: number;
        breakdown: string;
    };
}

interface BaseStatisticTraceData {
    slug: string;
    label: string;
    /** A numeric value of some kind: semantics determined by `AbstractBaseStatistic` subclass */
    value: number;
    breakdown: string;
    modifiers: Required<RawModifier>[];
}

/** Data intended to be merged back into actor data (usually for token attribute/RE purposes) */
interface StatisticTraceData extends BaseStatisticTraceData {
    /** Either the totalModifier or the dc depending on what the data is for */
    value: number;
    totalModifier: number;
    dc: number;
}

export type {
    BaseStatisticData,
    BaseStatisticTraceData,
    StatisticChatData,
    StatisticCheckData,
    StatisticData,
    StatisticDifficultyClassData,
    StatisticTraceData,
};
