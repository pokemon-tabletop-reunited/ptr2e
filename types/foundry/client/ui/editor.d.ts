import type * as TinyMCE from "tinymce";

declare global {
    type EnrichmentAnchorOptions = {
        attrs?: Record<string, string>;
        dataset?: Record<string, string>;
        classes?: string[];
        name?: string;
        icon?: string;
    };


    /** A collection of helper functions and utility methods related to the rich text editor */
    class TextEditor {
        /**
         * Create a Rich Text Editor. The current implementation uses TinyMCE
         * @param options Configuration options provided to the Editor init
         * @param [options.engine=tinymce] Which rich text editor engine to use, "tinymce" or "prosemirror". TinyMCE
         *                                 is deprecated and will be removed in a later version.
         * @param content Initial HTML or text content to populate the editor with
         * @returns The editor instance.
         */
        static create(options?: EditorCreateOptions, content?: string): Promise<TinyMCE.Editor | ProseMirrorEditor>;

        /** A list of elements that are retained when truncating HTML. */
        protected static _PARAGRAPH_ELEMENTS: Set<string>;

        protected static _decoder: HTMLTextAreaElement;

        /* -------------------------------------------- */
        /*  HTML Manipulation Helpers                   */
        /* -------------------------------------------- */

        /**
         * Safely decode an HTML string, removing invalid tags and converting entities back to unicode characters.
         * @param html The original encoded HTML string
         * @return The decoded unicode string
         */
        static decodeHTML(html: string): string;

        /**
         * Enrich HTML content by replacing or augmenting components of it
         * @param content      The original HTML content (as a string)
         * @param [options={}] Additional options which configure how HTML is enriched
         * @param [options.secrets=false]  Include secret tags in the final HTML? If false secret blocks will be removed.
         * @param [options.documents=true] Replace dynamic document links?
         * @param [options.links=true]     Replace hyperlink content?
         * @param [options.rolls=true]     Replace inline dice rolls?
         * @param [options.rollData]       The data object providing context for inline rolls
         * @return The enriched HTML content
         */
        static enrichHTML(content: string | null, options?: EnrichmentOptions): Promise<string>;

        /**
         * Convert text of the form @UUID[uuid]{name} to anchor elements.
         * @param text      The existing text content
         * @param [options] Options provided to customize text enrichment
         * @param [options.async]      Whether to resolve UUIDs asynchronously
         * @param [options.relativeTo] A document to resolve relative UUIDs against.
         * @returns Whether any content links were replaced and the text nodes need to be updated.
         */
        static _enrichContentLinks(text: Text[], options?: EnrichmentOptions): boolean | Promise<boolean>;

        /**
         * Preview an HTML fragment by constructing a substring of a given length from its inner text.
         * @param content The raw HTML to preview
         * @param length  The desired length
         * @return The previewed HTML
         */
        static previewHTML(content: string, length: number): string;

        /**
         * Sanitises an HTML fragment and removes any non-paragraph-style text.
         * @param html The root HTML element.
         */
        static truncateHTML<T extends HTMLElement>(html: T): T;

        /**
         * Truncate a fragment of text to a maximum number of characters.
         * @param text         The original text fragment that should be truncated to a maximum length
         * @param [maxLength]  The maximum allowed length of the truncated string.
         * @param [splitWords] Whether to truncate by splitting on white space (if true) or breaking words.
         * @param [suffix]     A suffix string to append to denote that the text was truncated.
         */
        static truncateText(
            text: string,
            { maxLength, splitWords, suffix }: { maxLength?: number; splitWords?: boolean; suffix?: string | null },
        ): string;

        /* -------------------------------------------- */
        /*  Text Node Manipulation                      */
        /* -------------------------------------------- */

        /**
         * Recursively identify the text nodes within a parent HTML node for potential content replacement.
         * @param parent The parent HTML Element
         * @return An array of contained Text nodes
         */
        protected static _getTextNodes(parent: HTMLElement): Text[];

        /**
         * Facilitate the replacement of text node content using a matching regex rule and a provided replacement function.
         */
        protected static _replaceTextContent(text: Text[], rgx: RegExp, func: (param: string) => string): boolean;

        /** Replace a matched portion of a Text node with a replacement Node */
        protected static _replaceTextNode(text: string, match: RegExpMatchArray, replacement: Node): void;

        /* -------------------------------------------- */
        /*  Text Replacement Functions                  */
        /* -------------------------------------------- */

        /**
         * Create a dynamic document link from a regular expression match
         * @param match     The regular expression match
         * @param [options] Additional options to configure enrichment behaviour
         * @param [options.async=false] If asynchronous evaluation is enabled, fromUuid will be
         *                              called, allowing comprehensive UUID lookup, otherwise fromUuidSync will be used.
         * @param [options.relativeTo]  A document to resolve relative UUIDs against.
         * @returns An HTML element for the document link, returned as a Promise if async was true and the message
         *          contained a UUID link.
         */
        protected static _createContentLink(
            match: RegExpMatchArray,
            options?: { async?: boolean; relativeTo?: ClientDocument },
        ): HTMLAnchorElement | Promise<HTMLAnchorElement>;

        /**
         * Helper method to create an anchor element.
         * @param {Partial<EnrichmentAnchorOptions>} [options]  Options to configure the anchor's construction.
         * @returns {HTMLAnchorElement}
         */
        static createAnchor(options?: Partial<EnrichmentAnchorOptions>): HTMLAnchorElement;

        /**
         * Replace a hyperlink-like string with an actual HTML &lt;a> tag
         * @param match The full matched string
         * @return An HTML element for the document link
         */
        protected static _createHyperlink(match: string): HTMLAnchorElement;

        /**
         * Replace an inline roll formula with a rollable &lt;a> element or an eagerly evaluated roll result
         * @param match     The regular expression match array
         * @param rollData  Provided roll data for use in roll evaluation
         * @param [options] Additional options to configure enrichment behaviour
         * @returns The replaced match, returned as a Promise if async was true and the message contained an
         *          immediate inline roll.
         */
        static _createInlineRoll(
            match: RegExpMatchArray,
            rollData: Record<string, unknown>,
            options?: EvaluateRollParams,
        ): HTMLAnchorElement | null | Promise<HTMLAnchorElement | null>;

        /* -------------------------------------------- */
        /*  Event Listeners and Handlers                */
        /* -------------------------------------------- */

        static activateListeners(): void;

        /** Handle click events on Document Links */
        protected static _onClickContentLink(event: Event): Promise<void>;

        /**
         * Handle left-mouse clicks on an inline roll, dispatching the formula or displaying the tooltip
         * @param event The initiating click event
         */
        static _onClickInlineRoll(event: MouseEvent): Promise<ChatMessage | void>;

        /**
         * Toggle playing or stopping an embedded {@link PlaylistSound} link.
         * @param doc The PlaylistSound document to play/stop.
         */
        protected static _onPlaySound(doc: PlaylistSound<Playlist>): void;

        /** Find all content links belonging to a given PlaylistSound. */
        protected static _getSoundContentLinks(doc: PlaylistSound<Playlist>): NodeListOf<HTMLAnchorElement>;

        /**
         * Begin a Drag+Drop workflow for a dynamic content link
         * @param event The originating drag event
         */
        protected static _onDragContentLink(event: DragEvent): void;

        /**
         * Handle dropping of transferred data onto the active rich text editor
         * @param event  The originating drop event which triggered the data transfer
         * @param editor The TinyMCE editor instance being dropped on
         */
        protected static _onDropEditorData(event: DragEvent, editor: TinyMCE.Editor): Promise<void>;

        /**
         * Extract JSON data from a drag/drop event.
         * @param event The drag event which contains JSON data.
         * @returns The extracted JSON data. The object will be empty if the DragEvent did not contain JSON-parseable data.
         */
        static getDragEventData<T>(event: DragEvent): T;
        static getDragEventData(event: DragEvent): object;

        /** Given a Drop event, returns a Content link if possible such as @Actor[ABC123], else null */
        static getContentLink(event: DragEvent): Promise<string | null>;
    }

    interface EnrichmentOptions {
        async?: boolean;
        secrets?: boolean;
        documents?: boolean;
        links?: boolean;
        rolls?: boolean;
        rollData?: Record<string, unknown>;
        _embedDepth?: number;
        relativeTo?: unknown;
    }

    type EditorCreateOptions = Partial<TinyMCE.EditorOptions | ProseMirrorEditorOptions> & {
        engine?: "tinymce" | "prosemirror";
    };
}
