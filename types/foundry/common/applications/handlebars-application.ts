import { AppV2Constructor, ApplicationConfiguration, ApplicationRenderContext, ApplicationRenderOptions, HandlebarsRenderOptions, HandlebarsTemplatePart } from "./api.js";

function HandlebarsApplicationMixin<BaseClass extends AppV2Constructor<ApplicationConfiguration, HandlebarsRenderOptions>, TRenderOptions extends HandlebarsRenderOptions = HandlebarsRenderOptions>(BaseClass: BaseClass) {
    class ApplicationV2Mixin extends BaseClass {
        /**
         * Configure a registry of template parts which are supported for this application for partial rendering.
         * @type {Record<string, HandlebarsTemplatePart>}
         */
        static PARTS: Record<string, HandlebarsTemplatePart>;
    }

    interface ApplicationV2Mixin {
        /**
         * A record of all rendered template parts.
         * @returns {Record<string, HTMLElement>}
         */
        get parts(): Record<string, HTMLElement>;

        /** @inheritDoc */
        _configureRenderOptions(options: TRenderOptions): void;

        /* -------------------------------------------- */

        /** @inheritDoc */
        _preFirstRender(context: Object, options: TRenderOptions): Promise<void>;

        /* -------------------------------------------- */

        /**
         * Render each configured application part using Handlebars templates.
         * @param {ApplicationRenderContext} context        Context data for the render operation
         * @param {HandlebarsRenderOptions} options        Options which configure application rendering behavior
         * @returns {Promise<Record<string, HTMLElement>>}  A single rendered HTMLElement for each requested part
         * @protected
         * @override
         */
        _renderHTML(context: ApplicationRenderContext, options: TRenderOptions): Promise<Record<string, HTMLElement>>;

        /* -------------------------------------------- */

        /**
         * Replace the HTML of the application with the result provided by Handlebars rendering.
         * @param {Record<string, HTMLElement>} result  The result from Handlebars template rendering
         * @param {HTMLElement} content                 The content element into which the rendered result must be inserted
         * @param {ApplicationRenderOptions} options    Options which configure application rendering behavior
         * @protected
         * @override
         */
        _replaceHTML(result: Record<string, HTMLElement>, content: HTMLElement, options: ApplicationRenderOptions): void;

        /* -------------------------------------------- */

        /**
         * Prepare data used to synchronize the state of a template part.
         * @param {string} partId                       The id of the part being rendered
         * @param {HTMLElement} newElement              The new rendered HTML element for the part
         * @param {HTMLElement} priorElement            The prior rendered HTML element for the part
         * @param {object} state                        A state object which is used to synchronize after replacement
         * @protected
         */
        _preSyncPartState(partId: string, newElement: HTMLElement, priorElement: HTMLElement, state: Object): void;

        /* -------------------------------------------- */

        /**
         * Synchronize the state of a template part after it has been rendered and replaced in the DOM.
         * @param {string} partId                       The id of the part being rendered
         * @param {HTMLElement} newElement              The new rendered HTML element for the part
         * @param {HTMLElement} priorElement            The prior rendered HTML element for the part
         * @param {object} state                        A state object which is used to synchronize after replacement
         * @protected
         */
        _syncPartState(partId: string, newElement: HTMLElement, priorElement: HTMLElement, state: Object): void;

        /* -------------------------------------------- */
        /*  Event Listeners and Handlers                */
        /* -------------------------------------------- */

        /**
         * Attach event listeners to rendered template parts.
         * @param {string} partId                       The id of the part being rendered
         * @param {HTMLElement} htmlElement             The rendered HTML element for the part
         * @param {ApplicationRenderOptions} options    Rendering options passed to the render method
         * @protected
         */
        _attachPartListeners(partId: string, htmlElement: HTMLElement, options: TRenderOptions): void;
    }

    return ApplicationV2Mixin;
}

export type {
    HandlebarsRenderOptions,
    HandlebarsTemplatePart
}

export {
    HandlebarsApplicationMixin
}