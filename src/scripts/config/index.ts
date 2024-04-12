
import { ActorPTR2e, ActorSheetPTR2e, HumanoidActorSystem, PokemonActorSystem } from "@actor";
import { CharacterCombatantSystem, CombatPTR2e, CombatTrackerPTR2e, CombatantPTR2e, RoundCombatantSystem } from "@combat";
import { ItemPTR2e, data, sheets } from "@item";
import { AbilitySheetPTR2e } from "@item/sheets/ability.ts";
import { PerkDirectory } from "@module/apps/sidebar-perks/perks-directory.ts";
import { SquareGridPTR2e } from "@module/canvas/grid.ts";
import { TemplateLayerPTR2e } from "@module/canvas/layer/template.ts";
import { MeasuredTemplatePTR2e } from "@module/canvas/measured-template.ts";
import { ScenePTR2e } from "@module/canvas/scene.ts";
import { BasicChangeSystem, ChangeModel } from "@data";
import { ActiveEffectPTR2e, ActiveEffectSystem } from "@module/effects/index.ts";
import { AttackMessageSystem, ChatMessagePTR2e, DamageAppliedMessageSystem, ItemMessageSystem } from "@module/chat/index.ts";
import Traits from "static/traits.json";
import ItemDirectoryPTR2e from "@item/sidebar.ts";
import { StatusEffects } from "./effects.ts";
import FolderPTR2e from "@module/folder/document.ts";
import ActorDirectoryPTR2e from "@actor/sidebar.ts";
import FolderConfigPTR2e from "@module/folder/sheet.ts";

export const PTRCONFIG = {
    ActiveEffect: {
        documentClass: ActiveEffectPTR2e,
        dataModels: {
            basic: ActiveEffectSystem,
        }
    },
    Actor: {
        documentClass: ActorPTR2e,
        dataModels: {
            humanoid: HumanoidActorSystem,
            pokemon: PokemonActorSystem
        },
        sheetClasses: {
            character: ActorSheetPTR2e,
            "ptu-actor": sheets.PTUSheet,
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
            item: ItemMessageSystem,
            attack: AttackMessageSystem,
            "damage-applied": DamageAppliedMessageSystem
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
    Folder: {
        documentClass: FolderPTR2e,
        sheetClasses: {
            folder: FolderConfigPTR2e
        }
    },
    Grid: {
        square: SquareGridPTR2e,
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
            weapon: data.WeaponSystemModel,
            effect: data.EffectSystemModel,
        },
        sheetClasses: {
            perk: [sheets.PerkSheetPTR2e],
            ability: [AbilitySheetPTR2e],
            move: [sheets.MoveSheetPTR2e],
            species: [sheets.SpeciesSheetPTR2e],
            "ptu-item": [sheets.PTUSheet],
        },
    },
    MeasuredTemplate: {
        objectClass: MeasuredTemplatePTR2e,
        layerClass: TemplateLayerPTR2e
    },
    Scene: {
        documentClass: ScenePTR2e,
    },
    ui: {
        perks: PerkDirectory,
        combat: CombatTrackerPTR2e,
        items: ItemDirectoryPTR2e,
        actors: ActorDirectoryPTR2e
    },
    data: {
        traits: Traits,
    },
    statusEffects: StatusEffects
}