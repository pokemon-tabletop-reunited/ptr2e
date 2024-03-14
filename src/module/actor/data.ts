import { DistanceUnit, Trait, WeightUnit } from "@data";

type ModifierSynthetics = Record<"all" | "damage", DeferredModifier[]> & { [K in string]?: DeferredModifier[] };
type ModifierAdjustmentSynthetics = { all: ModifierAdjustment[]; damage: ModifierAdjustment[] } & {
    [K in string]?: ModifierAdjustment[];
};
type ModifierAdjustment = {}
type ModifierPTR2e = {}
type DeferredModifier = DeferredValue<ModifierPTR2e>;

interface DeferredValueParams {
    /** An object to merge into roll data for `Roll.replaceFormulaData` */
    resolvables?: Record<string, unknown>;
    /** An object to merge into standard options for `RuleElementPTR2e#resolveInjectedProperties` */
    injectables?: Record<string, unknown>;
    /** Roll Options to get against a predicate (if available) */
    test?: string[] | Set<string>;
}
type DeferredValue<T> = (options?: DeferredValueParams) => T | null;
type DeferredPromise<T> = (options?: DeferredValueParams) => Promise<T | null>;

interface ActorSynthetics {
    ephemeralEffects: ModifierSynthetics;
    modifierAdjustments: ModifierAdjustmentSynthetics;
    statisticsModifiers: ModifierSynthetics;
    preparationWarnings: {
        /** Adds a new preparation warning to be printed when flushed. These warnings are de-duped. */
        add: (warning: string) => void;
        /** Prints all preparation warnings, but this printout is debounced to handle prep and off-prep cycles */
        flush: () => void;
    };
}

interface Attributes {
    hp: Omit<Attribute, "stage">,
    atk: Attribute,
    def: Attribute,
    spa: Attribute,
    spd: Attribute,
    spe: Attribute,
}

interface Attribute extends Stat {
    /** Effort Values invested in the stat */
    evs: number,
    /** Individual Values invested in the stat */
    ivs: number,
    /** Base value of the attribute */
    base: number,
    /** Value after all calculations *except* stage */
    value: number
}

interface Stat {
    /** Stat Key*/
    slug: string,
    /** Amount of stages */
    stage: number
}

type PTRSkill = ArtSkill | OccultSkill | PerformanceSkill | PilotingSkills | ScienceSkills | "accounting" | "acrobatics" | "appraise" | "archaeology" | "aura-sense" | "climb" | "computers" | "conversation" | "credit-rating" | "disguise" | "electronics" | "engineering" | "fast-talk" | "history" | "husbandry" | "intimidate" | "leadership" | "legal" | "lift" | "listen" | "locksmith" | "mechanics" | "medicine" | "natural-world" | "navigate" | "negotiation" | "psychology" | "read-lips" | "research" | "ride" | "running" | "sleight-of-hand" | "spot-hidden" | "stealth" | "survival" | "swim" | "teaching" | "track";

type ArtSkill = "flower-arrangement" | "poetry" | "calligraphy" | "painting" | "songwriting" | "digital-art" | "bonzai";
type OccultSkill = "psychic" | "ghosts" | "fairies" | "spiritual" | "legendaries";
type PerformanceSkill = "cool" | "cute" | "beautiful" | "tough" | "smart";
type PilotingSkills = "bike" | "small-motor-vehicles" | "cars" | "utility-vehicles" | "military-ground-vehicles" | "walkers" | "aircraft" | "aerospace-vehicles" | "watercraft";
type ScienceSkills = "astronomy" | "biology" | "botany" | "chemistry" | "cryptography" | "forensics" | "geology" | "mathematics" | "meteorology" | "parapsychology" | "pharmacy" | "physics" | "zoology"

interface Skills {
    [slug: string]: Skill,
}

interface Skill {
    /** Skill Key */
    slug: PTRSkill,
    /** Skill Total Value */
    value: number,
    /** Refinement Values invested in this skill */
    rvs: number,
}

interface Biology {
    /** List of senses you have */
    senses: Trait[]
    weight: CapabilityClass,
    height: CapabilityClass,
    gender: string,
    /** Percentage chance to be male, null if genderless*/
    genderRatio: number | null,
    habitats: string[],
    diet: string[],
}

interface Capabilities {
    overland: Movement,
    swim: Movement,
    burrow: Movement,
    sky: Movement,
    threaded: Movement
}

interface CapabilityClass {
    /** Capability Key */
    slug: string,
    /** Raw value */
    value: number,
    /** Raw value unit */
    unit: WeightUnit | DistanceUnit,
    /** Capability Class */
    class: number
}

interface Movement {
    /** Movement Key */
    slug: string,
    /** Raw value */
    value: number,
    /** Raw value unit */
    unit: DistanceUnit,
}

interface HealthData {
    /** Maximum Hit Points */
    max: number,
    /** Current Hit Points */
    value: number,
    /** Temporary Hit Points */
    temp: number,
    /** Calculated Field */
    percent: number,
}

interface AdvancementData {
    /** Calculated Field */
    level: number,
    /** Calculated Field */
    advancementPoints: number,
    experience: {
        current: number,
        /** Calculated Field */
        next: number
    }
}

export type {
    ModifierSynthetics,
    ModifierAdjustmentSynthetics,
    ModifierAdjustment,
    ModifierPTR2e,
    DeferredModifier,
    DeferredValueParams,
    DeferredValue,
    DeferredPromise,
    ActorSynthetics,
    Attributes,
    Attribute,
    Stat,
    PTRSkill,
    ArtSkill,
    OccultSkill,
    PerformanceSkill,
    PilotingSkills,
    ScienceSkills,
    Skills,
    Skill,
    Biology,
    Capabilities,
    CapabilityClass,
    Movement,
    HealthData,
    AdvancementData
};