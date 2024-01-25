export function registerTemplates() {
    const templates = {
        "stats-chart": "systems/ptr2e/static/templates/partials/actor/stats-chart.hbs",
        "actor-movement": "systems/ptr2e/static/templates/partials/actor/movement.hbs",
        "actor-gear": "systems/ptr2e/static/templates/partials/actor/gear.hbs",
        "actor-abilities": "systems/ptr2e/static/templates/partials/actor/abilities.hbs",
        "actor-skills": "systems/ptr2e/static/templates/partials/actor/skills.hbs",
        "actor-actions": "systems/ptr2e/static/templates/partials/actor/actions.hbs",
    }

    return loadTemplates(Object.values(templates)).then(() => {
        for (const [key, value] of Object.entries(templates)) {
            Handlebars.registerPartial(key, `{{> ${value}}}`);
        }
    });
};