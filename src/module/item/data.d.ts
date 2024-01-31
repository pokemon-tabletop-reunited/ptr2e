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

interface AttackSource extends ActionSource {
    type: PokemonType,
    category: PokemonCategory,
    power: number | null,
    accuracy: number | null,

    contestType: ContestType,
    contestEffect: string,
}