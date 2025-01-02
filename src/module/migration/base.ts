import type { ActionPTR2e } from "@data";

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
     * @param source This should be effectively a `Actor.ConstructorData` from the previous version.
     */
    updateActor?(source: Actor.ConstructorData): Promise<void>;

    /**
     * Update the item to the latest schema version, handling changes that must happen before any other migration in a
     * given list.
     * @param source Item to update. This should be an `Item.ConstructorData` from the previous version
     * @param actorSource If the item is part of an actor, this is set to the actor source
     */
    preUpdateItem?(source: Item.ConstructorData, actorSource?: Actor.ConstructorData): Promise<void>;

    /**
     * Update the action to the latest schema version.
     * @param source Action to update. This should be an `ActionPTR2e['_source']` from the previous version.
     * @param itemSource The action's parent item
     */
    updateAction?(source: ActionPTR2e['_source'], itemSource: Item.ConstructorData): Promise<void>;

    /**
     * Update the item to the latest schema version.
     * @param source Item to update. This should be an `Item.ConstructorData` from the previous version.
     * @param actorSource If the item is part of an actor, this is set to the actor. For instance
     */
    updateItem?(source: Item.ConstructorData, actorSource?: Actor.ConstructorData): Promise<void>;

    /**
     * Update the effect to the latest schema version.
     * @param source Effect to update. This should be an `ActiveEffect.ConstructorData` from the previous version.
     * @param parentSource The effect's parent
     */
    updateEffect?(source: ActiveEffect.ConstructorData, parentSource: Item.ConstructorData | Actor.ConstructorData): Promise<void>;

    /**
     * Update the macro to the latest schema version.
     * @param source Macro data to update. This should be a `MacroData` from the previous version.
     */
    updateJournalEntry?(source: JournalEntry.ConstructorData): Promise<void>;

    /**
     * Update the macro to the latest schema version.
     * @param source Macro data to update. This should be a `MacroData` from the previous version.
     */
    updateMacro?(source: Macro.ConstructorData): Promise<void>;

    /**
     * Update the rollable table to the latest schema version.
     * @param source Rolltable data to update. This should be a `RollTableData` from the previous version.
     */
    updateTable?(source: RollTable.ConstructorData): Promise<void>;

    /**
     * Update the token to the latest schema version.
     * @param tokenData Token data to update. This should be a `TokenData` from the previous version.
     */
    updateToken?(
        tokenData: Token.ConstructorData,
        actor: Readonly<Actor.ConfiguredInstance | null>,
        scene: Readonly<Scene.ConfiguredInstance | null>,
    ): Promise<void>;

    /**
     * Update the user to the latest schema version.
     * @param userData User's data to update. This should be a `UserData` from the previous version.
     */
    updateUser?(userData: User.ConstructorData): Promise<void>;

    /**
     * Run migrations for this schema version.
     * Sometimes there needs to be custom steps run during a migration. For instance, if the change
     * isn't actor or item related. This function will be called during the migration.
     */
    migrate?(): Promise<void>;
}

export { MigrationBase };
