import { EventEmitter, EventEmitterMixin } from "./event-emitter.ts";

export enum RENDER_STATES {
    ERROR = -3,
    CLOSING = -2,
    CLOSED = -1,
    NONE = 0,
    RENDERING = 1,
    RENDERED = 2,
}

type ApplicationConfiguration = {
    /** An HTML element identifier used for this Application instance */
    id: string;
    /** An string discriminator substituted for {id} in the default HTML element identifier for the class*/
    uniqueId: string;

    /** An array of CSS classes to apply to the Application */
    classes: string[];
    /** The HTMLElement tag type used for the outer Application frame */
    tag: string;
    /** Configuration of the window behaviors for this Application */
    window: ApplicationWindowConfiguration;
    /** Click actions supported by the Application and their event handler functions */
    actions: Record<string, ApplicationClickAction>;

    /** Configuration used if the application top-level element is a form */
    form?: ApplicationFormConfiguration;
    /** Default positioning data for the application */
    position: Partial<ApplicationPosition>;
};

type ApplicationPosition = {
    top: number;
    left: number;
    width: number | "auto";
    height: number | "auto";
    scale: number;
    zIndex: number;
};

type ApplicationWindowConfiguration = {
    /** Is this Application rendered inside a window frame? */
    frame?: boolean;
    /** Can this Application be positioned via JavaScript or only by CSS */
    positioned?: boolean;
    /** The window title. Displayed only if the application is framed */
    title?: string;
    /** An optional Font Awesome icon class displayed left of the window title */
    icon?: string | false;
    /** An array of window control entries */
    controls?: ApplicationHeaderControlsEntry[];
    /** Can the window app be minimized by double-clicking on the title */
    minimizable?: boolean;
};

type ApplicationFormConfiguration = {
    handler?: ApplicationFormSubmission;
    submitOnChange?: boolean;
    closeOnSubmit?: boolean;
};

type ApplicationFormSubmission = (
    this: any,
    event: SubmitEvent | Event,
    form: HTMLFormElement,
    formData: FormDataExtended
) => Promise<void>;

type ApplicationHeaderControlsEntry = {
    /** A font-awesome icon class which denotes the control button */
    icon: string;
    /** The text label for the control button */
    label: string;
    /** The action name triggered by clicking the control button */
    action: string;
    /** Is the control button visible for the current client? */
    visible: boolean;
};

type ApplicationConstructorParams = {
    position: ApplicationPosition;
};

type ApplicationRenderOptions = {
    /** Force application rendering. If true, an application which does not yet exist in the DOM is added. If false, only applications which already exist are rendered. */
    force?: boolean;

    /** A specific position at which to render the Application */
    position?: ApplicationPosition;
    /** Updates to the Application window frame */
    window?: ApplicationWindowRenderOptions;
    /** Some Application classes, for example the HandlebarsApplication support re-rendering a subset of application parts instead of the full Application HTML. */
    parts?: string[];
};

type ApplicationRenderContext = {
    force?: boolean;
    position?: ApplicationPosition;
    window?: ApplicationWindowRenderOptions;
};

type ApplicationWindowRenderOptions = {
    title: string;
    icon: string | false;
    controls: boolean;
};

type ApplicationWindow = {
    title: HTMLHeadingElement;
    icon: HTMLElement;
    close: HTMLButtonElement;
    controls: HTMLButtonElement;
    controlsDropdown: HTMLDivElement;
    onDrag: Function;
    dragStartPosition: ApplicationPosition;
    dragTime: number;
};

type ApplicationClosingOptions = Object;

type ApplicationClickAction = (event: PointerEvent, target: HTMLElement) => any;

export class ApplicationV2<
    TConfiguration extends ApplicationConfiguration = ApplicationConfiguration,
    TRenderOptions extends ApplicationRenderOptions = ApplicationRenderOptions,
> extends EventEmitterMixin(Object) {
    /**
     * Applications are constructed by providing an object of configuration options.
     * @param {Partial<ApplicationConfiguration>} [options]     Options used to configure the Application instance
     */
    constructor(options: Partial<TConfiguration>);

    /**
     * Designates which upstream Application class in this class' inheritance chain is the base application.
     * Any DEFAULT_OPTIONS of super-classes further upstream of the BASE_APPLICATION are ignored.
     * Hook events for super-classes further upstream of the BASE_APPLICATION are not dispatched.
     * @type {typeof ApplicationV2}
     */
    static BASE_APPLICATION: typeof ApplicationV2;

    /**
     * The default configuration options which are assigned to every instance of this Application class.
     * @type {Omit<ApplicationConfiguration, uniqueId>}
     */
    static DEFAULT_OPTIONS: Omit<ApplicationConfiguration, "uniqueId">;

    /**
     * The sequence of rendering states that describe the Application life-cycle.
     * @enum {number}
     */
    static RENDER_STATES: RENDER_STATES;

    static override emittedEvents: ["render", "close", "position"];

    /**
     * Application instance configuration options.
     * @type {ApplicationConfiguration}
     */
    options: TConfiguration;

    /**
     * @type {string}
     */
    #id: string;

    /**
     * Flag that this Application instance is renderable.
     * Applications are not renderable unless a subclass defines the _renderHTML and _replaceHTML methods.
     */
    #renderable: boolean;

    /**
     * The outermost HTMLElement of this rendered Application.
     * For window applications this is ApplicationV2##frame.
     * For non-window applications this ApplicationV2##content.
     * @type {HTMLDivElement}
     */
    #element: HTMLDivElement;

    /**
     * The HTMLElement within which inner HTML is rendered.
     * For non-window applications this is the same as ApplicationV2##element.
     * @type {HTMLElement}
     */
    #content: HTMLElement;

    /**
     * Data pertaining to the minimization status of the Application.
     * @type {{active: boolean, [priorWidth]: number, [priorHeight]: number}}
     */
    #minimization: { active: boolean; priorWidth: number; priorHeight: number };

    /**
     * @type {ApplicationPosition}
     */
    #position: ApplicationPosition;

    /**
     * @type {ApplicationV2.RENDER_STATES}
     */
    #state: RENDER_STATES;

    // /**
    //  * A Semaphore used to enqueue asynchronous operations.
    //  * @type {Semaphore}
    //  */
    // #semaphore: Semaphore;

    /**
     * Convenience references to window header elements.
     */
    get window(): ApplicationWindow;

    #window: ApplicationWindow;

    /* -------------------------------------------- */
    /*  Application Properties                      */
    /* -------------------------------------------- */

    /**
     * The CSS class list of this Application instance
     * @type {DOMTokenList}
     */
    get classList(): DOMTokenList;

    /**
     * The HTML element ID of this Application instance.
     * @type {string}
     */
    get id(): string;

    /**
     * A convenience reference to the title of the Application window.
     * @returns {string}
     */
    get title(): string;

    /**
     * The HTMLElement which renders this Application into the DOM.
     * @type {HTMLElement}
     */
    get element(): HTMLElement;

    /**
     * Is this Application instance currently minimized?
     * @type {boolean}
     */
    get minimized(): boolean;

    /**
     * The current position of the application with respect to the window.document.body.
     * @type {ApplicationPosition}
     */
    position: ApplicationPosition;

    /**
     * Is this Application instance currently rendered?
     * @type {boolean}
     */
    get rendered(): boolean;

    /**
     * The current render state of the Application.
     * @type {ApplicationV2.RENDER_STATES}
     */
    get state(): RENDER_STATES;

    /**
     * Does this Application instance render within an outer window frame?
     * @type {boolean}
     */
    get hasFrame(): boolean;

    /* -------------------------------------------- */
    /*  Initialization                              */
    /* -------------------------------------------- */

    /**
     * Iterate over the inheritance chain of this Application.
     * The chain includes this Application itself and all parents until the base application is encountered.
     * @see ApplicationV2.BASE_APPLICATION
     * @generator
     * @yields {typeof ApplicationV2}
     */
    static inheritanceChain(): Generator<typeof ApplicationV2>;

    /* -------------------------------------------- */

    /**
     * Initialize configuration options for the Application instance.
     * The default behavior of this method is to intelligently merge options for each class with those of their parents.
     * - Array-based options are concatenated
     * - Inner objects are merged
     * - Otherwise, properties in the subclass replace those defined by a parent
     * @param {Partial<ApplicationConfiguration>} options      Options provided directly to the constructor
     * @returns {ApplicationConfiguration}                     Configured options for the application instance
     * @protected
     */
    _initializeApplicationOptions(options: Partial<TConfiguration>): TConfiguration;

    /* -------------------------------------------- */
    /*  Rendering                                   */
    /* -------------------------------------------- */

    /**
     * Render the Application, creating its HTMLElement and replacing its innerHTML.
     * Add it to the DOM if it is not currently rendered and rendering is forced. Otherwise, re-render its contents.
     * @param {boolean|ApplicationRenderOptions} [options]  Options which configure application rendering behavior.
     *                                                      A boolean is interpreted as the "force" option.
     * @param {ApplicationRenderOptions} [_options]         Legacy options for backwards-compatibility with the original
     *                                                      ApplicationV1#render signature.
     * @returns {Promise<ApplicationV2>}            A Promise which resolves to the rendered Application instance
     */
    render(options: boolean | TRenderOptions, _options?: TRenderOptions): Promise<ApplicationV2>;

    /* -------------------------------------------- */

    /**
     * Manage the rendering step of the Application life-cycle.
     * This private method delegates out to several protected methods which can be defined by the subclass.
     * @param {ApplicationRenderOptions} [options]  Options which configure application rendering behavior
     * @returns {Promise<ApplicationV2>}            A Promise which resolves to the rendered Application instance
     */
    #render(options: TRenderOptions): Promise<ApplicationV2>;

    /* -------------------------------------------- */

    /**
     * Modify the provided options passed to a render request.
     * @param {ApplicationRenderOptions} options      Options which configure application rendering behavior
     * @protected
     */
    _configureRenderOptions(options: TRenderOptions): void;

    /* -------------------------------------------- */

    /**
     * Prepare application rendering context data for a given render request.
     * @param {ApplicationRenderOptions} options      Options which configure application rendering behavior
     * @returns {Promise<ApplicationRenderContext>}   Context data for the render operation
     * @protected
     */
    _prepareContext(options?: TRenderOptions): Promise<Object>;

    /* -------------------------------------------- */

    /**
     * Configure the array of header control menu options
     * @returns {ApplicationHeaderControlsEntry[]}
     * @protected
     */
    _getHeaderControls(): ApplicationHeaderControlsEntry[];

    /* -------------------------------------------- */

    /**
     * Render an HTMLElement for the Application.
     * An Application subclass must implement this method in order for the Application to be renderable.
     * @param {ApplicationRenderContext} context      Context data for the render operation
     * @param {ApplicationRenderOptions} options      Options which configure application rendering behavior
     * @returns {Promise<HTMLElement|HTMLCollection>} A single rendered HTMLElement or an HTMLCollection of HTMLElements
     * @abstract
     */
    _renderHTML(
        context: ApplicationRenderContext,
        options: TRenderOptions
    ): Promise<HTMLElement | HTMLCollection | Record<string, HTMLElement>>;

    /* -------------------------------------------- */

    /**
     * Replace the HTML of the application with the result provided by the rendering backend.
     * An Application subclass must implement this method in order for the Application to be renderable.
     * @param {any} result                            The result returned by the application rendering backend
     * @param {HTMLElement} content                   The content element into which the rendered result must be inserted
     * @param {ApplicationRenderOptions} options      Options which configure application rendering behavior
     * @abstract
     */
    _replaceHTML(result: any, content: HTMLElement, options: TRenderOptions): void;

    /* -------------------------------------------- */

    /**
     * Render the outer framing HTMLElement which wraps the inner HTML of the Application.
     * @param {ApplicationRenderOptions} options    Options which configure application rendering behavior
     * @returns {Promise<HTMLElement>}
     * @protected
     */
    _renderFrame(options: TRenderOptions): Promise<HTMLElement>;

    /* -------------------------------------------- */

    /**
     * Render a header control button.
     * @param {ApplicationHeaderControlsEntry} control
     * @returns {HTMLLIElement}
     * @protected
     */
    _renderHeaderControl(control: ApplicationHeaderControlsEntry): HTMLLIElement;

    /* -------------------------------------------- */

    /**
     * When the Application is rendered, optionally update aspects of the window frame.
     * @param {ApplicationRenderOptions} options      Options provided at render-time
     * @protected
     */
    _updateFrame(options: TRenderOptions): void;

    /* -------------------------------------------- */

    /**
     * Insert the application HTML element into the DOM.
     * Subclasses may override this method to customize how the application is inserted.
     * @param {HTMLElement} element                 The element to insert
     * @returns {HTMLElement}                       The inserted element
     * @protected
     */
    _insertElement(element: HTMLElement): HTMLElement;

    /* -------------------------------------------- */
    /*  Closing                                     */
    /* -------------------------------------------- */

    /**
     * Close the Application, removing it from the DOM.
     * @param {ApplicationClosingOptions} [options] Options which modify how the application is closed.
     * @returns {Promise<ApplicationV2>}            A Promise which resolves to the closed Application instance
     */
    close(options?: ApplicationClosingOptions): Promise<ApplicationV2>;

    /* -------------------------------------------- */

    /**
     * Manage the closing step of the Application life-cycle.
     * This private method delegates out to several protected methods which can be defined by the subclass.
     * @param {ApplicationClosingOptions} [options] Options which modify how the application is closed
     * @returns {Promise<ApplicationV2>}            A Promise which resolves to the rendered Application instance
     */
    #close(options: ApplicationClosingOptions): Promise<ApplicationV2>;

    /* -------------------------------------------- */

    /**
     * Remove the application HTML element from the DOM.
     * Subclasses may override this method to customize how the application element is removed.
     * @param {HTMLElement} element                 The element to be removed
     * @protected
     */
    _removeElement(element: HTMLElement): void;

    /* -------------------------------------------- */
    /*  Positioning                                 */
    /* -------------------------------------------- */

    /**
     * Update the Application element position using provided data which is merged with the prior position.
     * @param {Partial<ApplicationPosition>} [position] New Application positioning data
     * @returns {ApplicationPosition}                   The updated application position
     */
    setPosition(position: Partial<ApplicationPosition>): ApplicationPosition;

    /* -------------------------------------------- */

    /**
     * A protected method which subclasses can override to customize positioning behavior.
     * @see ApplicationV2#setPosition
     * @protected
     */
    _updatePosition(): void;

    /* -------------------------------------------- */
    /*  Other Public Methods                        */
    /* -------------------------------------------- */

    /**
     * Is the window control buttons menu currently expanded?
     * @type {boolean}
     */
    #controlsExpanded: boolean;

    /**
     * Toggle display of the Application controls menu.
     * Only applicable to window Applications.
     * @param {boolean} [expanded]      Set the controls visibility to a specific state.
     *                                  Otherwise, the visible state is toggled from its current value
     */
    toggleControls(expanded: boolean): void;

    /* -------------------------------------------- */

    /**
     * Minimize the Application, collapsing it to a minimal header.
     * @returns {Promise<void>}
     */
    minimize(): Promise<void>;

    /* -------------------------------------------- */

    /**
     * Restore the Application to its original dimensions.
     * @returns {Promise<void>}
     */
    maximize(): Promise<void>;

    /**
     * Bring this Application window to the front of the rendering stack by increasing its z-index.
     */
    bringToFront(): void;

    /**
     * Change the active tab within a tab group in this Application instance.
     * @param {string} tab        The name of the tab which should become active
     * @param {string} group      The name of the tab group which defines the set of tabs
     * @param {object} [options]  Additional options which affect tab navigation
     * @param {Event} [options.event]                 An interaction event which caused the tab change, if any
     * @param {HTMLElement} [options.navElement]      An explicit navigation element being modified
     * @param {boolean} [options.force=false]         Force changing the tab even if the new tab is already active
     * @param {boolean} [options.updatePosition=true] Update application position after changing the tab?
     */
    changeTab(tab: string, group: string, {event, navElement, force, updatePosition}: { event?: Event; navElement?: HTMLElement; force: boolean; updatePosition: boolean }): void;

    /* -------------------------------------------- */
    /*  Life-Cycle Handlers                         */
    /* -------------------------------------------- */

    /**
     * Perform an event in the application life-cycle.
     * Await an internal life-cycle method defined by the class.
     * Optionally dispatch an event for any registered listeners.
     * @param {Function} handler        A handler function to call
     * @param {object} options          Options which configure event handling
     * @param {boolean} [options.async]         Await the result of the handler function?
     * @param {any[]} [options.handlerArgs]     Arguments passed to the handler function
     * @param {string} [options.debugText]      Debugging text to log for the event
     * @param {string} [options.eventName]      An event name to dispatch for registered listeners
     * @param {string} [options.hookName]       A hook name to dispatch for this and all parent classes
     * @param {any[]} [options.hookArgs]        Arguments passed to the requested hook function
     * @returns {Promise<void>}         A promise which resoles once the handler is complete
     */
    #doEvent(
        handler: Function,
        options: {
            async: boolean;
            handlerArgs: any[];
            debugText: string;
            eventName: string;
            hookName: string;
            hookArgs: any[];
        }
    ): Promise<void>;

    /* -------------------------------------------- */
    /*  Rendering Life-Cycle Methods                */
    /* -------------------------------------------- */

    /**
     * Actions performed before a first render of the Application.
     * @param {ApplicationRenderContext} context      Prepared context data
     * @param {ApplicationRenderOptions} options      Provided render options
     * @returns {Promise<void>}
     * @protected
     */
    _preFirstRender(context: ApplicationRenderContext, options: TRenderOptions): Promise<void>;

    /**
     * Actions performed after a first render of the Application.
     * Post-render steps are not awaited by the render process.
     * @param {ApplicationRenderContext} context      Prepared context data
     * @param {ApplicationRenderOptions} options      Provided render options
     * @protected
     */
    _onFirstRender(context: ApplicationRenderContext, options: TRenderOptions): void;

    /**
     * Actions performed before any render of the Application.
     * Pre-render steps are awaited by the render process.
     * @param {ApplicationRenderContext} context      Prepared context data
     * @param {ApplicationRenderOptions} options      Provided render options
     * @returns {Promise<void>}
     * @protected
     */
    _preRender(context: ApplicationRenderContext, options: TRenderOptions): Promise<void>;

    /**
     * Actions performed after any render of the Application.
     * Post-render steps are not awaited by the render process.
     * @param {ApplicationRenderContext} context      Prepared context data
     * @param {ApplicationRenderOptions} options      Provided render options
     * @protected
     */
    _onRender(context: ApplicationRenderContext, options: TRenderOptions): void;

    /**
     * Actions performed before closing the Application.
     * Pre-close steps are awaited by the close process.
     * @param {ApplicationRenderOptions} options      Provided render options
     * @returns {Promise<void>}
     * @protected
     */
    _preClose(options: TRenderOptions): Promise<void>;

    /**
     * Actions performed after closing the Application.
     * Post-close steps are not awaited by the close process.
     * @param {ApplicationRenderOptions} options      Provided render options
     * @protected
     */
    _onClose(options: TRenderOptions): void;

    /**
     * Actions performed before the Application is re-positioned.
     * Pre-position steps are not awaited because setPosition is synchronous.
     * @param {ApplicationPosition} position          The requested application position
     * @protected
     */
    _prePosition(position: ApplicationPosition): void;

    /**
     * Actions performed after the Application is re-positioned.
     * @param {ApplicationPosition} position          The requested application position
     * @protected
     */
    _onPosition(position: ApplicationPosition): void;

    /* -------------------------------------------- */
    /*  Event Listeners and Handlers                */
    /* -------------------------------------------- */

    /**
     * Attach event listeners to the Application frame.
     * @protected
     */
    _attachFrameListeners(): void;

    /* -------------------------------------------- */

    /**
     * Centralized handling of click events which occur on or within the Application frame.
     * @param {PointerEvent} event
     */
    #onClick(event: PointerEvent): void;

    /* -------------------------------------------- */

    /**
     * Handle a click event on an element which defines a [data-action] handler.
     * @param {PointerEvent} event      The originating click event
     * @param {HTMLElement} target      The capturing HTML element which defined a [data-action]
     */
    #onClickAction(event: PointerEvent, target: HTMLElement): void;

    /* -------------------------------------------- */

    /**
     * A generic event handler for action clicks which can be extended by subclasses.
     * Action handlers defined in DEFAULT_OPTIONS are called first. This method is only called for actions which have
     * no defined handler.
     * @param {PointerEvent} event      The originating click event
     * @param {HTMLElement} target      The capturing HTML element which defined a [data-action]
     * @protected
     */
    _onClickAction(event: PointerEvent, target: HTMLElement): void;

    /* -------------------------------------------- */

    /**
     * Begin dragging the Application position.
     * @param {PointerEvent} event
     */
    #onWindowDragStart(event: PointerEvent): void;

    /* -------------------------------------------- */

    /**
     * Drag the Application position during mouse movement.
     * @param {PointerEvent} event
     */
    #onWindowDragMove(event: PointerEvent): void;

    /* -------------------------------------------- */

    /**
     * Conclude dragging the Application position.
     * @param {PointerEvent} event
     */
    #onWindowDragEnd(event: PointerEvent): void;

    /* -------------------------------------------- */

    /**
     * Double-click events on the window title are used to minimize or maximize the application.
     * @param {PointerEvent} event
     */
    #onWindowDoubleClick(event: PointerEvent): void;

    /**
     * Handle submission for an Application which uses the form element.
     * @param {Event|SubmitEvent} event The form submission event
     * @returns {Promise<void>}
     */
    protected _onSubmitForm(event: Event | SubmitEvent): Promise<void>;

    /* -------------------------------------------- */
    /*  Helper Methods                              */
    /* -------------------------------------------- */

    /**
     * Parse a CSS style rule into a number of pixels which apply to that dimension.
     * @param {string} style            The CSS style rule
     * @param {number} parentDimension  The relevant dimension of the parent element
     * @returns {number}                The parsed style dimension in pixels
     */
    static parseCSSDimension(style: string, parentDimension: number): number;

    /* -------------------------------------------- */

    /**
     * Wait for a CSS transition to complete for an element.
     * @param {HTMLElement} element         The element which is transitioning
     * @param {number} timeout              A timeout in milliseconds in case the transitionend event does not occur
     * @returns {Promise<void>}
     * @internal
     */
    _awaitTransition(element: HTMLElement, timeout: number): Promise<void>;
}

type AppV2Constructor<
    TConfiguration extends ApplicationConfiguration = ApplicationConfiguration,
    TRenderOptions extends ApplicationRenderOptions = ApplicationRenderOptions,
> = new (...args: any[]) => ApplicationV2<TConfiguration, TRenderOptions>;

type HandlebarsTemplatePart = {
    /** The template entry-point for the part */
    template: string;
    /** A CSS id to assign to the top-level element of the rendered part. This id string is automatically prefixed by the application id. */
    id?: string;
    /** An array of CSS classes to apply to the top-level element of the rendered part. */
    classes?: string[];
    /** An array of templates that are required to render the part. If omitted, only the entry-point is inferred as required. */
    templates?: string[];
    /** An array of selectors within this part whose scroll positions should be persisted during a re-render operation. A blank string is used to denote that the root level of the part is scrollable. */
    scrollable?: string[];
    /** A registry of forms selectors and submission handlers. */
    forms?: Record<string, ApplicationFormConfiguration>;
};

type HandlebarsRenderOptions = {
    parts: string[];
} & ApplicationRenderOptions;

type DocumentSheetConfiguration<
    TDocument extends foundry.abstract.Document = foundry.abstract.Document,
> = {
    document: TDocument;
    viewPermission: number;
    editPermission: number;
    sheetConfig: boolean;
} & ApplicationConfiguration;

type DocumentSheetRenderOptions = {
    renderContext: string;
    renderData: object;
} & ApplicationRenderOptions;

export type HandlebarsDocumentSheetConfiguration<
    TDocument extends foundry.abstract.Document = foundry.abstract.Document,
> = DocumentSheetConfiguration<TDocument> & DocumentSheetRenderOptions & HandlebarsRenderOptions;

export class DocumentSheetV2<
    TDocument extends foundry.abstract.Document = foundry.abstract.Document,
    TRenderOptions extends DocumentSheetRenderOptions = DocumentSheetRenderOptions,
    TConfiguration extends DocumentSheetConfiguration = DocumentSheetConfiguration,
> extends ApplicationV2<TConfiguration, TRenderOptions> {
    /** @inheritdoc */
    static override DEFAULT_OPTIONS: Omit<DocumentSheetConfiguration, "uniqueId">;

    get document(): TDocument;
    #document: TDocument;

    /**
     * Is this Document sheet visible to the current User?
     * This is governed by the viewPermission threshold configured for the class.
     * @type {boolean}
     */
    get isVisible(): boolean;

    /**
     * Is this Document sheet editable by the current User?
     * This is governed by the editPermission threshold configured for the class.
     * @type {boolean}
     */
    get isEditable(): boolean;

    /**
     * Prepare data used to update the Item upon form submission.
     * @param {FormDataExtended} formData           Submitted form data
     * @returns {object}                            Prepared submission data as an object
     * @protected
     */
    _prepareSubmitData(formData: FormDataExtended): Record<string, unknown>;
}


export {
    ApplicationConfiguration,
    ApplicationPosition,
    ApplicationWindowConfiguration,
    ApplicationFormConfiguration,
    ApplicationHeaderControlsEntry,
    ApplicationConstructorParams,
    ApplicationRenderOptions,
    ApplicationWindowRenderOptions,
    ApplicationRenderContext,
    ApplicationClosingOptions,
    ApplicationClickAction,
    ApplicationFormSubmission,
    AppV2Constructor,
    DocumentSheetConfiguration,
    DocumentSheetRenderOptions,
    HandlebarsTemplatePart,
    HandlebarsRenderOptions,
};

export * from "./handlebars-application.ts";

// export type Mixin<
//     MixinClass extends new (...args: any[]) => any,
//     BaseClass extends abstract new (...args: any[]) => any,
// > = Pick<BaseClass, keyof BaseClass> &
//     Pick<MixinClass, keyof MixinClass> & {
//         new (
//             ...args: ConstructorParameters<MixinClass>
//         ): InstanceType<BaseClass> & InstanceType<MixinClass>;
//     };

// declare class HandlebarsApplicationV2 {
//     /**
//      * Configure a registry of template parts which are supported for this application for partial rendering.
//      * @type {Record<string, HandlebarsTemplatePart>}
//      */
//     static PARTS: Record<string, HandlebarsTemplatePart>;
// }

// interface HandlebarsApplicationV2<TRenderOptions extends HandlebarsRenderOptions = HandlebarsRenderOptions> {
//     /**
//      * A record of all rendered template parts.
//      * @returns {Record<string, HTMLElement>}
//      */
//     get parts(): Record<string, HTMLElement>;

//     /** @inheritDoc */
//     _configureRenderOptions(options: TRenderOptions): void;

//     /* -------------------------------------------- */

//     /** @inheritDoc */
//     _preFirstRender(context: Object, options: TRenderOptions): Promise<void>;

//     /* -------------------------------------------- */

//     /**
//      * Render each configured application part using Handlebars templates.
//      * @param {ApplicationRenderContext} context        Context data for the render operation
//      * @param {HandlebarsRenderOptions} options        Options which configure application rendering behavior
//      * @returns {Promise<Record<string, HTMLElement>>}  A single rendered HTMLElement for each requested part
//      * @protected
//      * @override
//      */
//     _renderHTML(
//         context: ApplicationRenderContext,
//         options: TRenderOptions
//     ): Promise<Record<string, HTMLElement>>;

//     /* -------------------------------------------- */

//     /**
//      * Replace the HTML of the application with the result provided by Handlebars rendering.
//      * @param {Record<string, HTMLElement>} result  The result from Handlebars template rendering
//      * @param {HTMLElement} content                 The content element into which the rendered result must be inserted
//      * @param {ApplicationRenderOptions} options    Options which configure application rendering behavior
//      * @protected
//      * @override
//      */
//     _replaceHTML(
//         result: Record<string, HTMLElement>,
//         content: HTMLElement,
//         options: ApplicationRenderOptions
//     ): void;

//     /* -------------------------------------------- */

//     /**
//      * Prepare data used to synchronize the state of a template part.
//      * @param {string} partId                       The id of the part being rendered
//      * @param {HTMLElement} newElement              The new rendered HTML element for the part
//      * @param {HTMLElement} priorElement            The prior rendered HTML element for the part
//      * @param {object} state                        A state object which is used to synchronize after replacement
//      * @protected
//      */
//     _preSyncPartState(
//         partId: string,
//         newElement: HTMLElement,
//         priorElement: HTMLElement,
//         state: Object
//     ): void;

//     /* -------------------------------------------- */

//     /**
//      * Synchronize the state of a template part after it has been rendered and replaced in the DOM.
//      * @param {string} partId                       The id of the part being rendered
//      * @param {HTMLElement} newElement              The new rendered HTML element for the part
//      * @param {HTMLElement} priorElement            The prior rendered HTML element for the part
//      * @param {object} state                        A state object which is used to synchronize after replacement
//      * @protected
//      */
//     _syncPartState(
//         partId: string,
//         newElement: HTMLElement,
//         priorElement: HTMLElement,
//         state: Object
//     ): void;

//     /* -------------------------------------------- */
//     /*  Event Listeners and Handlers                */
//     /* -------------------------------------------- */

//     /**
//      * Attach event listeners to rendered template parts.
//      * @param {string} partId                       The id of the part being rendered
//      * @param {HTMLElement} htmlElement             The rendered HTML element for the part
//      * @param {ApplicationRenderOptions} options    Rendering options passed to the render method
//      * @protected
//      */
//     _attachPartListeners(partId: string, htmlElement: HTMLElement, options: TRenderOptions): void;
// }

// export function HandlebarsApplicationMixin<BaseClass extends AppV2Constructor<ApplicationConfiguration, HandlebarsRenderOptions>>(
//     BaseClass: BaseClass
// ): Mixin<typeof HandlebarsApplicationV2, BaseClass>;

type DialogV2Configuration = {
    buttons: DialogV2Button[];
    content: string;
    submit: (...args: any[]) => Promise<void>;
} & ApplicationConfiguration;

type DialogV2Button = {
    action: string;
    label: string;
    icon?: string;
    callback?: ApplicationClickAction;
}

export class DialogV2 extends ApplicationV2<DialogV2Configuration> {
    static prompt(options: Omit<DialogV2Configuration, keyof ApplicationConfiguration | 'submit'> & Partial<ApplicationConfiguration>): Promise<DialogV2>;
}