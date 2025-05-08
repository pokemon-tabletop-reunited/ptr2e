import { DocumentSheetRenderOptions, DocumentSheetConfiguration, DocumentSheetV2, ApplicationV2 } from "./api.js";

declare class ActorSheetV2<
    TDocument extends Actor = Actor,
    TRenderOptions extends DocumentSheetRenderOptions = DocumentSheetRenderOptions,
    TConfiguration extends DocumentSheetConfiguration = DocumentSheetConfiguration,
> extends DocumentSheetV2<TDocument, TRenderOptions, TConfiguration> {
    /**
     * The Actor document managed by this sheet.
     * @type {ClientDocument}
     */
    get actor(): TDocument;

    /**
     * If this sheet manages the ActorDelta of an unlinked Token, reference that Token document.
     * @type {TokenDocument|null}
     */
    get token(): TokenDocument | null;
}

declare class ItemSheetV2<
    TDocument extends Item = Item,
    TActorDocument extends Actor = Actor,
    TRenderOptions extends DocumentSheetRenderOptions = DocumentSheetRenderOptions,
    TConfiguration extends DocumentSheetConfiguration = DocumentSheetConfiguration,
> extends DocumentSheetV2<TDocument, TRenderOptions, TConfiguration> {
    /**
     * The Actor document managed by this sheet.
     * @type {ClientDocument|null}
     */
    get actor(): TActorDocument | null;

    /**
     * If this sheet manages the ActorDelta of an unlinked Token, reference that Token document.
     * @type {TokenDocument}
     */
    get item(): TDocument;
}

declare class FolderConfig extends DocumentSheetV2<Folder> {
}

declare class _TokenConfig<
  TDocument extends TokenDocument,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TOptions extends DocumentSheetOptions = DocumentSheetOptions,
> extends DocumentSheetV2<TDocument> {}

declare class PrototypeTokenConfig extends ApplicationV2 {

}

export {
    ActorSheetV2,
    ItemSheetV2,
    ActiveEffectConfig,
    FolderConfig,
    _TokenConfig as TokenConfig,
    PrototypeTokenConfig,
}
