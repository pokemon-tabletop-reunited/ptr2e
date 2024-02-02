
import { ActorPTR2e, ActorSheetPTR2e, ActorSystemPTR2e } from "@actor";
import { CombatTrackerPTR2e } from "@combat";
import { AbilitySystemPTR2e, ConsumableSystemPTR2e,GearSystemPTR2e, ContainerSystemPTR2e, EquipmentSystemPTR2e, ItemPTR2e, MoveSystemPTR2e, PerkSystemPTR2e, SpeciesSystemPTR2e, WeaponSystemPTR2e } from "@item";
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
            ability: AbilitySystemPTR2e,
            consumable: ConsumableSystemPTR2e,
            container: ContainerSystemPTR2e,
            equipment: EquipmentSystemPTR2e,
            gear: GearSystemPTR2e,
            move: MoveSystemPTR2e,
            perk: PerkSystemPTR2e,
            species: SpeciesSystemPTR2e,
            weapon: WeaponSystemPTR2e
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