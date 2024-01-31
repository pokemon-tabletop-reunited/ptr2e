import { PTRActor, PTRActorProxy } from "../../module/actor/base.ts";
import { PerkDirectory } from "../../module/apps/sidebar-perks/perks-directory.ts";
import { PTRCombatTracker } from "../../module/combat/tracker.ts";
import { PTRItem } from "../../module/item/base.ts";
import PTRGear from "../../module/item/gear/document.ts";
import PTRPerk from "../../module/item/perk/document.ts";
import PTRPerkSheet from "../../module/item/perk/sheet.ts";

export const PTRCONFIG = {
    Actor: {
        documentClass: PTRActor,
        proxy: PTRActorProxy,
        documentClasses: {

        },
        sheetClasses: {

        },
    },
    Item: {
        documentClass: PTRItem,
        dataModels: {
            perk: PTRPerk,
            gear: PTRGear
        },
        sheetClasses: {
            perk: PTRPerkSheet,
        },
    },
    ui: {
        perks: PerkDirectory,
        combat: PTRCombatTracker,
    }
}