import { ActorPTR2e } from "@actor";
import { ActionPTR2e } from "@data";
import { ActiveEffectPTR2e } from "@effects";
import { ItemPTR2e } from "@item";
import { ScenePTR2e } from "@module/canvas/scene.ts";

/**
 * This is the base class for a migration.
 * If you make a change to the database schema (i.e. any class extending a TypeDataModel),
 * you should create a migration. To do so, there are several steps:
 * - Bump the schema number in system.json
 * - Make a class that inherits this base class and implements `updateActor` or `updateItem` using the
 *   new value of the schema number as the version
 * - Add this class to getAllMigrations() in src/module/migrations/index.ts
 * - Test that your changes work. We have unit tests in tests/module/migration.test.ts as well as you
 *   should add your migration to packs/run-migration
 */
abstract class MigrationBase {
    /**
     * This is the schema version. Make sure it matches the new version in system.json
     */
    static readonly version: number;

    readonly version = (this.constructor as typeof MigrationBase).version;

    /**
     * Setting requiresFlush to true will indicate that the migration runner should not call any more
     * migrations after this in a batch. Use this if you are adding items to actors for instance.
     */
    requiresFlush = false;
}

/** Optional methods */
interface MigrationBase {
    /**
     * Update the actor to the latest schema version.
     * @param source This should be effectively a `ActorPTR2e['_source']` from the previous version.
     */
    updateActor?(source: ActorPTR2e['_source']): Promise<void>;

    /**
     * Update the item to the latest schema version, handling changes that must happen before any other migration in a
     * given list.
     * @param source Item to update. This should be an `ItemPTR2e['_source']` from the previous version
     * @param actorSource If the item is part of an actor, this is set to the actor source
     */
    preUpdateItem?(source: ItemPTR2e['_source'], actorSource?: ActorPTR2e['_source']): Promise<void>;

    /**
     * Update the action to the latest schema version.
     * @param source Action to update. This should be an `ActionPTR2e['_source']` from the previous version.
     * @param itemSource The action's parent item
     */
    updateAction?(source: ActionPTR2e['_source'], itemSource: ItemPTR2e['_source']): Promise<void>;

    /**
     * Update the item to the latest schema version.
     * @param source Item to update. This should be an `ItemPTR2e['_source']` from the previous version.
     * @param actorSource If the item is part of an actor, this is set to the actor. For instance
     */
    updateItem?(source: ItemPTR2e['_source'], actorSource?: ActorPTR2e['_source']): Promise<void>;

    /**
     * Update the effect to the latest schema version.
     * @param source Effect to update. This should be an `ActiveEffectPTR2e['_source']` from the previous version.
     * @param parentSource The effect's parent
     */
    updateEffect?(source: ActiveEffectPTR2e['_source'], parentSource: ItemPTR2e['_source'] | ActorPTR2e['_source']): Promise<void>;

    /**
     * Update the macro to the latest schema version.
     * @param source Macro data to update. This should be a `MacroData` from the previous version.
     */
    updateJournalEntry?(source: foundry.documents.JournalEntrySource): Promise<void>;

    /**
     * Update the macro to the latest schema version.
     * @param source Macro data to update. This should be a `MacroData` from the previous version.
     */
    updateMacro?(source: foundry.documents.MacroSource): Promise<void>;

    /**
     * Update the rollable table to the latest schema version.
     * @param source Rolltable data to update. This should be a `RollTableData` from the previous version.
     */
    updateTable?(source: foundry.documents.RollTableSource): Promise<void>;

    /**
     * Update the token to the latest schema version.
     * @param tokenData Token data to update. This should be a `TokenData` from the previous version.
     */
    updateToken?(
        tokenData: foundry.documents.TokenSource,
        actor: Readonly<ActorPTR2e | null>,
        scene: Readonly<ScenePTR2e | null>,
    ): Promise<void>;

    /**
     * Update the user to the latest schema version.
     * @param userData User's data to update. This should be a `UserData` from the previous version.
     */
    updateUser?(userData: foundry.documents.UserSource): Promise<void>;

    /**
     * Run migrations for this schema version.
     * Sometimes there needs to be custom steps run during a migration. For instance, if the change
     * isn't actor or item related. This function will be called during the migration.
     */
    migrate?(): Promise<void>;
}

export { MigrationBase };
