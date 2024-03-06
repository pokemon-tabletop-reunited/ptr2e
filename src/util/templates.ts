export function registerTemplates() {
    const templates = {
        "stats-chart": "systems/ptr2e/templates/partials/actor/stats-chart.hbs",
        "actor-movement": "systems/ptr2e/templates/partials/actor/movement.hbs",
        "actor-gear": "systems/ptr2e/templates/partials/actor/gear.hbs",
        "actor-abilities": "systems/ptr2e/templates/partials/actor/abilities.hbs",
        "actor-skills": "systems/ptr2e/templates/partials/actor/skills.hbs",
        "actor-actions": "systems/ptr2e/templates/partials/actor/actions.hbs",
        "attack-embed": "systems/ptr2e/templates/partials/attack-embed.hbs",
    }

    return loadTemplates(Object.values(templates)).then(() => {
        for (const [key, value] of Object.entries(templates)) {
            Handlebars.registerPartial(key, `{{> ${value}}}`);
        }
    });
};