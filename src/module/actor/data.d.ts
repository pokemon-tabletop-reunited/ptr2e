abstract class PTRActorData extends Actor {
    system: ActorSystem;
    synthetics: ActorSynthetics;
}

interface ActorSynthetics {
    ephemeralEffects: ModifierSynthetics;
    modifierAdjustments: ModifierAdjustmentSynthetics;
    statisticsModifiers: ModifierSynthetics;
    damageDice: DamageDiceSynthetics;
}

interface ActorSystem {
    attributes: Attributes,
    battleStats: {
        evasion: Stat,
        accuracy: Stat,
        critRate: Stat,
    },
    skills: Skills,
    /** Biological data */
    biology: Biology,
    /** Movement Capabilities */
    capabilities: Capabilities,
    /** All traits for this actor */
    traits: Trait[],
    /** Available advancement points */
    advancementPoints: number,
    type: {
        effectiveness: TypeEffectiveness,
        types: string[],
    },
    species: SpeciesData | null,
    powerPoints: {
        max: number,
        value: number,
    },
    health: HealthData,
    advancement: AdvancementData,
    money: number
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

type WeightUnit = "kg" | "lbs";
type DistanceUnit = "m" | "ft";

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
    level: number,
    experience: {
        current: number,
        /** Calculated Field */
        next: number
    }
}