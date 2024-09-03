
import { ActorPTR2e } from "@actor";
import { ActionPTR2e } from "@data";
import { ActiveEffectPTR2e } from "@effects";
import { ItemPTR2e } from "@item";
import { ScenePTR2e } from "@module/canvas/scene.ts";
import { TokenDocumentPTR2e } from "@module/canvas/token/document.ts";
import { MigrationRecord } from "@module/data/mixins/has-migrations.ts";
import { MigrationBase } from "@module/migration/base.ts";

interface CollectionDiff<T extends foundry.documents.ActiveEffectSource | ItemPTR2e['_source']> {
    inserted: T[];
    deleted: string[];
    updated: T[];
}

export class MigrationRunnerBase {
    migrations: MigrationBase[];

    static LATEST_SCHEMA_VERSION = 0.105;

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

    diffCollection(orig: ItemPTR2e['_source'][], updated: ItemPTR2e['_source'][]): CollectionDiff<ItemPTR2e['_source']> {
        const diffs: CollectionDiff<ItemPTR2e['_source']> = {
            inserted: [],
            deleted: [],
            updated: [],
        };

        const origSources = new Map<string, ItemPTR2e['_source']>();
        for (const source of orig) {
            origSources.set(source._id!, source);
        }

        for (const source of updated) {
            const origSource = origSources.get(source._id!);
            if (origSource) {
                // check to see if anything changed
                if (JSON.stringify(origSource) !== JSON.stringify(source)) {
                    diffs.updated.push(source);
                }
                origSources.delete(source._id!);
            } else {
                // it's new
                diffs.inserted.push(source);
            }
        }

        // since we've been deleting them as we process, the ones remaining need to be deleted
        for (const source of origSources.values()) {
            diffs.deleted.push(source._id!);
        }

        return diffs;
    }

    async getUpdatedActor(actor: ActorPTR2e['_source'], migrations: MigrationBase[]): Promise<ActorPTR2e['_source']> {
        const currentActor = fu.deepClone(actor);

        for (const migration of migrations) {
            for (const currentItem of currentActor.items as ItemPTR2e['_source'][]) {
                await migration.preUpdateItem?.(currentItem, currentActor);
            }
        }

        for (const migration of migrations) {
            await migration.updateActor?.(currentActor);

            for (const currentItem of currentActor.items as ItemPTR2e['_source'][]) {
                await migration.updateItem?.(currentItem, currentActor);
                if('actions' in currentItem.system && currentItem.system.actions) {
                    for (const action of currentItem.system.actions as unknown as ActionPTR2e['_source'][]) {
                        migration.updateAction?.(action, currentItem);
                    }
                }
            }

            for (const effect of currentActor.effects as ActiveEffectPTR2e['_source'][]) {
                migration.updateEffect?.(effect, currentActor);
            }
        }

        // Don't set schema record on compendium JSON
        if ("game" in globalThis) {
            const latestMigration = migrations.slice(-1)[0];
            currentActor.system._migration ??= { version: null, previous: null };
            this.#updateMigrationRecord(currentActor.system._migration, latestMigration);
            for (const itemSource of currentActor.items as ItemPTR2e['_source'][]) {
                itemSource.system._migration ??= { version: null, previous: null };
                this.#updateMigrationRecord(itemSource.system._migration, latestMigration);
            }
        }

        return currentActor;
    }

    async getUpdatedItem(item: ItemPTR2e['_source'], migrations: MigrationBase[]): Promise<ItemPTR2e['_source']> {
        const current = fu.deepClone(item);

        for (const migration of migrations) {
            await migration.preUpdateItem?.(current);
        }

        for (const migration of migrations) {
            await migration.updateItem?.(current);
            
            if('actions' in current.system && current.system.actions) {
                for (const action of current.system.actions as unknown as ActionPTR2e['_source'][]) {
                    migration.updateAction?.(action, current);
                }
            }

            for (const effect of current.effects as ActiveEffectPTR2e['_source'][]) {
                migration.updateEffect?.(effect, current);
            }
        }

        if (migrations.length > 0) this.#updateMigrationRecord(current.system._migration, migrations.slice(-1)[0]);

        return current;
    }

    async getUpdatedTable(
        tableSource: foundry.documents.RollTableSource,
        migrations: MigrationBase[],
    ): Promise<foundry.documents.RollTableSource> {
        const current = fu.deepClone(tableSource);

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
        macroSource: foundry.documents.MacroSource,
        migrations: MigrationBase[],
    ): Promise<foundry.documents.MacroSource> {
        const current = fu.deepClone(macroSource);

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
        source: foundry.documents.JournalEntrySource,
        migrations: MigrationBase[],
    ): Promise<foundry.documents.JournalEntrySource> {
        const clone = fu.deepClone(source);

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
        token: TokenDocumentPTR2e<ScenePTR2e>,
        migrations: MigrationBase[],
    ): Promise<foundry.documents.TokenSource> {
        const current = token.toObject();
        for (const migration of migrations) {
            await migration.updateToken?.(current, token.actor, token.scene);
        }

        return current;
    }

    async getUpdatedUser(
        userData: foundry.documents.UserSource,
        migrations: MigrationBase[],
    ): Promise<foundry.documents.UserSource> {
        const current = fu.deepClone(userData);
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
