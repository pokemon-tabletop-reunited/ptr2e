
import { ActorPTR2e, ActorSheetPTR2e, ActorSystemPTR2e } from "@actor";
import { CombatTrackerPTR2e } from "@combat";
import { AbilitySystem, ContainerSystem, EquipmentSystem, GearSystem, ItemPTR2e, MoveSystem, PerkSystem, SpeciesSystem, WeaponSystem} from "@item";
import { ConsumableSystem } from "@item/consumable/system.ts";
import { PerkSheetPTR2e } from "@item/perk/sheet.ts";
import { PerkDirectory } from "@module/apps/sidebar-perks/perks-directory.ts";
import Traits from "static/traits.json";

export const PTRCONFIG = {
    Actor: {
        documentClass: ActorPTR2e,
        dataModels: {
            character: ActorSystemPTR2e
        },
        sheetClasses: {
            character: ActorSheetPTR2e,
        },
    },
    Item: {
        documentClass: ItemPTR2e,
        dataModels: {

            ability: AbilitySystem,
            consumable: ConsumableSystem,
            container: ContainerSystem,
            equipment: EquipmentSystem,
            gear: GearSystem,
            move: MoveSystem,
            perk: PerkSystem,
            species: SpeciesSystem,
            weapon: WeaponSystem
        },
        sheetClasses: {
            perk: PerkSheetPTR2e,
        },
    },
    ui: {
        perks: PerkDirectory,
        combat: CombatTrackerPTR2e,
    },
    data: {
        traits: Traits,
    }
}