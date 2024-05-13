import { PerkManager } from "@module/apps/perk-manager/perk-manager.ts";
import TooltipsPTR2e from "@module/tooltips/tooltips.ts";
import { ImageResolver, sluggify } from "@utils";
import { ClockDatabase, SkillsCollection, TraitsCollection } from "@data";
import ClockPanel from "@module/apps/clocks/clock-panel.ts";
import { Pokedex } from "pokeapi-js-wrapper";
import { UUIDUtils } from "src/util/uuid.ts";
import TokenPanel from "@module/apps/token-panel.ts";
import { TokenPTR2e } from "@module/canvas/token/object.ts";
import PerkWeb from "@module/canvas/perk-tree/perk-web.ts";

const GamePTR = {
    onInit() {
        const initData = {
            web: new PerkWeb(),
            util: {
                sluggify,
                pokeApi: new Pokedex(),
                uuid: UUIDUtils,
                image: ImageResolver
            },
            data: {
                traits: TraitsCollection.create(),
                skills: SkillsCollection.create()
            },
            perks: new PerkManager(),
            tooltips: new TooltipsPTR2e(),
            clocks: {
                db: ClockDatabase,
                panel: new ClockPanel({ id: "ptr2e-clock-panel" }),
            },
            tokenPanel: new TokenPanel(null, { id: "ptr2e-token-panel" })
        };

        const top = document.querySelector("#ui-top") as HTMLElement;
        if (top) {
            const clockTemplate = document.createElement("template");
            clockTemplate.setAttribute("id", "ptr2e-clock-panel");
            top?.insertAdjacentElement("afterend", clockTemplate);

            const tokenTemplate = document.createElement("template");
            tokenTemplate.setAttribute("id", "ptr2e-token-panel");
            top?.insertAdjacentElement("afterend", tokenTemplate);
        }

        game.ptr = fu.mergeObject(game.ptr ?? {}, initData);
    },
    onSetup() {
        // Run "delayed" constructor of game.ptr.tooltips
        game.ptr.tooltips.observe();
    },
    onReady() {
        game.ptr.clocks.panel.render(true);
        game.ptr.tokenPanel.render(true);
        game.ptr.tokenPanel.token = game.user.character?.getActiveTokens().at(0) as TokenPTR2e | null;
    },
};

export { GamePTR };