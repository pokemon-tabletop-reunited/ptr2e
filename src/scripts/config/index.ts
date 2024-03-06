
import { ActorPTR2e, ActorSheetPTR2e, ActorSystemPTR2e } from "@actor";
import { CombatPTR2e, CombatTrackerPTR2e, CombatantPTR2e } from "@combat";
import { ItemPTR2e, data, sheets } from "@item";
import { AbilitySheetPTR2e } from "@item/sheets/ability.ts";
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
            ability: data.AbilitySystemModel,
            consumable: data.ConsumableSystemModel,
            container: data.ContainerSystemModel,
            equipment: data.EquipmentSystemModel,
            gear: data.GearSystemModel,
            move: data.MoveSystemModel,
            perk: data.PerkSystemModel,
            species: data.SpeciesSystemModel,
            weapon: data.WeaponSystemModel
        },
        sheetClasses: {
            perk: [sheets.PerkSheetPTR2e],
            ability: [AbilitySheetPTR2e],
            move: [sheets.MoveSheetPTR2e],
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