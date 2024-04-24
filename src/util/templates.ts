export class HandlebarTemplates {
    static templates = Object.freeze({
        "stats-chart": "systems/ptr2e/templates/partials/actor/stats-chart.hbs",
        "actor-movement": "systems/ptr2e/templates/partials/actor/movement.hbs",
        "actor-gear": "systems/ptr2e/templates/partials/actor/gear.hbs",
        "actor-abilities": "systems/ptr2e/templates/partials/actor/abilities.hbs",
        "actor-skills": "systems/ptr2e/templates/partials/actor/skills.hbs",
        "actor-actions": "systems/ptr2e/templates/partials/actor/actions.hbs",
        "attack-embed": "systems/ptr2e/templates/partials/attack-embed.hbs",
        "effect-traits": "systems/ptr2e/templates/partials/effect-traits.hbs",
        "trait-partial": "systems/ptr2e/templates/partials/trait.hbs",
        "move-body": "systems/ptr2e/templates/items/embeds/move/move-body.hbs",
        "species-body": "systems/ptr2e/templates/items/embeds/species/species-body.hbs",
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