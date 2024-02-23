import { ApplicationRenderOptions, ApplicationRenderContext } from "types/foundry/common/applications/api.js";

type DocumentSheetOptions = {
    editable?: boolean;
} & foundry.applications.api.ApplicationConfiguration;

export class DocumentSheetV2<TDocument extends ClientDocument> extends foundry.applications.api.ApplicationV2 {
    declare options: DocumentSheetOptions;

    object: TDocument;

    constructor(object: TDocument, options: Partial<DocumentSheetOptions>) {
        super(options);

        this.object = object;
    }

    static override DEFAULT_OPTIONS: Omit<foundry.applications.api.ApplicationConfiguration, "uniqueId"> = {
        ...foundry.applications.api.ApplicationV2.DEFAULT_OPTIONS,
        classes: ["document-sheet"],
        tag: "article",
    };

    override get title() {
        const reference = 'name' in this.document ? ` ${this.document.name}` : "";
        return `${game.i18n.localize((this.document.constructor as typeof foundry.abstract.Document).metadata.label)}${reference}`;
    }

    get document() {
        return this.object;
    }

    /**
     * Should the DocumentSheet be editable based on the current user's permissions?
     */
    get isEditable() {
        let editable = this.options.editable && this.document.isOwner;
        if (this.document.pack) {
            const pack = game.packs.get(this.document.pack);
            if (pack?.locked) editable = false;
        }
        return editable ?? false;
    }

    override async _prepareContext(_: ApplicationRenderOptions): Promise<ApplicationRenderContext> {
        const data = this.document.toObject(false);
        const isEditable = this.isEditable;

        return {
            cssClass: isEditable ? "editable" : "locked",
            editable: isEditable,
            document: this.document,
            data: data,
            limited: this.document.limited,
            options: this.options,
            owner: this.document.isOwner,
            title: this.title,
        }
    }
}
