import { ActorPTR2e, ActorSystemPTR2e } from "@actor";
import { CombatPTR2e, CombatantPTR2e, CombatTrackerPTR2e } from "@combat";
import { ItemPTR2e, ItemSystemPTR } from "@item";
import { PerkManager } from "@module/apps/perk-manager/perk-manager.ts";
import { PerkDirectory } from "@module/apps/sidebar-perks/perks-directory.ts";
import { PerkTree } from "@module/canvas/perk-tree/perk-tree.ts";
import { ScenePTR2e } from "@module/canvas/scene.ts";
import { TokenDocumentPTR2e } from "@module/canvas/token/document.ts";
import { TokenPTR2e } from "@module/canvas/token/object.ts";
import { ChangeModel, ClockDatabase, Trait } from "@data";
import TooltipsPTR2e from "@module/tooltips/tooltips.ts";
import { PTRCONFIG } from "@scripts/config/index.ts";
import { sluggify } from "@utils";
import type EnJSON from "static/lang/en.json";
import ClockPanel from "@module/apps/clocks/clock-panel.ts";
import { Pokedex } from "pokeapi-js-wrapper";

interface GamePTR2e
    extends Game<
        ActorPTR2e<ActorSystemPTR2e, null>,
        Actors<ActorPTR2e<ActorSystemPTR2e, null>>,
        ChatMessage,
        Combat,
        ItemPTR2e<ItemSystemPTR, null>,
        Macro,
        Scene,
        User<ActorPTR2e<ActorSystemPTR2e, null>>
    > {
    ptr: {
        tree: PerkTree;
        util: {
            sluggify: typeof sluggify;
            pokeApi: Pokedex;
        };
        data: {
            traits: Map<string, Trait>;
        };
        perks: PerkManager;
        tooltips: TooltipsPTR2e;
        clocks: {
            db: typeof ClockDatabase;
            panel: ClockPanel;
        };
    };
}

type ConfiguredConfig = Config<
    AmbientLightDocument<ScenePTR2e | null>,
    ActiveEffect<ActorPTR2e | ItemPTR2e | null>,
    ActorPTR2e,
    ActorDelta<TokenDocumentPTR2e>,
    ChatLog,
    ChatMessage,
    CombatPTR2e,
    CombatantPTR2e<CombatPTR2e | null>,
    CombatTrackerPTR2e<CombatPTR2e | null>,
    CompendiumDirectory,
    Hotbar,
    ItemPTR2e,
    Macro,
    MeasuredTemplateDocument<ScenePTR2e | null>,
    TileDocument<ScenePTR2e | null>,
    TokenDocumentPTR2e,
    WallDocument<ScenePTR2e | null>,
    ScenePTR2e,
    User,
    EffectsCanvasGroup
>;

declare global {
    interface ConfigPTR2e extends ConfiguredConfig {
        PTR: typeof PTRCONFIG;
        ui: ConfiguredConfig["ui"] & {
            perksTab: new () => PerkDirectory;
        };
        Change: {
            documentClass: typeof ChangeModel;
            dataModels: Record<string, Partial<foundry.abstract.TypeDataModel>>;
        };
    }

    const CONFIG: ConfigPTR2e;
    const canvas: Canvas<
        ScenePTR2e,
        AmbientLight<AmbientLightDocument<ScenePTR2e>>,
        MeasuredTemplate<MeasuredTemplateDocument<ScenePTR2e>>,
        TokenPTR2e<TokenDocumentPTR2e<ScenePTR2e>>,
        EffectsCanvasGroup
    >;

    namespace globalThis {
        var game: GamePTR2e;

        var fu: typeof foundry.utils;

        var ui: FoundryUI<
            ActorDirectory<ActorPTR2e<ActorSystemPTR2e, null>>,
            ItemDirectory<ItemPTR2e<ItemSystemPTR, null>>,
            ChatLog,
            CompendiumDirectory,
            CombatTracker<Combat | null>
        > & {
            perks: PerkDirectory;
        };

        function getTexture(src: string): PIXI.Texture | PIXI.Spritesheet | null;

        var actor: () => ActorPTR2e<ActorSystemPTR2e, TokenDocumentPTR2e<ScenePTR2e> | null> | null;

        let _maxZ: number;
    }

    const BUILD_MODE: "development" | "production";
    const EN_JSON: typeof EnJSON;
}
