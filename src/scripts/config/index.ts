
import { ActorPTR2e, ActorSheetPTR2e, ActorSystemPTR2e } from "@actor";
import { CombatTrackerPTR2e } from "@combat";
import { GearSystemPTR2e, ItemPTR2e, PerkSystemPTR2e } from "@item";
import { PerkSheetPTR2e } from "@item/perk/sheet.ts";
import { PerkDirectory } from "@module/apps/sidebar-perks/perks-directory.ts";

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
            perk: PerkSystemPTR2e,
            gear: GearSystemPTR2e
        },
        sheetClasses: {
            perk: PerkSheetPTR2e,
        },
    },
    ui: {
        perks: PerkDirectory,
        combat: CombatTrackerPTR2e,
    }
}