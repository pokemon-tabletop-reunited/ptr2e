type TemplateConstructor = (new (...args: any[]) => any)

/**
 * @callback EmittedEventListener
 * @param {Event} event         The emitted event
 * @returns {any}
 */
type EmittedEventListener = (event: Event) => any

interface EventEmitterMixinInterface {
    /**
     * Add a new event listener for a certain type of event.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
     * @param {string} type                     The type of event being registered for
     * @param {EmittedEventListener} listener   The listener function called when the event occurs
     * @param {object} [options={}]             Options which configure the event listener
     * @param {boolean} [options.once=false]      Should the event only be responded to once and then removed
     */
    addEventListener(type: string, listener: EmittedEventListener, options?: { once: boolean }): void;

    /**
     * Remove an event listener for a certain type of event.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener
     * @param {string} type                     The type of event being removed
     * @param {EmittedEventListener} listener   The listener function being removed
     */
    removeEventListener(type: string, listener: EmittedEventListener): void;

    /**
     * Dispatch an event on this target.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent
     * @param {Event} event                     The Event to dispatch
     * @returns {boolean}                       Was default behavior for the event prevented?
     */
    dispatchEvent(event: Event): boolean;
}

interface EventEmitterMixinInterfaceConstructor {
    new(...args: any[]): EventEmitterMixinInterface
    emittedEvents: string[]
}

type EventEmitterMixinClass = new (...args: any[]) => EventEmitterMixinInterface
type EventEmitterMixinFunction = (base: any) => EventEmitterMixinInterfaceConstructor

declare const EventEmitterMixin: EventEmitterMixinFunction

export { EventEmitterMixin }