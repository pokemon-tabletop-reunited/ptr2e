import { ItemPTR2e } from "@item";

interface BackingData {
    value: string;
    label: string;
};

export class HTMLStringTagsElementPTR2e extends foundry.applications.elements.HTMLStringTagsElement<
    BackingData | string
> {
    declare _value: Set<BackingData>;

    static override tagName = "string-tags-ptr2e";

    /**
     * The button element to add a new tag.
     * @type {HTMLButtonElement}
     */
    #button: HTMLButtonElement;

    /**
     * The input element to enter a new tag.
     * @type {HTMLInputElement}
     */
    #input: HTMLInputElement;

    /**
     * The tags list of assigned tags.
     * @type {HTMLDivElement}
     */
    #tags: HTMLDivElement;

    protected override _initializeTags(): void {
        const initial = this.getAttribute("value") || this.innerText || "";
        const data = (() => {
            try {
                return initial ? JSON.parse(initial) : [];
            } catch (err) {
                ui.notifications.error((err as Error).message);
                return [];
            }
        })();

        if (!Array.isArray(data)) {
            throw new Error("PTR2E.HTMLStringTagsElementPTR2e.InvalidData");
        }

        if (data.length && data.every((v) => typeof v === "string")) {
            this._value = new Set(data.map((v) => this.toValue(v)));
        } else {
            this._value = new Set(data);
        }
        this.removeAttribute("value");
    }

    protected override _validateTag(tag: string): void {
        if (!tag) throw new Error("PTR2E.HTMLStringTagsElementPTR2e.InvalidTag");
    }

    protected override _buildElements(): HTMLElement[] {
        const elements = super._buildElements();
        this.#tags = elements[0] as HTMLDivElement;
        this.#input = elements[1] as HTMLInputElement;
        this.#button = elements[2] as HTMLButtonElement;
        return elements;
    }

    static override async renderTag(data: BackingData): Promise<string> {
        const tag = document.createElement("div");
        tag.classList.add("tag");
        tag.dataset.key = data.value;
        const span = document.createElement("span");
        span.innerHTML = await TextEditor.enrichHTML(data.label);
        tag.appendChild(span);
        const a = document.createElement("a");
        a.classList.add("button", "remove", ...this.icons.remove.split(" "));
        a.dataset.tooltip = this.labels.remove;
        tag.appendChild(a);
        return tag.outerHTML;
    }

    protected override _activateListeners(): void {
        this.#button.addEventListener("click", this.#addTag.bind(this));
        this.#tags.addEventListener("click", this.#onClickTag.bind(this));
        this.#input.addEventListener("keydown", this.#onKeydown.bind(this));
    }

    /* -------------------------------------------- */

    /**
     * Remove a tag from the set when its removal button is clicked.
     */
    #onClickTag(event: MouseEvent) {
        if (!(event.target as HTMLElement).classList.contains("remove")) return;
        const key = ((event.target as HTMLElement).closest(".tag") as HTMLElement).dataset.key!;
        const value = this._value.find((v) => v.value === key);
        if (!value) return;
        this._value.delete(value);
        this.dispatchEvent(new Event("change", {bubbles: true}));
        this._refresh();
    }

    /* -------------------------------------------- */

    /**
     * Add a tag to the set when the ENTER key is pressed in the text input.
     */
    #onKeydown(event: KeyboardEvent) {
        if (event.key !== "Enter") return;
        event.preventDefault();
        event.stopPropagation();
        this.#addTag();
    }

    /* -------------------------------------------- */

    /**
     * Add a new tag to the set upon user input.
     */
    async #addTag() {
        const tag = this.#input.value;

        // Validate the proposed code
        try {
            this._validateTag(tag);
        } catch (err: unknown) {
            ui.notifications.error((err as Error).message);
            this.#input.value = "";
            return;
        }

        // Ensure uniqueness
        if (this._value.find((v) => v.value === tag || v.label === tag)) {
            ui.notifications.error(`Tag "${tag}" is already set".`);
            this.#input.value = "";
            return;
        }

        // Add value
        try {
            const value = await this.toValue(tag, true, true);
            this._value.add(value);
            this.#input.value = "";
        } catch (err: unknown) {
            ui.notifications.error((err as Error).message);
            this.#input.value = "";
            return;
        }

        this.dispatchEvent(new Event("change", {bubbles: true}));
        this._refresh();
    }

    toValue(tag: string): BackingData;
    async toValue(tag: string, async: true, strict: boolean): Promise<BackingData>;
    toValue(tag: string, async = false, strict = false): BackingData | Promise<BackingData> {
        const uuid = tag ? fu.parseUuid(tag) : null;
        // If the tag is a UUID, try to find the item with that ID and use its name as the label
        if (uuid?.id) {
            if (async) return this.toValueAsync(tag, strict);

            const item = fromUuidSync<ItemPTR2e | CompendiumIndexData>(tag);
            if (item)
                return {
                    value: tag,
                    label: (() => {
                        // Escape the name in case it is a Keyword
                        const ele = document.createElement("div");
                        ele.innerText = item.name;

                        return `@UUID[${tag}]{${ele.innerHTML}}`;
                    })(),
                };
            if (strict) throw new Error(`Item with ID ${tag} not found.`);
        }

        // Otherwise, use the tag as both the value and the label
        // But escape the tag
        const ele = document.createElement("div");
        ele.innerText = tag;

        return { value: tag, label: ele.innerHTML };
    }

    private async toValueAsync(tag: string, strict = false) {
        const item = await fromUuid<ItemPTR2e>(tag);
        if (item) {
            return {
                value: tag,
                label: (() => {
                    // Escape the name in case it is a Keyword
                    const ele = document.createElement("div");
                    ele.innerText = item.name;

                    return `@UUID[${tag}]{${ele.innerHTML}}`;
                })(),
            };
        }
        if (strict) throw new Error(`Item with ID ${tag} not found.`);

        // Otherwise, use the tag as both the value and the label
        // But escape the tag
        const ele = document.createElement("div");
        ele.innerText = tag;

        return { value: tag, label: ele.innerHTML };
    }

    /* -------------------------------------------- */

    protected override _getValue(): string[] {
        return Array.from(this._value).map((v) => v.value);
    }

    protected override _refresh() {
        (async () => {
            this.#tags.innerHTML = (
                await Promise.all(
                    Array.from(this._value).map((v) => HTMLStringTagsElementPTR2e.renderTag(v))
                )
            ).join("");
        })();
    }

    static override create(
        config: foundry.data.fields.FormInputConfig<Iterable<BackingData>>
    ): HTMLStringTagsElementPTR2e {
        const tags = document.createElement(this.tagName);
        tags.setAttribute("name", config.name);

        const value = JSON.stringify(Array.from(config.value || []));
        tags.setAttribute("value", value);
        foundry.applications.fields.setInputAttributes(tags, config);
        return tags as HTMLStringTagsElementPTR2e;
    }
}
