import { ApplicationRenderOptions } from "types/foundry/common/applications/api.js";

/**
 * Extends the basic ApplicationV2 class to incorporate shared functionality for Document applications
 * This is a rudemantary implementation without any form logic, following the same pattern as the original DocumentSheet
 */
export class DocumentSheetV2<Document extends Item | Actor> extends foundry.applications.api.ApplicationV2 {
    _submitting?: boolean;

    /**
     * @param {ClientDocument} object A Document instance which should be managed by this application.
     * @inheritdoc
     */
    constructor(object: foundry.abstract.Document, options: Partial<foundry.applications.api.ApplicationConfiguration>) {
        super(options);
        this.object = object;
    }

    /**
     * @inheritdoc
     */
    static override DEFAULT_OPTIONS = {
        ...foundry.applications.api.ApplicationV2.DEFAULT_OPTIONS,
        classes: ["document-sheet"],
        editable: true
    };

    /**
     * @inheritdoc
     */
    override get title() {
        const reference = 'name' in this.document ? ` ${this.document.name}` : "";
        return `${game.i18n.localize((this.document.constructor as typeof foundry.abstract.Document).metadata.label)}${reference}`;
    }

    /**
     * A semantic convenience reference to the Document instance which is the target object for this form.
     * @type {ClientDocument}
     */
    get document(): Document {
        return this.object;
    }

    /**
     * Is the Form Application currently editable?
     * @type {boolean}
     */
    get isEditable() {
        return !!this.options.editable;
    }

    /**
     * Adds the same data as the original DocumentSheet, @see DocumentSheet[getData]
     * @returns {Promise<Record<string, unknown>>}
     */
    override async _prepareContext(): Promise<Partial<DocumentContext<Document>>> {
        return {
            document: this.document,
            // @ts-ignore
            data: this.document.toObject(false),
            limited: this.document.limited,
            options: this.options,
            owner: this.document.isOwner,
            title: this.title,
        }
    }
    /* -------------------------------------------- */
    /*  Submit Formdata to Document                 */
    /* -------------------------------------------- */
    async _updateDocument(formData: FormDataExtended): Promise<Document | false> {
        if ((this.state === Application.RENDER_STATES.NONE) || !this.isEditable || this._submitting) return false;
        this._submitting = true;

        const updateData = fu.flattenObject(formData.object)

        try {
            if(!this.document.id) return false;
            await this.document.update(updateData);
        }
        catch(error) {
            console.error(error);
        }

        this._submitting = false;
        return this.document;
    }

    /* -------------------------------------------- */
    /*  Bring to Top App V1 Copy                    */
    /* -------------------------------------------- */

    override _onFirstRender(context: Object, options: ApplicationRenderOptions): void {
        super._onFirstRender(context, options);
        this.bringToTop();
    }

    override _attachFrameListeners(): void {
        super._attachFrameListeners();
        if (this.hasFrame) {
            this.element.addEventListener("pointerdown", _ev => this.bringToTop(), { passive: true });
        }
    }

    bringToTop(): void {
        const z = document.defaultView?.getComputedStyle(this.element).zIndex;
        if (Number(z) < _maxZ) {
            this.position.zIndex = Math.min(++_maxZ, 99999);
            this.element.style.zIndex = this.position.zIndex.toString();
        }
    }
}

export type DocumentContext<Document extends Item | Actor> = {
    document: Document;
    data: ReturnType<Document["toObject"]>;
    limited: boolean;
    options: foundry.applications.api.ApplicationConfiguration;
    owner: boolean;
    title: string;
    [key: string]: unknown;
}