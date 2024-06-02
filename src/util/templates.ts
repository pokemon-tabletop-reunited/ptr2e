export class HandlebarTemplates {
    static templates = Object.freeze({
        "stats-chart": "systems/ptr2e/templates/partials/stats-chart.hbs",
        "attack-embed": "systems/ptr2e/templates/partials/attack-embed.hbs",
        "effect-traits": "systems/ptr2e/templates/partials/effect-traits.hbs",
        "trait-partial": "systems/ptr2e/templates/partials/trait.hbs",
        // All Item Sheet Embeds
        "move-body": "systems/ptr2e/templates/items/embeds/move/move-body.hbs",
        "species-body": "systems/ptr2e/templates/items/embeds/species/species-body.hbs",
        "perk-body": "systems/ptr2e/templates/items/embeds/perk/perk-body.hbs",

        // All Actor Sheet Components
        "actor-effect-component": "systems/ptr2e/templates/actor/components/actor-effect-component.hbs",
        "actor-skills-component": "systems/ptr2e/templates/actor/components/actor-skills-component.hbs",
        "actor-perks-component": "systems/ptr2e/templates/actor/components/actor-perks-component.hbs",
        "actor-abilities-component": "systems/ptr2e/templates/actor/components/actor-abilities-component.hbs",
        "actor-movement-component": "systems/ptr2e/templates/actor/components/actor-movement-component.hbs",
    }) as Record<string, string>;

    static async register() {
        return loadTemplates(Object.values(this.templates)).then(() => {
            for (const [key, value] of Object.entries(this.templates)) {
                Handlebars.registerPartial(key, `{{> ${value}}}`);
            }
        });
    }

    static unregister() {
        for (const key of Object.keys(this.templates)) {
            Handlebars.unregisterPartial(key);
        }
    }

    static reload() {
        this.unregister();
        return this.register();
    }
}