/**
   * Augment a base class with EventEmitter behavior.
   * @template {Constructor} BaseClass
   * @param {BaseClass} BaseClass         Some base class augmented with event emitter functionality
   */
export function EventEmitterMixin<BaseClass>(BaseClass: BaseClass) {
    /**
     * A mixin class which implements the behavior of EventTarget.
     * This is useful in cases where a class wants EventTarget-like behavior but needs to extend some other class.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget
     */
    class EventEmitter extends BaseClass {

        /**
         * An array of event types which are valid for this class.
         * @type {string[]}
         */
        static emittedEvents: string[] = [];

        /**
         * A mapping of registered events.
         * @type {Object<string, Map<EmittedEventListener, {fn: EmittedEventListener, once: boolean}>>}
         */
        #events: { [s: string]: Map<EmittedEventListener, { fn: EmittedEventListener; once: boolean; }>; } = {};

        /* -------------------------------------------- */

        /**
         * Add a new event listener for a certain type of event.
         * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
         * @param {string} type                     The type of event being registered for
         * @param {EmittedEventListener} listener   The listener function called when the event occurs
         * @param {object} [options={}]             Options which configure the event listener
         * @param {boolean} [options.once=false]      Should the event only be responded to once and then removed
         */
        addEventListener(type: string, listener: EmittedEventListener, { once = false }: { once?: boolean; } = {});

        /* -------------------------------------------- */

        /**
         * Remove an event listener for a certain type of event.
         * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener
         * @param {string} type                     The type of event being removed
         * @param {EmittedEventListener} listener   The listener function being removed
         */
        removeEventListener(type: string, listener: EmittedEventListener);

        /* -------------------------------------------- */

        /**
         * Dispatch an event on this target.
         * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent
         * @param {Event} event                     The Event to dispatch
         * @returns {boolean}                       Was default behavior for the event prevented?
         */
        dispatchEvent(event: Event): boolean;
    }
    return EventEmitter;
}