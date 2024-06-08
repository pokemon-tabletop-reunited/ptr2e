const ActivityTypes = {
    EXPLORATION: "exploration",
    DOWNTIME: "downtime",
    CAMPING: "camping"
} as const

const ActionTypes = {
    ...ActivityTypes,
    ATTACK: "attack",
    PASSIVE: "passive",
    GENERIC: "generic",
    POKEBALL: "pokeball",
} as const;

const ActivationCost = {
    SIMPLE: "simple",
    COMPLEX: "complex",
    FREE: "free",
} as const;

type ActivityType = typeof ActivityTypes[keyof typeof ActivityTypes];
type ActionType = typeof ActionTypes[keyof typeof ActionTypes];
type ActionCost = typeof ActivationCost[keyof typeof ActivationCost];

type Delay = 1 | 2 | 3;
type Priority = 1 | 2 | 3 | 4 | 5 | 6 | 7;

const TargetOptions = {
    SELF: "self",
    ALLY: "ally",
    ENEMY: "enemy",
    CREATURE: "creature",
    OBJECT: "object",
    BLAST: "blast",
    CONE: "cone",
    LINE: "line",
    WIDE_LINE: "wide-line",
    EMANATION: "emanation",
    FIELD: "field",
    AURA: "aura",
    ALLIED_AURA: "allied-aura",
    ENEMY_AURA: "enemy-aura",
} as const;

const DistanceUnits = {
    METERS: "m",
    FEET: "ft",
} as const;

const WeightUnits = {
    KILOGRAMS: "kg",
    POUNDS: "lbs",
} as const;

type TargetOption = typeof TargetOptions[keyof typeof TargetOptions];
type DistanceUnit = typeof DistanceUnits[keyof typeof DistanceUnits];
type WeightUnit = typeof WeightUnits[keyof typeof WeightUnits];

const Categories = {
    PHYSICAL: "physical",
    SPECIAL: "special",
    STATUS: "status"
} as const;

const Types = {
    NORMAL: "normal",
    FIGHTING: "fighting",
    FLYING: "flying",
    POISON: "poison",
    GROUND: "ground",
    ROCK: "rock",
    BUG: "bug",
    GHOST: "ghost",
    STEEL: "steel",
    FIRE: "fire",
    WATER: "water",
    GRASS: "grass",
    ELECTRIC: "electric",
    PSYCHIC: "psychic",
    ICE: "ice",
    DRAGON: "dragon",
    DARK: "dark",
    FAIRY: "fairy",
    NUCLEAR: "nuclear",
    SHADOW: "shadow",
    UNTYPED: "untyped",
} as const;

const ContestTypes = {
    COOL: "cool",
    CUTE: "cute",
    BEAUTIFUL: "beautiful",
    TOUGH: "tough",
    SMART: "smart"
} as const;

type PokemonCategory = typeof Categories[keyof typeof Categories];
type PokemonType = typeof Types[keyof typeof Types];
type ContestType = typeof ContestTypes[keyof typeof ContestTypes];

const CarryTypes = {
    stowed: "PTR2E.FIELDS.gear.equipped.carryType.stowed",
    held: "PTR2E.FIELDS.gear.equipped.carryType.held",
    worn: "PTR2E.FIELDS.gear.equipped.carryType.worn",
    dropped: "PTR2E.FIELDS.gear.equipped.carryType.dropped"
} as const;

type CarryType = keyof typeof CarryTypes;

const IdentificationStatuses = {
    IDENTIFIED: "identified",
    UNIDENTIFIED: "unidentified",
    MISIDENTIFIED: "misidentified"
} as const;

type IdentificationStatus = typeof IdentificationStatuses[keyof typeof IdentificationStatuses];

const AccuracySuccessCategories = {
    CRITICAL: "critical",
    HIT: "hit",
    MISS: "miss",
    FUMBLE: "fumble"
} as const;
type AccuracySuccessCategory = typeof AccuracySuccessCategories[keyof typeof AccuracySuccessCategories];

export {
    ActivityTypes,
    ActionTypes,
    ActivationCost,
    TargetOptions,
    DistanceUnits,
    WeightUnits,
    Categories,
    Types,
    ContestTypes,
    CarryTypes,
    IdentificationStatuses,
    AccuracySuccessCategories
}

export type {
    ActivityType,
    ActionType,
    ActionCost,
    Delay,
    Priority,
    TargetOption,
    DistanceUnit,
    WeightUnit,
    PokemonCategory,
    PokemonType,
    ContestType,
    CarryType,
    IdentificationStatus,
    AccuracySuccessCategory
}