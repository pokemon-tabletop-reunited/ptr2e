import { PTRActor, PTRActorProxy } from "../../module/actor/base.mjs";
import { PerkDirectory } from "../../module/apps/sidebar-perks/perks-directory.mjs";
import { PTRCombatTracker } from "../../module/combat/tracker.mjs";
import { PTRItem } from "../../module/item/base.mjs";
import PTRGear from "../../module/item/gear/document.mjs";
import PTRPerk from "../../module/item/perk/document.mjs";
import PTRPerkSheet from "../../module/item/perk/sheet.mjs";

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