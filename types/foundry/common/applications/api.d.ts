export class ApplicationV2 {
    
}

// import { EventEmitterMixin } from "./event-emitter.ts";

// /**
//    * @typedef {import("../_types.mjs").ApplicationConfiguration} ApplicationConfiguration
//    * @typedef {import("../_types.mjs").ApplicationRenderOptions} ApplicationRenderOptions
//    * @typedef {import("../_types.mjs").ApplicationRenderContext} ApplicationRenderContext
//    * @typedef {import("../_types.mjs").ApplicationClosingOptions} ApplicationClosingOptions
//    * @typedef {import("../_types.mjs").ApplicationPosition} ApplicationPosition
//    * @typedef {import("../_types.mjs").ApplicationHeaderControlsEntry} ApplicationHeaderControlsEntry
//    */

// export enum RENDER_STATES {
//     ERROR = -3,
//     CLOSING = -2,
//     CLOSED = -1,
//     NONE = 0,
//     RENDERING = 1,
//     RENDERED = 2
// }

// /**
//  * The Application class is responsible for rendering an HTMLElement into the Foundry Virtual Tabletop user interface.
//  */
// export class ApplicationV2 extends EventEmitterMixin(Object) {

//     /**
//      * Applications are constructed by providing an object of configuration options.
//      * @param {Partial<ApplicationConfiguration>} [options]     Options used to configure the Application instance
//      */
//     constructor(options: Partial<ApplicationConfiguration>);

//     /**
//      * Designates which upstream Application class in this class' inheritance chain is the base application.
//      * Any DEFAULT_OPTIONS of super-classes further upstream of the BASE_APPLICATION are ignored.
//      * Hook events for super-classes further upstream of the BASE_APPLICATION are not dispatched.
//      * @type {typeof ApplicationV2}
//      */
//     static BASE_APPLICATION: typeof ApplicationV2;

//     /**
//      * The default configuration options which are assigned to every instance of this Application class.
//      * @type {Omit<ApplicationConfiguration, uniqueId>}
//      */
//     static DEFAULT_OPTIONS: Omit<ApplicationConfiguration, uniqueId>;

//     /**
//      * The sequence of rendering states that describe the Application life-cycle.
//      * @enum {number}
//      */
//     static RENDER_STATES: RENDER_STATES;

//     /** @override */
//     // static emittedEvents = Object.freeze(["render", "close", "position"]);

//     /**
//      * Application instance configuration options.
//      * @type {ApplicationConfiguration}
//      */
//     options: ApplicationConfiguration;

//     /**
//      * @type {string}
//      */
//     #id: string;

//     /**
//      * Flag that this Application instance is renderable.
//      * Applications are not renderable unless a subclass defines the _renderHTML and _replaceHTML methods.
//      */
//     #renderable: boolean;

//     /**
//      * The outermost HTMLElement of this rendered Application.
//      * For window applications this is ApplicationV2##frame.
//      * For non-window applications this ApplicationV2##content.
//      * @type {HTMLDivElement}
//      */
//     #element: HTMLDivElement;

//     /**
//      * The HTMLElement within which inner HTML is rendered.
//      * For non-window applications this is the same as ApplicationV2##element.
//      * @type {HTMLElement}
//      */
//     #content: HTMLElement;

//     /**
//      * Data pertaining to the minimization status of the Application.
//      * @type {{active: boolean, [priorWidth]: number, [priorHeight]: number}}
//      */
//     #minimization: { active: boolean; priorWidth: number; priorHeight: number; };

//     /**
//      * @type {ApplicationPosition}
//      */
//     #position: ApplicationPosition;

//     /**
//      * @type {ApplicationV2.RENDER_STATES}
//      */
//     #state: RENDER_STATES;

//     /**
//      * A Semaphore used to enqueue asynchronous operations.
//      * @type {Semaphore}
//      */
//     #semaphore: Semaphore;

//     /**
//      * Convenience references to window header elements.
//      * @type {{
//      *  title: HTMLHeadingElement,
//      *  icon: HTMLElement,
//      *  close: HTMLButtonElement,
//      *  controls: HTMLButtonElement,
//      *  controlsDropdown: HTMLDivElement,
//      *  onDrag: Function
//      *  dragStartPosition: ApplicationPosition
//      *  dragTime: number
//      * }}
//      */
//     get window();
//     #window: {
//         title: undefined,
//         icon: undefined,
//         close: undefined,
//         controls: undefined,
//         controlsDropdown: undefined,
//         onDrag: ,
//         dragStartPosition: undefined,
//         dragTime: 0
//     };

//     /* -------------------------------------------- */
//     /*  Application Properties                      */
//     /* -------------------------------------------- */

//     /**
//      * The CSS class list of this Application instance
//      * @type {DOMTokenList}
//      */
//     get classList() {
//     return this.#element?.classList;
// }

//     /**
//      * The HTML element ID of this Application instance.
//      * @type {string}
//      */
//     get id() {
//     return this.#id;
// }

//     /**
//      * A convenience reference to the title of the Application window.
//      * @returns {string}
//      */
//     get title(): string {
//     return game.i18n.localize(this.options.window.title);
// }

//     /**
//      * The HTMLElement which renders this Application into the DOM.
//      * @type {HTMLElement}
//      */
//     get element() {
//     return this.#element;
// }

//     /**
//      * Is this Application instance currently minimized?
//      * @type {boolean}
//      */
//     get minimized() {
//     return this.#minimization.active;
// }

// /**
//  * The current position of the application with respect to the window.document.body.
//  * @type {ApplicationPosition}
//  */
// position: ApplicationPosition = new Proxy(this.#position, {
//     set: (obj, prop, value) => {
//         obj[prop] = value;
//         this._updatePosition();
//         return value;
//     }
// });

//     /**
//      * Is this Application instance currently rendered?
//      * @type {boolean}
//      */
//     get rendered() {
//     return this.#state === ApplicationV2.RENDER_STATES.RENDERED;
// }

//     /**
//      * The current render state of the Application.
//      * @type {ApplicationV2.RENDER_STATES}
//      */
//     get state() {
//     return this.#state;
// }

//     /**
//      * Does this Application instance render within an outer window frame?
//      * @type {boolean}
//      */
//     get hasFrame() {
//     return this.options.window.frame;
// }

// /* -------------------------------------------- */
// /*  Initialization                              */
// /* -------------------------------------------- */

// /**
//  * Iterate over the inheritance chain of this Application.
//  * The chain includes this Application itself and all parents until the base application is encountered.
//  * @see ApplicationV2.BASE_APPLICATION
//  * @generator
//  * @yields {typeof ApplicationV2}
//  */
// static * inheritanceChain() {
//     let cls = this;
//     while (cls) {
//         yield cls;
//         if (cls === this.BASE_APPLICATION) return;
//         cls = Object.getPrototypeOf(cls);
//     }
// }

// /* -------------------------------------------- */

// /**
//  * Initialize configuration options for the Application instance.
//  * The default behavior of this method is to intelligently merge options for each class with those of their parents.
//  * - Array-based options are concatenated
//  * - Inner objects are merged
//  * - Otherwise, properties in the subclass replace those defined by a parent
//  * @param {Partial<ApplicationConfiguration>} options      Options provided directly to the constructor
//  * @returns {ApplicationConfiguration}                     Configured options for the application instance
//  * @protected
//  */
// _initializeApplicationOptions(options: Partial<ApplicationConfiguration>): ApplicationConfiguration {

//     // Options initialization order
//     const order = [options];
//     for (const cls of this.constructor.inheritanceChain()) {
//         order.unshift(cls.DEFAULT_OPTIONS);
//     }

//     // Intelligently merge with parent class options
//     const applicationOptions = {};
//     for (const opts of order) {
//         for (const [k, v] of Object.entries(opts)) {
//             if ((k in applicationOptions)) {
//                 const v0 = applicationOptions[k];
//                 if (Array.isArray(v0)) applicationOptions[k].push(...v);                // Concatenate arrays
//                 else if (foundry.utils.getType(v0) === "Object") Object.assign(v0, v);   // Merge objects
//                 else applicationOptions[k] = foundry.utils.deepClone(v);                  // Override option
//             }
//             else applicationOptions[k] = foundry.utils.deepClone(v);
//         }
//     }

//     // Unique application ID
//     applicationOptions.uniqueId = String(++globalThis._appId);

//     // Special handling for classes
//     if (applicationOptions.window.frame) applicationOptions.classes.unshift("application");
//     applicationOptions.classes = Array.from(new Set(applicationOptions.classes));
//     return applicationOptions;
// }

//     /* -------------------------------------------- */
//     /*  Rendering                                   */
//     /* -------------------------------------------- */

//     /**
//      * Render the Application, creating its HTMLElement and replacing its innerHTML.
//      * Add it to the DOM if it is not currently rendered and rendering is forced. Otherwise, re-render its contents.
//      * @param {boolean|ApplicationRenderOptions} [options]  Options which configure application rendering behavior.
//      *                                                      A boolean is interpreted as the "force" option.
//      * @param {ApplicationRenderOptions} [_options]         Legacy options for backwards-compatibility with the original
//      *                                                      ApplicationV1#render signature.
//      * @returns {Promise<ApplicationV2>}            A Promise which resolves to the rendered Application instance
//      */
//     async render(options: boolean | ApplicationRenderOptions = {}, _options: ApplicationRenderOptions = {}): Promise < ApplicationV2 > {
//     if(typeof options === "boolean") options = Object.assign(_options, { force: options });
// return this.#semaphore.add(this.#render.bind(this), options);
//     }

//     /* -------------------------------------------- */

//     /**
//      * Manage the rendering step of the Application life-cycle.
//      * This private method delegates out to several protected methods which can be defined by the subclass.
//      * @param {ApplicationRenderOptions} [options]  Options which configure application rendering behavior
//      * @returns {Promise<ApplicationV2>}            A Promise which resolves to the rendered Application instance
//      */
//     async #render(options: ApplicationRenderOptions): Promise < ApplicationV2 > {
//     const states = ApplicationV2.RENDER_STATES;
//     if(!this.#renderable) throw new Error(`The ${this.constructor.name} Application class is not renderable because`
//         + " it does not define the _renderHTML and _replaceHTML methods which are required.");

//     // Prepare rendering context data
//     this._configureRenderOptions(options);
//     const context = await this._prepareContext(options);

//     // Pre-render life-cycle events (awaited)
//     const isFirstRender = this.#state <= states.NONE;
//     if(isFirstRender) {
//         if (!options.force) return this;
//         await this.#doEvent(this._preFirstRender, {
//             async: true, handlerArgs: [context, options],
//             debugText: "Before first render"
//         });
//     }
//         await this.#doEvent(this._preRender, {
//         async: true, handlerArgs: [context, options],
//         debugText: "Before render"
//     });

//     // Render the Application frame
//     this.#state = states.RENDERING;
//     if(isFirstRender) {
//         this.#element = await this._renderFrame(options);
//         this.#content = this.hasFrame ? this.#element.querySelector(".window-content") : this.#element;
//         this._attachFrameListeners();
//     }

//         // Render Application content
//         try {
//         const result = await this._renderHTML(context, options);
//         this._replaceHTML(result, this.#content, options);
//     }
//         catch(err) {
//         err.message = `Failed to render Application "${this.id}": ${err.message}`;
//         if (this.#element) {
//             this.#element.remove();
//             this.#element = null;
//         }
//         this.#state = states.ERROR;
//         throw err;
//     }

//         // Update Application frame and position
//         if(isFirstRender) this._insertElement(this.#element);
//     if(this.hasFrame) this._updateFrame(options);

//     // Register successful render
//     this.#state = states.RENDERED;
//     foundry.applications.instances.set(this.#id, this);

//     // Post-render life-cycle events (not awaited)
//     if(isFirstRender) {
//         // noinspection ES6MissingAwait
//         this.#doEvent(this._onFirstRender, { handlerArgs: [options], debugText: "After first render" });
//     }
//         // noinspection ES6MissingAwait
//         this.#doEvent(this._onRender, {
//         handlerArgs: [options], debugText: "After render", eventName: "render",
//         hookName: "render", hookArgs: [this.#element]
//     });

//     // Update application position
//     if("position" in options) this.setPosition(options.position);
//     if(options.force && this.minimized) this.maximize();
//     return this;
// }

// /* -------------------------------------------- */

// /**
//  * Modify the provided options passed to a render request.
//  * @param {ApplicationRenderOptions} options      Options which configure application rendering behavior
//  * @protected
//  */
// _configureRenderOptions(options: ApplicationRenderOptions) {
//     const isFirstRender = this.#state <= ApplicationV2.RENDER_STATES.NONE;
//     if (isFirstRender) {
//         if (this.hasFrame) {
//             options.window ||= {};
//             options.window.title ||= this.title;
//             options.window.icon ||= this.options.window.icon;
//             options.window.controls = true;
//         }
//         options.position ||= this.#position;
//     }
// }

//     /* -------------------------------------------- */

//     /**
//      * Prepare application rendering context data for a given render request.
//      * @param {ApplicationRenderOptions} options      Options which configure application rendering behavior
//      * @returns {Promise<ApplicationRenderContext>}   Context data for the render operation
//      * @protected
//      */
//     async _prepareContext(options: ApplicationRenderOptions): Promise < ApplicationRenderContext > {
//     return {};
// }

// /* -------------------------------------------- */

// /**
//  * Configure the array of header control menu options
//  * @returns {ApplicationHeaderControlsEntry[]}
//  * @protected
//  */
// _getHeaderControls(): ApplicationHeaderControlsEntry[] {
//     return this.options.window.controls || [];
// }

//     /* -------------------------------------------- */

//     /**
//      * Render an HTMLElement for the Application.
//      * An Application subclass must implement this method in order for the Application to be renderable.
//      * @param {ApplicationRenderContext} context      Context data for the render operation
//      * @param {ApplicationRenderOptions} options      Options which configure application rendering behavior
//      * @returns {Promise<HTMLElement|HTMLCollection>} A single rendered HTMLElement or an HTMLCollection of HTMLElements
//      * @abstract
//      */
//     async _renderHTML(context: ApplicationRenderContext, options: ApplicationRenderOptions): Promise < HTMLElement | HTMLCollection > {}

// /* -------------------------------------------- */

// /**
//  * Replace the HTML of the application with the result provided by the rendering backend.
//  * An Application subclass must implement this method in order for the Application to be renderable.
//  * @param {any} result                            The result returned by the application rendering backend
//  * @param {HTMLElement} content                   The content element into which the rendered result must be inserted
//  * @param {ApplicationRenderOptions} options      Options which configure application rendering behavior
//  * @abstract
//  */
// _replaceHTML(result: any, content: HTMLElement, options: ApplicationRenderOptions) { }

//     /* -------------------------------------------- */

//     /**
//      * Render the outer framing HTMLElement which wraps the inner HTML of the Application.
//      * @param {ApplicationRenderOptions} options    Options which configure application rendering behavior
//      * @returns {Promise<HTMLElement>}
//      * @protected
//      */
//     async _renderFrame(options: ApplicationRenderOptions): Promise < HTMLElement > {
//     const frame = document.createElement(this.options.tag);
//     frame.id = this.#id;
//     if(this.options.classes.length) frame.className = this.options.classes.join(" ");
//     if(!this.hasFrame) return frame;

//     // Window applications
//     const labels = {
//         controls: game.i18n.localize("APPLICATION.TOOLS.ControlsMenu"),
//         toggleControls: game.i18n.localize("APPLICATION.TOOLS.ToggleControls"),
//         close: game.i18n.localize("APPLICATION.TOOLS.Close")
//     };
//     frame.innerHTML = `<header class="window-header">
//       <i class="window-icon hidden"></i>
//       <h1 class="window-title"></h1>
//       <button type="button" class="header-control fa-solid fa-ellipsis-vertical" 
//               data-tooltip="${labels.toggleControls}" aria-label="${labels.toggleControls}" 
//               data-action="toggleControls"></button>
//       <button type="button" class="header-control fa-solid fa-times" 
//               data-tooltip="${labels.close}" aria-label="${labels.close}" data-action="close"></button>
//     </header>
//     <menu class="controls-dropdown"></menu>
//     <section class="window-content"></section>`;

//     // Reference elements
//     this.#window.title = frame.querySelector(".window-title");
//     this.#window.icon = frame.querySelector(".window-icon");
//     this.#window.close = frame.querySelector("button[data-action=close]");
//     this.#window.controls = frame.querySelector("button[data-action=toggleControls]");
//     this.#window.controlsDropdown = frame.querySelector(".controls-dropdown");
//     return frame;
// }

// /* -------------------------------------------- */

// /**
//  * Render a header control button.
//  * @param {ApplicationHeaderControlsEntry} control
//  * @returns {HTMLLIElement}
//  * @protected
//  */
// _renderHeaderControl(control: ApplicationHeaderControlsEntry): HTMLLIElement {
//     const li = document.createElement("li");
//     li.className = "header-control";
//     li.dataset.action = control.action;
//     li.innerHTML = `<button class="control">
//         <i class="control-icon fa-fw ${control.icon}"></i><span class="control-label">${control.label}</span>
//     </button>`;
//     return li;
// }

// /* -------------------------------------------- */

// /**
//  * When the Application is rendered, optionally update aspects of the window frame.
//  * @param {ApplicationRenderOptions} options      Options provided at render-time
//  * @protected
//  */
// _updateFrame(options: ApplicationRenderOptions) {
//     const window = options.window;
//     if (!window) return;
//     if ("title" in window) this.#window.title.innerText = window.title;
//     if ("icon" in window) this.#window.icon.className = `window-icon fa-fw ${window.icon || "hidden"}`;
//     if ("controls" in window) {
//         const controls = this._getHeaderControls().map(c => this._renderHeaderControl(c));
//         this.#window.controlsDropdown.replaceChildren(...controls);
//         this.#window.controls.classList.toggle("hidden", !controls.length);
//     }
// }

// /* -------------------------------------------- */

// /**
//  * Insert the application HTML element into the DOM.
//  * Subclasses may override this method to customize how the application is inserted.
//  * @param {HTMLElement} element                 The element to insert
//  * @returns {HTMLElement}                       The inserted element
//  * @protected
//  */
// _insertElement(element: HTMLElement): HTMLElement {
//     const existing = document.getElementById(element.id);
//     if (existing) existing.replaceWith(element);
//     else document.body.append(element);
// }

//     /* -------------------------------------------- */
//     /*  Closing                                     */
//     /* -------------------------------------------- */

//     /**
//      * Close the Application, removing it from the DOM.
//      * @param {ApplicationClosingOptions} [options] Options which modify how the application is closed.
//      * @returns {Promise<ApplicationV2>}            A Promise which resolves to the closed Application instance
//      */
//     async close(options: ApplicationClosingOptions = {}): Promise < ApplicationV2 > {
//     return this.#semaphore.add(this.#close.bind(this), options);
// }

//     /* -------------------------------------------- */

//     /**
//      * Manage the closing step of the Application life-cycle.
//      * This private method delegates out to several protected methods which can be defined by the subclass.
//      * @param {ApplicationClosingOptions} [options] Options which modify how the application is closed
//      * @returns {Promise<ApplicationV2>}            A Promise which resolves to the rendered Application instance
//      */
//     async #close(options: ApplicationClosingOptions): Promise < ApplicationV2 > {
//     const states = ApplicationV2.RENDER_STATES;
//     if(!this.#element) {
//     this.#state = states.CLOSED;
//     return this;
// }

// // Pre-close life-cycle events (awaited)
// await this.#doEvent(this._preClose, { async: true, handlerArgs: [options], debugText: "Before close" });

// // Remove the application element
// this.#element.classList.add("minimizing");
// this.#element.style.maxHeight = "0px";
// this.#state = states.CLOSING;
// await this._awaitTransition(this.#element, 1000);

// // Remove the closed element
// this._removeElement(this.#element);
// this.#element = null;
// this.#state = states.CLOSED;
// foundry.applications.instances.delete(this.#id);

// // Post-close life-cycle events (not awaited)
// // noinspection ES6MissingAwait
// this.#doEvent(this._onClose, {
//     handlerArgs: [options], debugText: "After close", eventName: "close",
//     hookName: "close"
// });
// return this;
//     }

// /* -------------------------------------------- */

// /**
//  * Remove the application HTML element from the DOM.
//  * Subclasses may override this method to customize how the application element is removed.
//  * @param {HTMLElement} element                 The element to be removed
//  * @protected
//  */
// _removeElement(element: HTMLElement) {
//     element.remove();
// }

// /* -------------------------------------------- */
// /*  Positioning                                 */
// /* -------------------------------------------- */

// /**
//  * Update the Application element position using provided data which is merged with the prior position.
//  * @param {Partial<ApplicationPosition>} [position] New Application positioning data
//  * @returns {ApplicationPosition}                   The updated application position
//  */
// setPosition(position: Partial<ApplicationPosition>): ApplicationPosition {
//     if (!this.options.window.positioned) return;
//     position = Object.assign(this.#position, position);
//     this.#doEvent(this._prePosition, { handlerArgs: [position], debugText: "Before reposition" });
//     this._updatePosition(position);
//     this.#doEvent(this._onPosition, { handlerArgs: [position], debugText: "After reposition", eventName: "position" });
//     return position;
// }

// /* -------------------------------------------- */

// /**
//  * A protected method which subclasses can override to customize positioning behavior.
//  * @see ApplicationV2#setPosition
//  * @protected
//  */
// _updatePosition() {
//     if (!this.#element) return this.#position;
//     const el = this.#element;
//     let { width, height, left, top, scale } = this.#position;
//     scale ??= 1.0;
//     const computedStyle = getComputedStyle(el);
//     let minWidth = ApplicationV2.parseCSSDimension(computedStyle.minWidth, el.parentElement.offsetWidth) || 0;
//     let maxWidth = ApplicationV2.parseCSSDimension(computedStyle.maxWidth, el.parentElement.offsetWidth) || Infinity;
//     let minHeight = ApplicationV2.parseCSSDimension(computedStyle.minHeight, el.parentElement.offsetHeight) || 0;
//     let maxHeight = ApplicationV2.parseCSSDimension(computedStyle.maxHeight, el.parentElement.offsetHeight) || Infinity;
//     let bounds = el.getBoundingClientRect();
//     const { clientWidth, clientHeight } = document.documentElement;
//     const styles = {};

//     // Explicit width
//     if (width !== "auto") {
//         const targetWidth = Number(width || bounds.width);
//         minWidth = parseInt(minWidth) || 0;
//         maxWidth = parseInt(maxWidth) || (clientWidth / scale);
//         width = Math.clamp(targetWidth, minWidth, maxWidth);
//         styles.width = `${width}px`;
//     }

//     // Explicit height
//     if (height !== "auto") {
//         const targetHeight = Number(height || bounds.height);
//         minHeight = parseInt(minHeight) || 0;
//         maxHeight = parseInt(maxHeight) || (clientHeight / scale);
//         height = Math.clamp(targetHeight, minHeight, maxHeight);
//         styles.height = `${height}px`;
//     }

//     // Implicit height
//     if (height === "auto") {
//         Object.assign(el.style, { width: styles.width, height: "" });
//         bounds = el.getBoundingClientRect();
//         height = bounds.height;
//         styles.height = `${height}px`;
//     }

//     // Implicit width
//     if (width === "auto") {
//         Object.assign(el.style, { height: styles.height, width: "" });
//         bounds = el.getBoundingClientRect();
//         width = bounds.width;
//         styles.width = `${width}px`;
//     }

//     // Left Offset
//     const scaledWidth = width * scale;
//     const targetLeft = left ?? ((clientWidth - scaledWidth) / 2);
//     const maxLeft = Math.max(clientWidth - scaledWidth, 0);
//     left = Math.clamp(targetLeft, 0, maxLeft);
//     styles.left = `${left}px`;

//     // Top Offset
//     const scaledHeight = height * scale;
//     const targetTop = top ?? ((clientHeight - scaledHeight) / 2);
//     const maxTop = Math.max(clientHeight - scaledHeight, 0);
//     top = Math.clamp(targetTop, 0, maxTop);
//     styles.top = `${top}px`;

//     // Scale
//     scale ??= 1.0;
//     styles.transform = scale === 1 ? "" : `scale(${scale})`;

//     // Apply updates
//     Object.assign(this.#position, { width, height, left, top });
//     Object.assign(el.style, styles);
// }

// /* -------------------------------------------- */
// /*  Other Public Methods                        */
// /* -------------------------------------------- */

// /**
//  * Is the window control buttons menu currently expanded?
//  * @type {boolean}
//  */
// #controlsExpanded: boolean = false;

// /**
//  * Toggle display of the Application controls menu.
//  * Only applicable to window Applications.
//  * @param {boolean} [expanded]      Set the controls visibility to a specific state.
//  *                                  Otherwise, the visible state is toggled from its current value
//  */
// toggleControls(expanded: boolean) {
//     expanded ??= !this.#controlsExpanded;
//     if (expanded === this.#controlsExpanded) return;
//     const dropdown = this.#element.querySelector(".controls-dropdown");
//     dropdown.classList.toggle("expanded", expanded);
//     this.#controlsExpanded = expanded;
//     game.tooltip.deactivate();
// }

//     /* -------------------------------------------- */

//     /**
//      * Minimize the Application, collapsing it to a minimal header.
//      * @returns {Promise<void>}
//      */
//     async minimize(): Promise < void> {
//     if(this.minimized || !this.hasFrame || !this.options.window.minimizable) return;
//     this.#minimization.active = true;

//     // Record pre-minimization data
//     this.#minimization.priorWidth = this.#position.width;
//     this.#minimization.priorHeight = this.#position.height;

//     // Animate to collapsed size
//     this.#element.classList.add("minimizing");
//     this.#element.style.maxWidth = "var(--minimized-width)";
//     this.#element.style.maxHeight = "var(--header-height)";
//     await this._awaitTransition(this.#element, 1000);
//     this.#element.classList.add("minimized");
//     this.#element.classList.remove("minimizing");
// }

//     /* -------------------------------------------- */

//     /**
//      * Restore the Application to its original dimensions.
//      * @returns {Promise<void>}
//      */
//     async maximize(): Promise < void> {
//     if(!this.minimized) return;
//     this.#minimization.active = false;

//     // Animate back to full size
//     this.#element.classList.remove("minimized");
//     this.#element.classList.add("maximizing");
//     this.#element.style.maxWidth = "";
//     this.#element.style.maxHeight = "";
//     await this._awaitTransition(this.#element, 1000);
//     this.#element.classList.remove("maximizing");

//     // Restore the application position
//     this._updatePosition(Object.assign(this.#position, {
//         width: this.#minimization.priorWidth,
//         height: this.#minimization.priorHeight
//     }));
// }

//     /* -------------------------------------------- */
//     /*  Life-Cycle Handlers                         */
//     /* -------------------------------------------- */

//     /**
//      * Perform an event in the application life-cycle.
//      * Await an internal life-cycle method defined by the class.
//      * Optionally dispatch an event for any registered listeners.
//      * @param {Function} handler        A handler function to call
//      * @param {object} options          Options which configure event handling
//      * @param {boolean} [options.async]         Await the result of the handler function?
//      * @param {any[]} [options.handlerArgs]     Arguments passed to the handler function
//      * @param {string} [options.debugText]      Debugging text to log for the event
//      * @param {string} [options.eventName]      An event name to dispatch for registered listeners
//      * @param {string} [options.hookName]       A hook name to dispatch for this and all parent classes
//      * @param {any[]} [options.hookArgs]        Arguments passed to the requested hook function
//      * @returns {Promise<void>}         A promise which resoles once the handler is complete
//      */
//     async #doEvent(handler: Function, { async = false, handlerArgs, debugText, eventName, hookName, hookArgs =[] }: { async?: boolean; handlerArgs?: any[]; debugText?: string; eventName?: string; hookName?: string; hookArgs?: any[]; } = {}): Promise < void> {

//     // Debug logging
//     if(debugText && CONFIG.debug.applications) {
//     console.debug(`${this.constructor.name} | ${debugText}`);
// }

// // Call handler function
// const response = handler.call(this, ...handlerArgs);
// if (async) await response;

// // Dispatch event for this Application instance
// if (eventName) this.dispatchEvent(new Event(eventName));

// // Call hooks for this Application class
// if (hookName) {
//     for (const cls of this.constructor.inheritanceChain()) {
//         Hooks.callAll(`${hookName}${cls.name}`, this, ...hookArgs);
//     }
// }
// return response;
//     }

//     /* -------------------------------------------- */
//     /*  Rendering Life-Cycle Methods                */
//     /* -------------------------------------------- */

//     /**
//      * Actions performed before a first render of the Application.
//      * @param {ApplicationRenderContext} context      Prepared context data
//      * @param {ApplicationRenderOptions} options      Provided render options
//      * @returns {Promise<void>}
//      * @protected
//      */
//     async _preFirstRender(context: ApplicationRenderContext, options: ApplicationRenderOptions): Promise < void> {}

// /**
//  * Actions performed after a first render of the Application.
//  * Post-render steps are not awaited by the render process.
//  * @param {ApplicationRenderContext} context      Prepared context data
//  * @param {ApplicationRenderOptions} options      Provided render options
//  * @protected
//  */
// _onFirstRender(context: ApplicationRenderContext, options: ApplicationRenderOptions) { }

//     /**
//      * Actions performed before any render of the Application.
//      * Pre-render steps are awaited by the render process.
//      * @param {ApplicationRenderContext} context      Prepared context data
//      * @param {ApplicationRenderOptions} options      Provided render options
//      * @returns {Promise<void>}
//      * @protected
//      */
//     async _preRender(context: ApplicationRenderContext, options: ApplicationRenderOptions): Promise < void> {}

// /**
//  * Actions performed after any render of the Application.
//  * Post-render steps are not awaited by the render process.
//  * @param {ApplicationRenderContext} context      Prepared context data
//  * @param {ApplicationRenderOptions} options      Provided render options
//  * @protected
//  */
// _onRender(context: ApplicationRenderContext, options: ApplicationRenderOptions) { }

//     /**
//      * Actions performed before closing the Application.
//      * Pre-close steps are awaited by the close process.
//      * @param {ApplicationRenderOptions} options      Provided render options
//      * @returns {Promise<void>}
//      * @protected
//      */
//     async _preClose(options: ApplicationRenderOptions): Promise < void> {}

// /**
//  * Actions performed after closing the Application.
//  * Post-close steps are not awaited by the close process.
//  * @param {ApplicationRenderOptions} options      Provided render options
//  * @protected
//  */
// _onClose(options: ApplicationRenderOptions) { }

// /**
//  * Actions performed before the Application is re-positioned.
//  * Pre-position steps are not awaited because setPosition is synchronous.
//  * @param {ApplicationPosition} position          The requested application position
//  * @protected
//  */
// _prePosition(position: ApplicationPosition) { }

// /**
//  * Actions performed after the Application is re-positioned.
//  * @param {ApplicationPosition} position          The requested application position
//  * @protected
//  */
// _onPosition(position: ApplicationPosition) { }

// /* -------------------------------------------- */
// /*  Event Listeners and Handlers                */
// /* -------------------------------------------- */

// /**
//  * Attach event listeners to the Application frame.
//  * @protected
//  */
// _attachFrameListeners() {
//     this.#element.addEventListener("click", this.#onClick.bind(this), { capture: true });
//     if (this.hasFrame) {
//         this.#window.title.addEventListener("pointerdown", this.#onWindowDragStart.bind(this), { capture: true });
//         this.#window.title.addEventListener("dblclick", this.#onWindowDoubleClick.bind(this));
//     }
// }

//     /* -------------------------------------------- */

//     /**
//      * Centralized handling of click events which occur on or within the Application frame.
//      * @param {PointerEvent} event
//      */
//     async #onClick(event: PointerEvent) {
//     const target = event.target;
//     const actionButton = target.closest("[data-action]");
//     if (actionButton) return this.#onClickAction(event, actionButton);
// }

// /* -------------------------------------------- */

// /**
//  * Handle a click event on an element which defines a [data-action] handler.
//  * @param {PointerEvent} event      The originating click event
//  * @param {HTMLElement} target      The capturing HTML element which defined a [data-action]
//  */
// #onClickAction(event: PointerEvent, target: HTMLElement) {
//     const action = target.dataset.action;
//     switch (action) {
//         case "close":
//             event.stopPropagation();
//             this.close();
//             break;
//         case "toggleControls":
//             event.stopPropagation();
//             this.toggleControls();
//             break;
//         default:
//             const handler = this.options.actions[action];
//             handler?.call(this, event, target);
//     }
// }

// /* -------------------------------------------- */

// /**
//  * A generic event handler for action clicks which can be extended by subclasses.
//  * Action handlers defined in DEFAULT_OPTIONS are called first. This method is only called for actions which have
//  * no defined handler.
//  * @param {PointerEvent} event      The originating click event
//  * @param {HTMLElement} target      The capturing HTML element which defined a [data-action]
//  * @protected
//  */
// _onClickAction(event: PointerEvent, target: HTMLElement) { }

//     /* -------------------------------------------- */

//     /**
//      * Begin dragging the Application position.
//      * @param {PointerEvent} event
//      */
//     async #onWindowDragStart(event: PointerEvent) {
//     this.#onWindowDragEnd(event);
//     this.#window.dragStartPosition = Object.assign(foundry.utils.deepClone(this.#position), {
//         clientX: event.clientX,
//         clientY: event.clientY
//     });
//     window.addEventListener("pointermove", this.#window.onDrag);
//     window.addEventListener("pointerup", this.#onWindowDragEnd.bind(this), { capture: true, once: true });
// }

// /* -------------------------------------------- */

// /**
//  * Drag the Application position during mouse movement.
//  * @param {PointerEvent} event
//  */
// #onWindowDragMove(event: PointerEvent) {
//     const { dragTime: t0, dragStartPosition: p0 } = this.#window;
//     const now = Date.now();
//     if ((now - t0) < (1000 / 60)) return;
//     this.#window.dragTime = now;
//     const position = {
//         left: p0.left + (event.clientX - p0.clientX),
//         top: p0.top + (event.clientY - p0.clientY),
//         height: p0.height,
//         width: p0.width
//     };
//     this.setPosition(position);
// }

// /* -------------------------------------------- */

// /**
//  * Conclude dragging the Application position.
//  * @param {PointerEvent} event
//  */
// #onWindowDragEnd(event: PointerEvent) {
//     window.removeEventListener("pointermove", this.#window.onDrag);
//     delete this.#window.dragStartPosition;
// }

// /* -------------------------------------------- */

// /**
//  * Double-click events on the window title are used to minimize or maximize the application.
//  * @param {PointerEvent} event
//  */
// #onWindowDoubleClick(event: PointerEvent) {
//     event.preventDefault();
//     if (!this.options.window.minimizable) return;
//     if (this.minimized) this.maximize();
//     else this.minimize();
// }

//     /* -------------------------------------------- */
//     /*  Helper Methods                              */
//     /* -------------------------------------------- */

//     /**
//      * Parse a CSS style rule into a number of pixels which apply to that dimension.
//      * @param {string} style            The CSS style rule
//      * @param {number} parentDimension  The relevant dimension of the parent element
//      * @returns {number}                The parsed style dimension in pixels
//      */
//     static parseCSSDimension(style: string, parentDimension: number): number {
//     if (style.includes("px")) return parseInt(style.replace("px", ""));
//     if (style.includes("%")) {
//         const p = parseInt(style.replace("%", "")) / 100;
//         return parentDimension * p;
//     }
// }

//     /* -------------------------------------------- */

//     /**
//      * Wait for a CSS transition to complete for an element.
//      * @param {HTMLElement} element         The element which is transitioning
//      * @param {number} timeout              A timeout in milliseconds in case the transitionend event does not occur
//      * @returns {Promise<void>}
//      * @internal
//      */
//     async _awaitTransition(element: HTMLElement, timeout: number): Promise < void> {
//     return Promise.race([
//         new Promise(resolve => element.addEventListener("transitionend", resolve, { once: true })),
//         new Promise(resolve => window.setTimeout(resolve, timeout))
//     ]);
// }
// }