
import { ActorPTR2e, ActorSheetPTR2e, HumanoidActorSystem, PokemonActorSystem, Size } from "@actor";
import { SummonCombatantSystem, CharacterCombatantSystem, CombatPTR2e, CombatSystemPTR2e, CombatTrackerPTR2e, CombatantPTR2e, RoundCombatantSystem } from "@combat";
import { ItemPTR2e, data, sheets } from "@item";
import { PerkDirectory } from "@module/apps/sidebar/perks-directory.ts";
import { SquareGridPTR2e } from "@module/canvas/grid.ts";
import { TemplateLayerPTR2e } from "@module/canvas/layer/template.ts";
import { MeasuredTemplatePTR2e } from "@module/canvas/measured-template.ts";
import { ScenePTR2e } from "@module/canvas/scene.ts";
import { BasicChangeSystem, ChangeModel } from "@data";
import { ActiveEffectPTR2e } from "@module/effects/index.ts";
import { AttackMessageSystem, ChatMessagePTR2e, DamageAppliedMessageSystem, ItemMessageSystem, SkillMessageSystem, CaptureMessageSystem } from "@module/chat/index.ts";
import Traits from "static/traits.json" with { type: "json" };
import ItemDirectoryPTR2e from "@item/sidebar.ts";
import { StatusEffects } from "./effects.ts";
import FolderPTR2e from "@module/folder/document.ts";
import ActorDirectoryPTR2e from "@actor/sidebar.ts";
import FolderConfigPTR2e from "@module/folder/sheet.ts";
import ActiveEffectConfig from "@module/effects/sheet.ts";
import PassiveActiveEffectSystem from "@module/effects/data/passive.ts";
import AfflictionActiveEffectSystem from "@module/effects/data/affliction.ts";
import { TokenDocumentPTR2e } from "@module/canvas/token/document.ts";
import { TokenPTR2e } from "@module/canvas/token/object.ts";
import { default as Skills } from "./skills.ts";
import { CheckRoll } from "@system/rolls/check-roll.ts";
import { AttackRoll } from "@system/rolls/attack-roll.ts";
import { CaptureRoll } from "@system/rolls/capture-roll.ts";
import trackableAttributes from "./trackable-token-attributes.ts";
import { CompendiumDirectoryPTR2e } from "@module/apps/sidebar/compendium-directory.ts";
// import { SettingsSidebarPTR2e } from "@module/apps/sidebar/settings.ts";
import SummonActiveEffectSystem from "@module/effects/data/summon.ts";
import FormActiveEffectSystem from "@module/effects/data/form.ts";
import { FormConfigSheet } from "@module/effects/form-sheet.ts";
import { Predicate } from "@system/predication/predication.ts";
import { CircumstanceModifierGroups } from "./circumstance-modifiers.ts";
import { Habitats } from "./habitats.ts";
import { HabitatRollTable } from "@system/habitat-table.ts";
import { RollTableDirectoryPTR2e } from "@module/apps/sidebar/rolltables-directory.ts";
import AdvancementActiveEffectSystem from "@module/effects/data/advancement.ts";

export const PTRCONFIG = {
  ActiveEffect: {
    documentClass: ActiveEffectPTR2e,
    dataModels: {
      passive: PassiveActiveEffectSystem,
      affliction: AfflictionActiveEffectSystem,
      advancement: AdvancementActiveEffectSystem,
      summon: SummonActiveEffectSystem,
      form: FormActiveEffectSystem
    },
    sheetClasses: {
      effect: ActiveEffectConfig,
      form: FormConfigSheet
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
      "damage-applied": DamageAppliedMessageSystem,
      skill: SkillMessageSystem,
      capture: CaptureMessageSystem,
      combat: foundry.abstract.TypeDataModel
    }
  },
  Combat: {
    documentClass: CombatPTR2e,
    dataModels: {
      base: CombatSystemPTR2e
    }
  },
  Combatant: {
    documentClass: CombatantPTR2e,
    dataModels: {
      character: CharacterCombatantSystem,
      round: RoundCombatantSystem,
      summon: SummonCombatantSystem
    },
  },
  Dice: {
    rolls: [
      CheckRoll,
      AttackRoll,
      CaptureRoll
    ]
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
      blueprint: data.BlueprintSystemModel,
      consumable: data.ConsumableSystemModel,
      container: data.ContainerSystemModel,
      effect: data.EffectSystemModel,
      equipment: data.EquipmentSystemModel,
      gear: data.GearSystemModel,
      move: data.MoveSystemModel,
      perk: data.PerkSystemModel,
      species: data.SpeciesSystemModel,
      weapon: data.WeaponSystemModel,
      summon: data.SummonSystemModel
    },
    sheetClasses: {
      ability: [sheets.AbilitySheetPTR2e],
      blueprint: [sheets.BlueprintSheetPTR2e],
      consumable: [sheets.ConsumableSheetPTR2e],
      container: [sheets.ContainerSheetPTR2e],
      effect: [sheets.EffectSheetPTR2e],
      equipment: [sheets.EquipmentSheetPTR2e],
      gear: [sheets.GearSheetPTR2e],
      move: [sheets.MoveSheetPTR2e],
      perk: [sheets.PerkSheetPTR2e],
      species: [sheets.SpeciesSheetPTR2e],
      weapon: [sheets.WeaponSheetPTR2e],
      summon: [sheets.SummonSheetPTR2e],
      "ptu-item": [sheets.PTUSheet],
    },
  },
  MeasuredTemplate: {
    objectClass: MeasuredTemplatePTR2e,
    layerClass: TemplateLayerPTR2e
  },
  Token: {
    documentClass: TokenDocumentPTR2e,
    objectClass: TokenPTR2e,
    trackableAttributes
  },
  Scene: {
    documentClass: ScenePTR2e,
  },
  RollTable: {
    habitatClass: HabitatRollTable
  },
  ui: {
    perks: PerkDirectory,
    combat: CombatTrackerPTR2e,
    items: ItemDirectoryPTR2e,
    actors: ActorDirectoryPTR2e,
    compendium: CompendiumDirectoryPTR2e,
    // settings: SettingsSidebarPTR2e,
    tables: RollTableDirectoryPTR2e
  },
  data: {
    traits: Traits,
    skills: Skills,
    circumstanceModifierGroups: CircumstanceModifierGroups,
    habitats: Habitats
  },
  statusEffects: StatusEffects,
  specialStatusEffects: {
    "DEFEATED": "dead",
    "INVISIBLE": "invisible",
    "BLIND": "blind",
    "BURROW": "burrow",
    "HOVER": "raised",
    "FLY": "fly"
  },
  actorSizes: {
    diminutive: "PTR2E.ActorSize.Diminutive",
    tiny: "PTR2E.ActorSize.Tiny",
    small: "PTR2E.ActorSize.Small",
    medium: "PTR2E.ActorSize.Medium",
    large: "PTR2E.ActorSize.Large",
    huge: "PTR2E.ActorSize.Huge",
    gigantic: "PTR2E.ActorSize.Gigantic",
    titanic: "PTR2E.ActorSize.Titanic",
    max: "PTR2E.ActorSize.Max"
  } as Record<Size, string>,
  utils: {
    predicate: Predicate
  }
}