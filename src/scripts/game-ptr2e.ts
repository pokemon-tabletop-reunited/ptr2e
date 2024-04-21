import { PerkManager } from "@module/apps/perk-manager/perk-manager.ts";
import { PerkTree } from "@module/canvas/perk-tree/perk-tree.ts";
import TooltipsPTR2e from "@module/tooltips/tooltips.ts";
import { sluggify } from "@utils";
import { ClockDatabase, TraitsCollection } from "@data";
import ClockPanel from "@module/apps/clocks/clock-panel.ts";
import { Pokedex } from "pokeapi-js-wrapper";
import { UUIDUtils } from "src/util/uuid.ts";

const GamePTR = {
    onInit() {
        const initData = {
            tree: new PerkTree(),
            util: {
                sluggify,
                pokeApi: new Pokedex(),
                uuid: UUIDUtils
            },
            data: {
                traits: TraitsCollection.create(),
            },
            perks: new PerkManager(),
            tooltips: new TooltipsPTR2e(),
            clocks: {
                db: ClockDatabase,
                panel: new ClockPanel({ id: "ptr2e-clock-panel" }),
            },
        };

        const top = document.querySelector("#ui-top") as HTMLElement;
        if (top) {
            const template = document.createElement("template");
            template.setAttribute("id", "ptr2e-clock-panel");
            top?.insertAdjacentElement("afterend", template);
        }

        game.ptr = fu.mergeObject(game.ptr ?? {}, initData);
    },
    onSetup() {
        // Run "delayed" constructor of game.ptr.tooltips
        game.ptr.tooltips.observe();
    },
    onReady() {
        game.ptr.clocks.panel.render(true);
    },
};

export { GamePTR };