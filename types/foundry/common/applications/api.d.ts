import type { EventEmitterMixin } from "../utils/event-emitter.d.ts";

type ApplicationClickAction = (event: PointerEvent, target: HTMLElement) => any;

type ApplicationRenderContext = {}
type ApplicationClosingOptions = {}

interface ApplicationWindowRenderOptions {
    title: string;
    icon: string | false;
    controls: boolean;
}

interface ApplicationRenderOptions {
    force: boolean;
    position: ApplicationPosition;
    window: ApplicationWindowRenderOptions;
    parts: string[];
}

interface ApplicationWindowElement {
    title: HTMLHeadingElement;
    icon: HTMLElement;
    close: HTMLButtonElement;
    controls: HTMLButtonElement;
    controlsDropdown: HTMLDivElement;
    onDrag: (event: PointerEvent) => void;
    dragStartPosition: ApplicationPosition;
    dragTime: number;
}

interface ApplicationHeaderControlsEntry {
    icon: string;
    label: string;
    action: string;
    visible: boolean;
}

interface ApplicationWindowConfiguration {
    frame: boolean;
    positioned: boolean;
    title: string;
    icon: string | false;
    controls: ApplicationHeaderControlsEntry[];
    minimizable: boolean;
}

export interface ApplicationConfiguration {
    id: string;
    uniqueId: string;
    classes: string[];
    tag: string;
    window: ApplicationWindowConfiguration;
    actions: Record<string, ApplicationClickAction>;
    position: Partial<ApplicationPosition>;
}

declare type Semaphore = any;

export class ApplicationV2 extends EventEmitterMixin(Object) {
    /**
     * Applications are constructed by providing an object of configuration options.
     * @param {Partial<ApplicationConfiguration>} [options]     Options used to configure the Application instance
     */
    constructor(options: Partial<ApplicationConfiguration>);

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
    static RENDER_STATES: {
        ERROR: -3;
        CLOSING: -2;
        CLOSED: -1;
        NONE: 0;
        RENDERING: 1;
        RENDERED: 2;
    };

    /** @override */
    static emittedEvents: ["render", "close", "position"];

    /**
     * Application instance configuration options.
     * @type {ApplicationConfiguration}
     */
    options: ApplicationConfiguration;

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
    #state: typeof ApplicationV2["RENDER_STATES"];

    /**
     * A Semaphore used to enqueue asynchronous operations.
     * @type {Semaphore}
     */
    #semaphore: Semaphore;

    /**
     * Convenience references to window header elements.
     * @type {ApplicationWindowElement}
     */
    #window: ApplicationWindowElement;

    /* -------------------------------------------- */

    get window(): ApplicationWindowElement;

    /**
     * The CSS class list of this Application instance
     */
    get classList(): DOMTokenList;

    /**
     * The HTML element ID of this Application instance.
     */
    get id(): string;

    /**
     * A convenience reference to the title of the Application window.
     */
    get title(): string;

    /**
     * The HTMLElement which renders this Application into the DOM.
     */
    get element(): HTMLElement;

    /**
     * Is this Application instance currently minimized?
     */
    get minimized(): boolean;

    /**
     * The current position of the application with respect to the window.document.body.
     */
    position: ApplicationPosition;

    /**
     * Is this Application instance currently rendered?
     */
    get rendered(): boolean;

    /**
     * The current render state of the Application.
     */
    get state(): typeof ApplicationV2["RENDER_STATES"];

    /**
     * Does this Application instance render within an outer window frame?
     */
    get hasFrame(): boolean;

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
    _initializeApplicationOptions(options: Partial<ApplicationConfiguration>): ApplicationConfiguration;

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
    render(options: boolean | ApplicationRenderOptions, _options: ApplicationRenderOptions): Promise<ApplicationV2>;

    /**
     * Manage the rendering step of the Application life-cycle.
     * This private method delegates out to several protected methods which can be defined by the subclass.
     * @param {ApplicationRenderOptions} [options]  Options which configure application rendering behavior
     * @returns {Promise<ApplicationV2>}            A Promise which resolves to the rendered Application instance
     */
    #render(options: ApplicationRenderOptions): Promise<ApplicationV2>;

    /**
     * Modify the provided options passed to a render request.
     * @param {ApplicationRenderOptions} options      Options which configure application rendering behavior
     * @protected
     */
    _configureRenderOptions(options: ApplicationRenderOptions): void;

    /**
     * Prepare application rendering context data for a given render request.
     * @param {ApplicationRenderOptions} options      Options which configure application rendering behavior
     * @returns {Promise<ApplicationRenderContext>}   Context data for the render operation
     * @protected
     */
    _prepareContext(options: ApplicationRenderOptions): Promise<ApplicationRenderContext>;

    /**
     * Configure the array of header control menu options
     * @returns {ApplicationHeaderControlsEntry[]}
     * @protected
     */
    _getHeaderControls(): ApplicationHeaderControlsEntry[];

    /**
     * Render an HTMLElement for the Application.
     * An Application subclass must implement this method in order for the Application to be renderable.
     * @param {ApplicationRenderContext} context      Context data for the render operation
     * @param {ApplicationRenderOptions} options      Options which configure application rendering behavior
     * @returns {Promise<HTMLElement|HTMLCollection>} A single rendered HTMLElement or an HTMLCollection of HTMLElements
     * @abstract
     */
    _renderHTML(context: ApplicationRenderContext, options: ApplicationRenderOptions): Promise<HTMLElement | HTMLCollection>;

    /**
     * Replace the HTML of the application with the result provided by the rendering backend.
     * An Application subclass must implement this method in order for the Application to be renderable.
     * @param {any} result                            The result returned by the application rendering backend
     * @param {HTMLElement} content                   The content element into which the rendered result must be inserted
     * @param {ApplicationRenderOptions} options      Options which configure application rendering behavior
     * @abstract
     */
    _replaceHTML(result: any, content: HTMLElement, options: ApplicationRenderOptions): void;

    /**
     * Render the outer framing HTMLElement which wraps the inner HTML of the Application.
     * @param {ApplicationRenderOptions} options    Options which configure application rendering behavior
     * @returns {Promise<HTMLElement>}
     * @protected
     */
    _renderFrame(options: ApplicationRenderOptions): Promise<HTMLElement>;

    /**
     * Render a header control button.
     * @param {ApplicationHeaderControlsEntry} control
     * @returns {HTMLLIElement}
     * @protected
     */
    _renderHeaderControl(control: ApplicationHeaderControlsEntry): HTMLLIElement;

    /**
     * When the Application is rendered, optionally update aspects of the window frame.
     * @param {ApplicationRenderOptions} options      Options provided at render-time
     * @protected
     */
    _updateFrame(options: ApplicationRenderOptions): void;

    /**
     * Insert the application element into the DOM.
     * @param {HTMLElement} element
     * @protected
     */
    _insertElement(element: HTMLElement): void;

    /**
     * Close the Application, removing it from the DOM.
     * @param {ApplicationClosingOptions} [options] Options which modify how the application is closed.
     * @returns {Promise<ApplicationV2>}            A Promise which resolves to the closed Application instance
     */
    close(options: ApplicationClosingOptions): Promise<ApplicationV2>;

    /**
     * Manage the closing step of the Application life-cycle.
     * This private method delegates out to several protected methods which can be defined by the subclass.
     * @param {ApplicationClosingOptions} [options] Options which modify how the application is closed
     * @returns {Promise<ApplicationV2>}            A Promise which resolves to the rendered Application instance
     */
    #close(options: ApplicationClosingOptions): Promise<ApplicationV2>;

    /**
     * Remove the application HTML element from the DOM.
     * Subclasses may override this method to customize how the application element is removed.
     * @param {HTMLElement} element                 The element to be removed
     * @protected
     */
    _removeElement(element: HTMLElement): void;

    /**
     * Update the Application element position using provided data which is merged with the prior position.
     * @param {Partial<ApplicationPosition>} [position] New Application positioning data
     * @returns {ApplicationPosition}                   The updated application position
     */
    setPosition(position: Partial<ApplicationPosition>): ApplicationPosition;

    /**
     * A protected method which subclasses can override to customize positioning behavior.
     * @see ApplicationV2#setPosition
     * @protected
     */
    _updatePosition(): void;

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

    /**
     * Minimize the Application, collapsing it to a minimal header.
     * @returns {Promise<void>}
     */
    minimize(): Promise<void>;

    /**
     * Maximize the Application, expanding it to its original size.
     * @returns {Promise<void>}
     */
    maximize(): Promise<void>;

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
    #doEvent(handler: Function, options: {
        async: boolean;
        handlerArgs: any[];
        debugText: string;
        eventName: string;
        hookName: string;
        hookArgs: any[];
    }): Promise<void>;

    /* -------------------------------------------- */

    /**
     * Actions performed before a first render of the Application.
     * @param {ApplicationRenderContext} context      Prepared context data
     * @param {ApplicationRenderOptions} options      Provided render options
     * @returns {Promise<void>}
     * @protected
     */
    _preFirstRender(context: ApplicationRenderContext, options: ApplicationRenderOptions): Promise<void>;

    /**
     * Actions performed after a first render of the Application.
     * Post-render steps are not awaited by the render process.
     * @param {ApplicationRenderContext} context      Prepared context data
     * @param {ApplicationRenderOptions} options      Provided render options
     * @protected
     */
    _onFirstRender(context: ApplicationRenderContext, options: ApplicationRenderOptions): void;

    /**
     * Actions performed before rendering the Application.
     * @param {ApplicationRenderContext} context      Prepared context data
     * @param {ApplicationRenderOptions} options      Provided render options
     * @returns {Promise<void>}
     * @protected
     */
    _preRender(context: ApplicationRenderContext, options: ApplicationRenderOptions): Promise<void>;

    /**
     * Actions performed after rendering the Application.
     * Post-render steps are not awaited by the render process.
     * @param {ApplicationRenderContext} context      Prepared context data
     * @param {ApplicationRenderOptions} options      Provided render options
     * @protected
     */
    _onRender(context: ApplicationRenderContext, options: ApplicationRenderOptions): void;

    /**
     * Actions performed before closing the Application.
     * @param {ApplicationClosingOptions} options      Provided closing options
     * @returns {Promise<void>}
     * @protected
     */
    _preClose(options: ApplicationClosingOptions): Promise<void>;

    /**
     * Actions performed after closing the Application.
     * Post-close steps are not awaited by the close process.
     * @param {ApplicationClosingOptions} options      Provided closing options
     * @protected
     */
    _onClose(options: ApplicationClosingOptions): void;

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

    /**
     * Attach event listeners to the Application frame.
     * @protected
     */
    _attachFrameListeners(): void;

    /**
     * Centralized handling of click events which occur on or within the Application frame.
     * @param {PointerEvent} event
     */
    #onClick(event: PointerEvent): Promise<void>;

    /**
     * Handle a click event on an element which defines a [data-action] handler.
     * @param {PointerEvent} event      The originating click event
     * @param {HTMLElement} target      The capturing HTML element which defined a [data-action]
     */
    #onClickAction(event: PointerEvent, target: HTMLElement): Promise<void>;

    /**
     * A generic event handler for action clicks which can be extended by subclasses.
     * Action handlers defined in DEFAULT_OPTIONS are called first. This method is only called for actions which have
     * no defined handler.
     * @param {PointerEvent} event      The originating click event
     * @param {HTMLElement} target      The capturing HTML element which defined a [data-action]
     * @protected
     */
    _onClickAction(event: PointerEvent, target: HTMLElement): void;

    /**
     * Begin dragging the Application position.
     * @param {PointerEvent} event
     */
    #onWindowDragStart(event): Promise<void>;

    /**
     * Drag the Application position during mouse movement.
     * @param {PointerEvent} event
     */
    #onWindowDragMove(event: PointerEvent): void

    /**
     * Conclude dragging the Application position.
     * @param {PointerEvent} event
     */
    #onWindowDragEnd(event: PointerEvent): void;

    /**
     * Double-click events on the window title are used to minimize or maximize the application.
     * @param {PointerEvent} event
     */
    #onWindowDoubleClick(event: PointerEvent): void;

    /* -------------------------------------------- */

    /**
     * Parse a CSS style rule into a number of pixels which apply to that dimension.
     * @param {string} style            The CSS style rule
     * @param {number} parentDimension  The relevant dimension of the parent element
     * @returns {number}                The parsed style dimension in pixels
     */
    static parseCSSDimension(style: string, parentDimension: number): number;

    /**
     * Wait for a CSS transition to complete for an element.
     * @param {HTMLElement} element         The element which is transitioning
     * @param {number} timeout              A timeout in milliseconds in case the transitionend event does not occur
     * @returns {Promise<void>}
     * @internal
     */
    _awaitTransition(element: HTMLElement, timeout: number): Promise<void>;
}