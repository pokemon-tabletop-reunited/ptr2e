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
  SUMMON: "summon",
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

const Stats = ["hp", "atk", "def", "spa", "spd", "spe"] as const;
type Stat = typeof Stats[number];

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
  equipped: "PTR2E.FIELDS.gear.equipped.carryType.equipped",
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

const NatureToStatArray = {
  cuddly: ["hp", "atk"],
  distracted: ["hp", "def"],
  proud: ["hp", "spa"],
  decisive: ["hp", "spd"],
  patient: ["hp", "spe"],
  desperate: ["atk", "hp"],
  lonely: ["atk", "def"],
  adamant: ["atk", "spa"],
  naughty: ["atk", "spd"],
  brave: ["atk", "spe"],
  stark: ["def", "hp"],
  bold: ["def", "atk"],
  impish: ["def", "spa"],
  lax: ["def", "spd"],
  relaxed: ["def", "spe"],
  curious: ["spa", "hp"],
  modest: ["spa", "atk"],
  mild: ["spa", "def"],
  rash: ["spa", "spd"],
  quiet: ["spa", "spe"],
  dreamy: ["spd", "hp"],
  calm: ["spd", "atk"],
  gentle: ["spd", "def"],
  careful: ["spd", "spa"],
  sassy: ["spd", "spe"],
  skittish: ["spe", "hp"],
  timid: ["spe", "atk"],
  hasty: ["spe", "def"],
  jolly: ["spe", "spa"],
  naive: ["spe", "spd"],
  hardy: ["atk", "atk"],
  docile: ["def", "def"],
  bashful: ["spa", "spa"],
  quirky: ["spd", "spd"],
  serious: ["spe", "spe"],
  composed: ["hp", "hp"],
} as const;

type Nature = keyof typeof NatureToStatArray;

const Natures = Object.entries(NatureToStatArray).reduce<Record<string, string>>((acc, [nature, stats]) => {
  acc[nature] = `${nature.capitalize()} (+${stats[0]} -${stats[1]})`;
  return acc;
}, {})

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
  AccuracySuccessCategories,
  Stats,
  Natures,
  NatureToStatArray
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
  AccuracySuccessCategory,
  Stat,
  Nature
}