class PTRItemData extends Item {
    system: ItemSystemSource;

    get parent(): PTRActorData | null;
    get actor(): PTRActorData | null;
}

type ItemRarity = "common" | "uncommon" | "rare" | "unique";
type ItemGrade = "E" | "E+" | "D-" | "D" | "D+" | "C-" | "C" | "C+" | "B-" | "B" | "B+" | "A-" | "A" | "A+" | "S-" | "S" | "S+";
type TimeDuration = {
    value: number,
    unit: "seconds" | "minutes" | "hours" | "days" | "weeks" | "months" | "years"
}

class ItemSystemSource extends foundry.abstract.TypeDataModel {
    slug: string

    actions: Record<string, ActionSource>
    container: PTRItemData | null
    description: string
    traits: Trait[]

    get parent(): PTRItemData | null;
}

type IdentificationStatus = "identified" | "unidentified" | "misidentified";
interface IdentificationSource {
    misidentified: PTRItemData
    status: IdentificationStatus,
    unidentified: MystifiedData,
}
interface MystifiedData {
    name: string,
    img: ImageFilePath,
    description: string,
}

type ItemCarryType = "held" | "worn" | "stowed" | "dropped";
interface EquippedData {
    carryType: ItemCarryType,
    handsHeld?: number,
}

interface GearSystemSource extends ItemSystemSource {
    cost: number,
    crafting: {
        skill: PTRSkill,
        time: TimeDuration,
    },
    equipped: EquippedData,
    grade: ItemGrade,
    identification: IdentificationSource,
    quantity: number,
    rarity: ItemRarity,
}

/**
 * Weapons can:
 * - Provide an action (move)
 * - Alter an action (move)
 * - It's own PP pool for using certain actions
 * 
 * Figure out later if this needs a seperate item type or just effect based
 */
class PTRWeapon extends PTRGearData {
    type: "weapon";
}

class PTREquipment extends PTRGearData {
    type: "equipment";
}

class PTRConsumable extends PTRGearData {
    type: "consumable";
    system: Omit<GearSystemSource, "actions"> & {
        consumableType: "food" | "restorative" | "boosters" | "ammo" | "evolution-item" | "pokeball" | "other"
        charges: {
            value: number,
            max: number,
        }
    }
}

class PTRContainer extends PTRGearData {
    type: "container";
    system: Omit<GearSystemSource, "identification" | "actions"> & {
        collapsed: boolean
    }
}

class PTRMove extends PTRItemData {
    system: MoveSystemSource;
}

interface MoveSystemSource extends ItemSystemSource {
    actions: Record<string, AttackSource | ActionSource>
}

class PTRAbility extends PTRItemData {
    system: AbilitySystemSource;
}

interface AbilitySystemSource extends ItemSystemSource {

}

class PTRPerkSource extends ItemSystemSource {
    node: PTRNode

    /** Perk point cost */
    cost: number
    prerequisites: Trait[]

    get fromNode(): Node | null;
}

class PTRNode {
    id: string
    angle: number
    distance: number
    type: "normal" | "root" | "ranked"
    connected: string[]
    texture: string
    visible: boolean
}

class PTRSpecies extends PTRItemData {
    system: SpeciesSystemSource;
}

interface SpeciesSystemSource {
    slug: string,
    number: number,
    form: string,

    stats: {
        hp: number,
        atk: number,
        def: number,
        spa: number,
        spd: number,
        spe: number,
    }

    types: PokemonType[],




    traits: Trait[],

}

// Priority & Interrupt are [Traits] so don't need a data field
type ActionCost = "simple" | "complete" | "free";
type ActionType = ActivityType | "attack"
type ActivityType = "camping" | "downtime" | "exploration";

class ActionSource extends foundry.abstract.DataModel {
    slug: string
    // Action label
    name: string
    // Effect text
    description: string
    traits: Trait[]
    type: ActionType

    cost: {
        activation: ActionCost,
        powerPoints: number,
        trigger?: string | TriggerSource, // prob just string but maybe object
        delay?: 1 | 2 | 3,
        priority?: number,
    }
    range: RangeSource[]
}

interface AttackSource extends ActionSource {
    type: PokemonType,
    category: PokemonCategory,
    power: number | null,
    accuracy: number | null,

    contestType: ContestType,
    contestEffect: string,
}

type TargetOption = "self" | "ally" | "enemy" | "creature" | "object" | "blast" | "cone" | "line" | "wide-line" | "emanation" | "field";
class RangeSource {
    target: TargetOption
    // 0 if self, 1 if melee, the range if ranged
    distance: number
    unit: DistanceUnit
}