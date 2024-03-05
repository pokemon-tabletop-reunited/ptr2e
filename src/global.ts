import { ActorPTR2e, ActorSystemPTR2e } from "@actor";
import { CombatPTR2e, CombatantPTR2e, CombatTrackerPTR2e } from "@combat";
import { ItemPTR2e, ItemSystemPTR } from "@item";
import { PerkManager } from "@module/apps/perk-manager/perk-manager.ts";
import { PerkDirectory } from "@module/apps/sidebar-perks/perks-directory.ts";
import { PerkTree } from "@module/canvas/perk-tree/perk-tree.ts";
import { TokenDocumentPTR2e } from "@module/canvas/token/document.ts";
import { TokenPTR2e } from "@module/canvas/token/object.ts";
import { ChangeModel } from "@module/data/models/change.ts";
import TooltipsPTR2e from "@module/tooltips/tooltips.ts";
import { PTRCONFIG } from "@scripts/config/index.ts";
import { sluggify } from "@utils";
import type EnJSON from "static/lang/en.json";

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
        data: {
            traits: Map<string, Trait>;
        }
        util: {
            sluggify: typeof sluggify;
        };
        perks: PerkManager;
        tooltips: TooltipsPTR2e;
    }
}

type ConfiguredConfig = Config<
    AmbientLightDocument<Scene | null>,
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
    MeasuredTemplateDocument<Scene | null>,
    TileDocument<Scene | null>,
    TokenDocumentPTR2e,
    WallDocument<Scene | null>,
    Scene,
    User,
    EffectsCanvasGroup
>;

declare global {
    interface ConfigPTR2e extends ConfiguredConfig {
        PTR: typeof PTRCONFIG;
        ui: ConfiguredConfig["ui"] & {
            perksTab: new () => PerkDirectory;
        },
        Change: {
            documentClass: typeof ChangeModel;
            dataModels: Record<string, Partial<foundry.abstract.TypeDataModel>>;
        }
    }

    const CONFIG: ConfigPTR2e;
    const canvas: Canvas<
        Scene,
        AmbientLight<AmbientLightDocument<Scene>>,
        MeasuredTemplate<MeasuredTemplateDocument<Scene>>,
        TokenPTR2e<TokenDocumentPTR2e<Scene>>,
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

        var actor: () => ActorPTR2e<ActorSystemPTR2e, TokenDocumentPTR2e<Scene> | null> | null;

        let _maxZ: number;
    }

    const BUILD_MODE: "development" | "production";
    const EN_JSON: typeof EnJSON;
}