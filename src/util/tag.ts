import Tagify from "@yaireo/tagify";

function transformWhitelist(whitelist: WhitelistData): string[] | TagData[] {
    return Array.isArray(whitelist)
        ? whitelist
        : Object.entries(whitelist)
              .map(([key, locPath]) => ({
                  id: key,
                  value: game.i18n.localize(typeof locPath === "string" ? locPath : locPath.label),
              }))
              .sort((a, b) => a.value.localeCompare(b.value, game.i18n.lang));
}

/**
 * @param {HTMLInputElement} input 
 * @param {Object} options
 * @param {Object} options.whitelist
 * @param {number} options.maxTags
 * @param {boolean} options.enforceWhitelist 
 */
function tagify(input: HTMLInputElement, options?: TagifyOptions): Tagify<TagRecord>;
function tagify(input: HTMLInputElement | null, options?: TagifyOptions): Tagify<TagRecord> | null;
function tagify(input: HTMLInputElement | null, { whitelist, maxTags, enforceWhitelist = true, traits = false }: TagifyOptions = {}): Tagify<TagRecord> | null {
    if (input?.hasAttribute("name") && input.dataset.dtype !== "JSON") {
        throw Error("Usable only on input elements with JSON data-dtype");
    } else if (!input) {
        return null;
    }

    const whitelistTransformed = whitelist ? transformWhitelist(whitelist) : [];
    const maxItems = whitelist ? Object.keys(whitelistTransformed).length : undefined;

    const tagify = new Tagify(input, {
        enforceWhitelist: !!whitelist && enforceWhitelist,
        keepInvalidTags: false,
        skipInvalid: !!whitelist,
        maxTags: maxTags ?? maxItems,
        dropdown: {
            enabled: 0,
            maxItems,
            searchKeys: ["id", "value"],
        },
        whitelist: whitelistTransformed,
        templates: {
            tag(tagData, { settings: _s }) {
                return `<tag title="${(tagData.title || tagData.value)}"
                            contenteditable='false'
                            spellcheck='false'
                            tabIndex="${_s.a11y.focusableTags ? 0 : -1}"
                            class="${_s.classNames.tag} ${tagData.class || ""}"
                            ${this.getAttributes(tagData)}>
                    <x title='' class="${_s.classNames.tagX}" role='button' aria-label='remove tag'></x>
                    <div>
                        <span class="${_s.classNames.tagText}">${traits ? '[' : ''}${tagData[_s.tagTextProp] || tagData.value}${traits ? ']' : ''}</span>
                    </div>
                </tag>`
            }
        }
    });

    // Add the name to the tags html as an indicator for refreshing
    if (input.name) {
        tagify.DOM.scope.dataset.name = input.name;
    }

    // Work around a tagify bug on Firefox
    // https://github.com/yairEO/tagify/issues/1115
    tagify.DOM.input.blur();

    return tagify;
}

/**
 * Standard properties expected by Tagify, where the `id` and `value` is what Foundry and the system would respectively
 * call the `value` and `label`
 */
type TagRecord = Record<"id" | "value", string>;

type TagData = TagRecord & {
    title?: string;
    class?: string;
};

interface TagifyOptions {
    /** The maximum number of tags that may be added to the input */
    maxTags?: number;
    /** A whitelist record */
    whitelist?: WhitelistData;
    /** Whether this whitelist is exhaustive */
    enforceWhitelist?: boolean;
    /** Whether or not this is a traits list */
    traits?: boolean
}

type WhitelistData = string[] | Record<string, string | { label: string }>;

export { tagify }