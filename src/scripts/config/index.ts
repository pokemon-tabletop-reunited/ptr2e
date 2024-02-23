
import { ActorPTR2e, ActorSheetPTR2e, ActorSystemPTR2e } from "@actor";
import { CombatPTR2e, CombatTrackerPTR2e, CombatantPTR2e } from "@combat";
import { AbilitySystem, ContainerSystem, EquipmentSystem, GearSystem, ItemPTR2e, MoveSystem, PerkSystem, SpeciesSystem, WeaponSystem} from "@item";
import { AbilitySheetPTR2e } from "@item/ability/sheet.ts";
import { ConsumableSystem } from "@item/consumable/system.ts";
import { PerkSheetPTR2e } from "@item/perk/sheet.ts";
import { PerkDirectory } from "@module/apps/sidebar-perks/perks-directory.ts";
import { ChatMessagePTR2e } from "@module/chat/document.ts";
import { ItemMessageSystem } from "@module/chat/models/item.ts";
import { CharacterCombatantSystem } from "@module/combat/combatant/models/character.ts";
import { RoundCombatantSystem } from "@module/combat/combatant/models/round.ts";
import { BasicChangeSystem } from "@module/data/models/basic.ts";
import { ChangeModel } from "@module/data/models/change.ts";
import { ActiveEffectPTR2e } from "@module/effects/document.ts";
import { BaseActiveEffectSystem } from "@module/effects/models/base.ts";
import { RollOptionEffectSystem } from "@module/effects/models/roll-option.ts";
import Traits from "static/traits.json";

export const PTRCONFIG = {
    ActiveEffect: {
        documentClass: ActiveEffectPTR2e,
        dataModels: {
            basic: BaseActiveEffectSystem,
            rolloption: RollOptionEffectSystem,
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
        documentClass: ChangeModel,
        dataModels: {
            basic: BasicChangeSystem
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
            ability: AbilitySheetPTR2e,
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