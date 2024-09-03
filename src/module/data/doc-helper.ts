import { ActorPTR2e } from "@actor";
import { ItemPTR2e } from "@item";
import { MigrationList, MigrationRunner } from "@module/migration/index.ts";
import { MigrationRunnerBase } from "@module/migration/runner/base.ts";
import { isObject } from "@utils";

export async function preImportJSON<TDocument extends ActorPTR2e | ItemPTR2e>(document: TDocument, json: string) {
    const source:unknown = JSON.parse(json);
    if(!isObject<TDocument['_source']>(source)) return null;
    if(!isObject(source.system)) return null;

    const sourceSchemaVersion = Number(source.system?._migration?.version) || 0;
    const worldSchemaVersion = MigrationRunnerBase.LATEST_SCHEMA_VERSION;
    if(fu.isNewerVersion(sourceSchemaVersion, worldSchemaVersion)) {
        ui.notifications.error(game.i18n.format("PTR2E.ErrorMessage.CantImportTooHighVersion", {sourceSchemaVersion, worldSchemaVersion}));
        return null;
    }

    const newDoc = new (document.constructor as ConstructorOf<TDocument>)(source, {parent: document.parent});
    const migrations = MigrationList.constructFromVersion(newDoc.schemaVersion);
    await MigrationRunner.ensureSchemaVersion(newDoc, migrations);

    return JSON.stringify(newDoc.toObject());
}