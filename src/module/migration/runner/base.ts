import type { MigrationRecord } from "@module/data/mixins/has-migrations.ts";
import type { MigrationBase } from "@module/migration/base.ts";

interface CollectionDiff<T extends ActiveEffect.ConstructorData | Item.ConstructorData> {
  inserted: T[];
  deleted: string[];
  updated: T[];
}

export class MigrationRunnerBase {
  migrations: MigrationBase[];

  static LATEST_SCHEMA_VERSION = 0.109;

  static MINIMUM_SAFE_VERSION = 0.100;

  static RECOMMENDED_SAFE_VERSION = 0.100;

  /** The minimum schema version for the foundry version number */
  static FOUNDRY_SCHEMA_VERSIONS = {
    12: 0.100,
  };

  constructor(migrations: MigrationBase[] = []) {
    this.migrations = migrations.sort((a, b) => a.version - b.version);
  }

  needsMigration(currentVersion: number): boolean {
    return currentVersion < (this.constructor as typeof MigrationRunnerBase).LATEST_SCHEMA_VERSION;
  }

  diffCollection(orig: Item.ConstructorData[], updated: Item.ConstructorData[]): CollectionDiff<Item.ConstructorData> {
    const diffs: CollectionDiff<Item.ConstructorData> = {
      inserted: [],
      deleted: [],
      updated: [],
    };

    const origSources = new Map<string, Item.ConstructorData>();
    for (const source of orig) {
      origSources.set(source._id as string, source);
    }

    for (const source of updated) {
      const origSource = origSources.get(source._id as string);
      if (origSource) {
        // check to see if anything changed
        if (JSON.stringify(origSource) !== JSON.stringify(source)) {
          diffs.updated.push(source);
        }
        origSources.delete(source._id as string);
      } else {
        // it's new
        diffs.inserted.push(source);
      }
    }

    // since we've been deleting them as we process, the ones remaining need to be deleted
    for (const source of origSources.values()) {
      diffs.deleted.push(source._id as string);
    }

    return diffs;
  }

  async getUpdatedActor(actor: foundry.data.fields.SchemaField.PersistedType<Actor.Schema>, migrations: MigrationBase[]): Promise<Actor.ConstructorData> {
    const currentActor = foundry.utils.deepClone(actor)

    for (const migration of migrations) {
      for (const currentItem of currentActor.items as foundry.data.fields.SchemaField.PersistedType<Item.Schema>[]) {
        await migration.preUpdateItem?.(currentItem, currentActor);
      }
    }

    for (const migration of migrations) {
      await migration.updateActor?.(currentActor);

      for (const currentItem of currentActor.items as foundry.data.fields.SchemaField.PersistedType<Item.Schema>[]) {
        await migration.updateItem?.(currentItem, currentActor);
        if ('actions' in currentItem.system && currentItem.system.actions) {
          for (const action of currentItem.system.actions as unknown as PTR.Models.Action.Source[]) {
            migration.updateAction?.(action, currentItem);
          }
        }
      }

      for (const effect of currentActor.effects as foundry.data.fields.SchemaField.PersistedType<ActiveEffect.Schema>[]) {
        migration.updateEffect?.(effect, currentActor);
      }
    }

    // Don't set schema record on compendium JSON
    if ("game" in globalThis) {
      const latestMigration = migrations.slice(-1)[0];
      //@ts-expect-error - System type is Any, fix this later.
      currentActor.system._migration ??= { version: null, previous: null };
      //@ts-expect-error - System type is Any, fix this later.
      this.#updateMigrationRecord(currentActor.system._migration, latestMigration);
      for (const itemSource of currentActor.items as foundry.data.fields.SchemaField.PersistedType<Item.Schema>[]) {
        //@ts-expect-error - System type is Any, fix this later.
        itemSource.system._migration ??= { version: null, previous: null };
        //@ts-expect-error - System type is Any, fix this later.
        this.#updateMigrationRecord(itemSource.system._migration, latestMigration);
      }
    }

    return currentActor;
  }

  async getUpdatedItem(item: Item.ConstructorData, migrations: MigrationBase[]): Promise<Item.ConstructorData> {
    const current = foundry.utils.deepClone(item);

    for (const migration of migrations) {
      await migration.preUpdateItem?.(current);
    }

    for (const migration of migrations) {
      await migration.updateItem?.(current);
      if ('actions' in current.system! && current.system.actions) {
        for (const action of current.system.actions as unknown as PTR.Models.Action.Source[]) {
          migration.updateAction?.(action, current);
        }
      }

      for (const effect of current.effects as ActiveEffect.ConstructorData[]) {
        migration.updateEffect?.(effect, current);
      }
    }

    //@ts-expect-error - Type is not coming through, fix this later.
    if (migrations.length > 0) this.#updateMigrationRecord(current.system._migration, migrations.slice(-1)[0]);

    return current;
  }

  async getUpdatedTable(
    tableSource: RollTable.ConstructorData,
    migrations: MigrationBase[],
  ): Promise<RollTable.ConstructorData> {
    const current = foundry.utils.deepClone(tableSource);

    for (const migration of migrations) {
      try {
        await migration.updateTable?.(current);
      } catch (err) {
        console.error(err);
      }
    }

    return current;
  }

  async getUpdatedMacro(
    macroSource: Macro.ConstructorData,
    migrations: MigrationBase[],
  ): Promise<Macro.ConstructorData> {
    const current = foundry.utils.deepClone(macroSource);

    for (const migration of migrations) {
      try {
        await migration.updateMacro?.(current);
      } catch (err) {
        console.error(err);
      }
    }

    return current;
  }

  async getUpdatedJournalEntry(
    source: JournalEntry.ConstructorData,
    migrations: MigrationBase[],
  ): Promise<JournalEntry.ConstructorData> {
    const clone = foundry.utils.deepClone(source);

    for (const migration of migrations) {
      try {
        await migration.updateJournalEntry?.(clone);
      } catch (err) {
        console.error(err);
      }
    }

    return clone;
  }

  async getUpdatedToken(
    token: TokenDocument.ConfiguredInstance,
    migrations: MigrationBase[],
  ): Promise<TokenDocument.ConstructorData> {
    const current = token.toObject();
    for (const migration of migrations) {
      await migration.updateToken?.(current, token.actor, token.scene);
    }

    return current;
  }

  async getUpdatedUser(
    userData: User.ConstructorData,
    migrations: MigrationBase[],
  ): Promise<User.ConstructorData> {
    const current = foundry.utils.deepClone(userData);
    for (const migration of migrations) {
      try {
        await migration.updateUser?.(current);
      } catch (err) {
        console.error(err);
      }
    }

    return current;
  }

  #updateMigrationRecord(migrations: MigrationRecord, latestMigration: MigrationBase): void {
    if (!("game" in globalThis && latestMigration)) return;

    const fromVersion = typeof migrations.version === "number" ? migrations.version : null;
    migrations.version = latestMigration.version;
    migrations.previous = {
      schema: fromVersion,
      foundry: game.version,
      system: game.system.version,
    };
  }
}
