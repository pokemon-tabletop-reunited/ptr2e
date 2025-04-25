import Tagify from '@yaireo/tagify';
import Trait from "../models/trait";
import { MixableTypeDataModel } from "./data";

export function HasEmbed<BaseClass extends typeof MixableTypeDataModel>(baseClass: BaseClass, baseType: string) {
  abstract class TemplateClass extends baseClass {
    override async toEmbed(config: TextEditor.DocumentHTMLEmbedConfig, options: TextEditor.EnrichmentOptions, additionalProperties: Record<string, unknown> = {}, type = baseType): Promise<HTMLElement | HTMLCollection | null> {
      //@ts-expect-error - Missing types from FVTT-Types
      options = { ...options, _embedDepth: ((options._embedDepth as number | undefined) ?? 0) + 1, relativeTo: this };

      const traits = (() => {
        if ('_traits' in this && Array.isArray(this._traits) && this._traits.length > 0) return (this._traits as Trait[]).map(trait => ({ value: trait.slug, label: trait.label, type: trait.type }));
        return [];
      })();

      const actions = (() => {
        if ('actions' in this && this.actions instanceof Collection) return this.actions.map(a => {
          const action = a as Record<string, unknown>;
          return {
            action,
            traits: "traits" in action && (Array.isArray(action.traits) || action.traits instanceof Collection) ? action.traits.map((trait: Trait) => ({ value: trait.slug, label: trait.label, type: trait.type })) : [],
            fields: "schema" in action && action.schema && typeof action.schema === 'object' && 'fields' in action.schema ? action.schema.fields : {}
          }
        });
        return [];
      })();

      const enrichedEffect = await TextEditor.enrichHTML(await renderTemplate(`systems/ptr2e/templates/items/embeds/${type}.hbs`, { ...additionalProperties, document: this.parent, fields: this.schema.fields, traits, actions }), options);
      const container = document.createElement("div");
      container.classList.add("embed", `${type}-embed`);
      container.innerHTML = enrichedEffect;

      if (traits.length > 0) {
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
              tag: function (tagData): string {
                return `
                                <tag contenteditable="false" spellcheck="false" tabindex="-1" class="tagify__tag" ${this.getAttributes(tagData)}style="${Trait.bgColors[tagData.type || "default"] ? `--tag-bg: ${Trait.bgColors[tagData.type || "default"]["bg"]}; --tag-hover: ${Trait.bgColors[tagData.type || "default"]["hover"]}; --tag-border-color: ${Trait.bgColors[tagData.type || "default"]["border"]};` : ""}">
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

  return TemplateClass;
}