export default class PTRPerkTreeHUD extends Application {
    /** @inheritdoc */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "perk-tree-hud",
            template: "systems/ptr2e/static/templates/perk-tree/hud.hbs",
            popOut: false
        });
    }

    get tree() {
        return game.ptr.tree;
    }

    /** @override */
    getData(options = {}) {
        return {
            actor: this.tree.actor,
            editMode: this.tree.editMode
        };
    }

    /** @override */
    activateListeners(html) {
        html.find("button.close").click(() => this.tree.close());
        html.find("button.refresh").click(() => this.tree.refresh({nodeRefresh: true}));
        html.find("button.toggleEdit").click(() => this.tree.toggleEditMode());
    }
}