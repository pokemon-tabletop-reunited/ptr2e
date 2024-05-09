import { DocumentSheetRenderOptions, DocumentSheetConfiguration, DocumentSheetV2 } from "./api.js";

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



export {
    ActorSheetV2,
    ItemSheetV2
}