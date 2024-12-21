import { MigrationRunner } from "../module/migration/runner/index.ts";

/** Store the world system and schema versions for the first time */
export async function storeInitialWorldVersions(): Promise<void> {
    if (!game.user.hasRole(CONST.USER_ROLES.GAMEMASTER)) return;

    const storedSystemVersion = game.settings.storage.get("world").getItem("ptr2e.worldSystemVersion");
    if (!storedSystemVersion) {
        await game.settings.set("ptr2e", "worldSystemVersion", game.system.version);
    }

    const storedSchemaVersion = game.settings.storage.get("world").getItem("ptr2e.worldSchemaVersion");
    if (!storedSchemaVersion) {
        const minimumVersion = MigrationRunner.RECOMMENDED_SAFE_VERSION;
        const currentVersion =
            game.actors.size === 0
                ? game.settings.get("ptr2e", "worldSchemaVersion")
                : Math.max(
                      Math.min(...new Set(game.actors.map((actor) => actor.schemaVersion ?? minimumVersion))),
                      minimumVersion,
                  );
        await game.settings.set("ptr2e", "worldSchemaVersion", currentVersion);
    }
}
