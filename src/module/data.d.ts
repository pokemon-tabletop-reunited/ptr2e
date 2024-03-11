type DamageDiceSynthetics = { damage: DeferredDamageDice[] } & { [K in string]?: DeferredDamageDice[] };
type ModifierSynthetics = Record<"all" | "damage", DeferredModifier[]> & { [K in string]?: DeferredModifier[] };
type ModifierAdjustmentSynthetics = { all: ModifierAdjustment[]; damage: ModifierAdjustment[] } & {
    [K in string]?: ModifierAdjustment[];
};
type DeferredModifier = DeferredValue<ModifierPTR2e>;
type DeferredDamageDice = DeferredValue<DamageDicePTR2e>;
type DeferredEphemeralEffect = DeferredPromise<EffectSource | ConditionSource | null>;

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

interface Trait {
    slug: string,
    label: string,
    related: string[],
    description: string,
}

interface Keyword {
    slug: string,
    label: string,
    traits: string[],
    description: string,
}

type PTRSkill = ArtSkill | OccultSkill | PerformanceSkill | PilotingSkills | ScienceSkills | "accounting" | "acrobatics" | "appraise" | "archaeology" | "aura-sense" | "climb" | "computers" | "conversation" | "credit-rating" | "disguise" | "electronics" | "engineering" | "fast-talk" | "history" | "husbandry" | "intimidate" | "leadership" | "legal" | "lift" | "listen" | "locksmith" | "mechanics" | "medicine" | "natural-world" | "navigate" | "negotiation" | "psychology" | "read-lips" | "research" | "ride" | "running" | "sleight-of-hand" | "spot-hidden" | "stealth" | "survival" | "swim" | "teaching" | "track";

type ArtSkill = "flower-arrangement" | "poetry" | "calligraphy" | "painting" | "songwriting" | "digital-art" | "bonzai";
type OccultSkill = "psychic" | "ghosts" | "fairies" | "spiritual" | "legendaries";
type PerformanceSkill = "cool" | "cute" | "beautiful" | "tough" | "smart";
type PilotingSkills = "bike" | "small-motor-vehicles" | "cars" | "utility-vehicles" | "military-ground-vehicles" | "walkers" | "aircraft" | "aerospace-vehicles" | "watercraft";
type ScienceSkills = "astronomy" | "biology" | "botany" | "chemistry" | "cryptography" | "forensics" | "geology" | "mathematics" | "meteorology" | "parapsychology" | "pharmacy" | "physics" | "zoology"

type ImageFilePath = "" | `${string}.apng` | `${string}.avif` | `${string}.bmp` | `${string}.gif` | `${string}.jpeg` | `${string}.jpg` | `${string}.png` | `${string}.svg` | `${string}.tiff` | `${string}.webp`;

type ContestType = "cool" | "cute" | "beautiful" | "tough" | "smart";