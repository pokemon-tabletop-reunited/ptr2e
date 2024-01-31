import Tagify from "@yaireo/tagify";

/**
 * @param {HTMLInputElement} input 
 * @param {Object} options
 * @param {Object} options.whitelist
 * @param {number} options.maxTags
 * @param {boolean} options.enforceWhitelist 
 */
function tagify(input: HTMLInputElement, { whitelist, maxTags, enforceWhitelist = true, traits = false }: { whitelist?: any, maxTags?: any, enforceWhitelist?: boolean, traits?: boolean } = {}) {
    if (input?.hasAttribute("name") && input.dataset.dtype !== "JSON") {
        throw Error("Usable only on input elements with JSON data-dtype");
    } else if (!input) {
        return null;
    }

    const whitelistTransformed = whitelist; //? transformWhitelist(whitelist) : [];
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

export { tagify }