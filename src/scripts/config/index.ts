
import { ActorPTR2e, ActorSheetPTR2e, ActorSystemPTR2e } from "@actor";
import { CombatPTR2e, CombatTrackerPTR2e, CombatantPTR2e } from "@combat";
import { AbilitySystem, ContainerSystem, EquipmentSystem, GearSystem, ItemPTR2e, MoveSystem, PerkSystem, SpeciesSystem, WeaponSystem} from "@item";
import { AbilitySheet } from "@item/ability/sheet.ts";
import { ConsumableSystem } from "@item/consumable/system.ts";
import { PerkSheetPTR2e } from "@item/perk/sheet.ts";
import { PerkDirectory } from "@module/apps/sidebar-perks/perks-directory.ts";
import { ChatMessagePTR2e } from "@module/chat/document.ts";
import { ItemMessageSystem } from "@module/chat/models/item.ts";
import { CharacterCombatantSystem } from "@module/combat/combatant/models/character.ts";
import { RoundCombatantSystem } from "@module/combat/combatant/models/round.ts";
import { Change } from "@module/effects/changes/document.ts";
import { BasicChangeSystem } from "@module/effects/changes/models/basic.ts";
import { ActiveEffectPTR2e } from "@module/effects/document.ts";
import Traits from "static/traits.json";

export const PTRCONFIG = {
    ActiveEffect: {
        documentClass: ActiveEffectPTR2e,
        dataModels: {
        }
    },
    Actor: {
        documentClass: ActorPTR2e,
        dataModels: {
            character: ActorSystemPTR2e
        },
        sheetClasses: {
            character: ActorSheetPTR2e,
        },
    },
    Change: {
        documentClass: Change,
        dataModels: {
            base: BasicChangeSystem,
        }
    },
    ChatMessage: {
        documentClass: ChatMessagePTR2e,
        dataModels: {
            item: ItemMessageSystem
        }
    },
    Combat: {
        documentClass: CombatPTR2e
    },
    Combatant: {
        documentClass: CombatantPTR2e,
        dataModels: {
            character: CharacterCombatantSystem,
            round: RoundCombatantSystem
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
            ability: AbilitySheet,
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