import { TemplateConstructor } from './data-template.ts';
import Trait from '../models/trait.ts';

/**
 * Adds slug property to target data model.
 * @group Mixins
 */
export default function HasEmbed<BaseClass extends TemplateConstructor>(baseClass: BaseClass, baseType: string) {
    class TemplateClass extends baseClass {
        override async toEmbed(_config: foundry.abstract.DocumentHTMLEmbedConfig, options: EnrichmentOptions, additionalProperties: Record<string, unknown> = {}, type = baseType): Promise<HTMLElement | HTMLCollection | null> {
            options = { ...options, _embedDepth: (options._embedDepth ?? 0) + 1, relativeTo: this };
            
            const traits = (() => {
                if('_traits' in this && Array.isArray(this._traits) && this._traits.length > 0) return this._traits.map(trait => ({value: trait.slug, label: trait.label, type: trait.type as Trait["type"]}));
                return [];
            })();

            const actions = (() => {
              if('actions' in this && this.actions instanceof Collection) return this.actions.map(a => {
                const action = a as Record<string, unknown>;
                return {
                  action,
                  traits: "traits" in action && (Array.isArray(action.traits) || action.traits instanceof Collection) ? action.traits.map(trait => ({value: trait.slug, label: trait.label, type: trait.type})) : [],
                  fields: "schema" in action && action.schema && typeof action.schema === 'object' && 'fields' in action.schema ? action.schema.fields : {}
                }
              });
              return [];
            })();

            const enrichedEffect = await foundry.applications.ux.TextEditor.enrichHTML(await foundry.applications.handlebars.renderTemplate(`systems/ptr2e/templates/items/embeds/${type}.hbs`, {...additionalProperties, document: this.parent, fields: this.schema.fields, traits, actions}), options);
            const container = document.createElement("div");
            container.classList.add("embed",`${type}-embed`);
            container.innerHTML = enrichedEffect;

            return container;
        }
    }

    return TemplateClass;
}