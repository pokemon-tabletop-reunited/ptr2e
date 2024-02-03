import { ActorPTR2e } from "@actor";

export class MockToken {
    actor: ActorPTR2e | null;
    readonly parent: Scene | null;
    readonly _source: foundry.documents.TokenSource;

    constructor(
        data: foundry.documents.TokenSource,
        context: { parent?: Scene | null; actor?: ActorPTR2e | null } = {},
    ) {
        this._source = fu.duplicate(data);
        this.parent = context.parent ?? null;
        this.actor = context.actor ?? null;
    }

    get id() {
        return this._source._id ?? "";
    }

    get name() {
        return this._source.name;
    }

    get scene() {
        return this.parent;
    }

    update(
        changes: EmbeddedDocumentUpdateData,
        context: SceneEmbeddedModificationContext<NonNullable<this["parent"]>> = {},
    ): void {
        changes._id = this.id;
        this.scene?.updateEmbeddedDocuments("Token", [changes], context);
    }
}
