export default class PerkTreeHUD extends foundry.applications.api.HandlebarsApplicationMixin(
    foundry.applications.api.ApplicationV2
) {
    static override DEFAULT_OPTIONS = fu.mergeObject(
        super.DEFAULT_OPTIONS,
        {
            id: "perk-web-hud",
            window: {
                frame: false,
                positioned: false,
            },
            actions: {
                "close-hud": () => {
                    game.ptr.web.close();
                },
                refresh: () => {
                    game.ptr.web.refresh({nodeRefresh: true});
                },
                toggleEdit: () => {
                    game.ptr.web.toggleEditMode();
                },
            },
        },
        { inplace: false }
    );

    static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
        controls: {
            id: "controls",
            template: "systems/ptr2e/templates/perk-tree/hud/controls.hbs",
        },
    };

    override async _prepareContext() {
        return {
            actor: game.ptr.web.actor,
            editMode: game.ptr.web.editMode,
        };
    }
}
