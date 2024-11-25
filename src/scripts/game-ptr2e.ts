import { PerkManager } from "@module/apps/perk-manager/perk-manager.ts";
import TooltipsPTR2e from "@module/tooltips/tooltips.ts";
import { ImageResolver, sluggify } from "@utils";
import { ArtMapCollection, ClockDatabase, SkillsCollection, TraitsCollection } from "@data";
import ClockPanel from "@module/apps/clocks/clock-panel.ts";
import { Pokedex } from "pokeapi-js-wrapper";
import { UUIDUtils } from "src/util/uuid.ts";
import TokenPanel from "@module/apps/token-panel.ts";
import { TokenPTR2e } from "@module/canvas/token/object.ts";
import PerkWeb from "@module/canvas/perk-tree/perk-web.ts";
import { TextEnricher } from "./ui/text-enrichers.ts";
import { remigrate } from "@system/remigrate.ts";
import { DataStructure } from "@module/apps/data-inspector/data-handler.ts";
import { CompendiumBrowser } from "@module/apps/compendium-browser/index.ts";
import { TutorListSettings } from "@system/tutor-list/setting-model.ts";
import { TutorListApp } from "@module/apps/tutor-list.ts";
import { CombatPTR2e } from "@combat";

const GamePTR = {
  onInit() {
    const initData = {
      api: {
        DataStructure
      },
      web: new PerkWeb(),
      util: {
        sluggify,
        pokeApi: new Pokedex(),
        uuid: UUIDUtils,
        image: ImageResolver
      },
      data: {
        traits: TraitsCollection.create(),
        skills: SkillsCollection.create(),
        artMap: ArtMapCollection.create(),
        afflictions: new Map(CONFIG.statusEffects.map(se => [se.id, se]))
      },
      system: {
        remigrate: remigrate
      },
      perks: new PerkManager(),
      tooltips: new TooltipsPTR2e(),
      clocks: {
        db: ClockDatabase,
        panel: new ClockPanel({ id: "ptr2e-clock-panel" }),
      },
      tokenPanel: new TokenPanel(null, { id: "ptr2e-token-panel" }),
      tutorList: new TutorListApp({id: "ptr2e-tutor-list"}),
    };

    // Add reference for 'fainted' to the 'dead' condition
    initData.data.afflictions.set("fainted", initData.data.afflictions.get("dead")!);

    // Initialize the text enricher
    TextEnricher.init();

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
    // If there are any active combats, make sure to handle Summon Effects
    // This needs to be done in Setup as Combat & Combatants aren't yet initialized when actors get initialized.
    for(const combat of (game.combats?.contents ?? []) as CombatPTR2e[]) {
      if(!combat.active) continue;
      const summons = combat.summons;
      if(!summons?.length) continue;

      for(const summon of summons) {
        summon.system.notifyActorsOfEffectsIfApplicable(combat.combatants.contents);
      }
    }
    
    game.ptr.clocks.panel.render(true);
    game.ptr.tokenPanel.render(true);
    game.ptr.tokenPanel.token = game.user.character?.getActiveTokens().at(0) as TokenPTR2e | null;

    // Initialize the art map collection.
    game.ptr.data.artMap.refresh();

    // Initialize the compendium browser
    game.ptr.compendiumBrowser = new CompendiumBrowser();

    game.ptr.data.tutorList = game.settings.get("ptr2e", "tutorListData");
    TutorListSettings.initializeAndMigrate();
  },
};

export { GamePTR };