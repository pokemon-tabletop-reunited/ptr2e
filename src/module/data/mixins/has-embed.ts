import Tagify from '@yaireo/tagify';
import { TemplateConstructor } from './data-template.ts';

/**
 * Adds slug property to target data model.
 * @group Mixins
 */
export default function HasEmbed<BaseClass extends TemplateConstructor>(baseClass: BaseClass, type: string) {
    class TemplateClass extends baseClass {
        override async toEmbed(_config: foundry.abstract.DocumentHTMLEmbedConfig, options: EnrichmentOptions, additionalProperties: Record<string, unknown> = {}): Promise<HTMLElement | HTMLCollection | null> {
            options = { ...options, _embedDepth: (options._embedDepth ?? 0) + 1, relativeTo: this };
            
            const traits = (() => {
                if('_traits' in this && Array.isArray(this._traits) && this._traits.length > 0) return this._traits.map(trait => ({value: trait.slug, label: trait.label}));
                return [];
            })();

            const enrichedEffect = await TextEditor.enrichHTML(await renderTemplate(`systems/ptr2e/templates/items/embeds/${type}.hbs`, {...additionalProperties, document: this.parent, traits}), options);
            const container = document.createElement("div");
            container.classList.add("embed",`${type}-embed`);
            container.innerHTML = enrichedEffect;

            if(traits.length > 0) {
                for (const input of container.querySelectorAll<HTMLInputElement>(
                    "input.ptr2e-tagify"
                )) {
                    new Tagify(input, {
                        enforceWhitelist: true,
                        keepInvalidTags: false,
                        editTags: false,
                        tagTextProp: "label",
                        dropdown: {
                            enabled: 0,
                            mapValueTo: "label",
                        },
                        templates: {
                            tag: function(tagData): string {
                                return `
                                <tag contenteditable="false" spellcheck="false" tabindex="-1" class="tagify__tag" ${this.getAttributes(tagData)}>
                                <x title="" class="tagify__tag__removeBtn" role="button" aria-label="remove tag"></x>
                                <div>
                                    <span class='tagify__tag-text'>
                                        <span class="trait" data-tooltip-direction="UP" data-trait="${tagData.value}" data-tooltip="${tagData.label}"><span>[</span><span class="tag">${tagData.label}</span><span>]</span></span>
                                    </span>
                                </div>
                                `;
                            },
                        },
                        whitelist: traits
                    });
                }
            }

            return container;
        }
    }

    interface TemplateClass {
        /**
         * A slug for the item, derived from its name.
         * @defaultValue `slugify(this.name)`
         * @remarks
         * This is a unique identifier for the item within its parent actor.
         * If the item's name changes, the slug should be automatically updated.
         * If the slug is manually set, it should be unique within the actor's items.
         * @example
         * ```typescript
         * const item = new ItemPTR2e({ name: 'Flashlight' });
         * console.log(item.slug); // 'flashlight'
         * ```
         */
        slug: string;

        _source: InstanceType<typeof baseClass>['_source'] & {
            slug: string;
        };
    }

    return TemplateClass;
}