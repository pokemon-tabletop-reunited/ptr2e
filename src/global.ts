import { PTRActor } from "./module/actor/base.ts";
import PTRPerkTree from "./module/canvas/perk-tree/perk-tree.mjs";
import { PTRItem } from "./module/item/base.ts";
import type EnJSON from "static/lang/en.json";
import { PTRCONFIG } from "./scripts/config/index.ts";
import { TokenDocumentPTR2e } from "./module/canvas/token/document.ts";
import { TokenPTR2e } from "./module/canvas/token/object.ts";
import { PerkDirectory } from "./module/apps/sidebar-perks/perks-directory.ts";
import { PTRCombat } from "./module/combat/document.ts";
import { PTRCombatTracker } from "./module/combat/tracker.ts";
import { PTRCombatant } from "./module/combat/combatant.ts";
import ItemSystemBase from "./module/item/document.ts";

interface GamePTR2e
    extends Game<
        PTRActor<null>,
        Actors<PTRActor<null>>,
        ChatMessage,
        Combat,
        PTRItem<ItemSystemBase, null>,
        Macro,
        Scene,
        User<PTRActor<null>>
    > {
    ptr: {
        tree: PTRPerkTree;
    }
}

type ConfiguredConfig = Config<
    AmbientLightDocument<Scene | null>,
    ActiveEffect<PTRActor | PTRItem | null>,
    PTRActor,
    ActorDelta<TokenDocumentPTR2e>,
    ChatLog,
    ChatMessage,
    PTRCombat,
    PTRCombatant<PTRCombat | null>,
    PTRCombatTracker<PTRCombat | null>,
    CompendiumDirectory,
    Hotbar,
    PTRItem,
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
            perks: new () => PerkDirectory;
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
            ActorDirectory<PTRActor<null>>,
            ItemDirectory<PTRItem<ItemSystemBase, null>>,
            ChatLog,
            CompendiumDirectory,
            CombatTracker<Combat | null>
        > & {
            perks: PerkDirectory;
        };

        function getTexture(src: string): PIXI.Texture | PIXI.Spritesheet | null;

        var actor: () => PTRActor<TokenDocumentPTR2e<Scene> | null> | null;
    }

    const BUILD_MODE: "development" | "production";
    const EN_JSON: typeof EnJSON;
}