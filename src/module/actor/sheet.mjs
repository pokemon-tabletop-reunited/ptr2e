import { tagify } from "../../util/tag.mjs";
import { StatsChart } from "./sheets/stats-chart.mjs";

export class PTRActorSheet extends ActorSheet {

    constructor(...args) {
        super(...args);
        this._statsChart = new StatsChart(this);
        this.tab = PTRActorSheet.defaultOptions.tabs[0].initial;
    }

    /** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ['ptr2e', 'sheet', 'actor'],
			template: 'systems/ptr2e/static/templates/actor/actor-sheet.hbs',
			width: 900,
			height: 660,
			tabs: [{
                group: "primary",
				navSelector: '.tabs',
				contentSelector: '.sheet-body',
				initial: 'summary',
			}],
			submitOnClose: true,
			submitOnChange: true,
			scrollY: [".sheet-body"]
		});
    }

    /** @override */
    async close(options = {}) {
        if (game.ptr.tree.actor === this.actor) return this.minimize();
        return super.close(options);
    }

    /** @override */
    _onChangeTab(event, tabs, active) {
        this.tab = active;

        return super._onChangeTab(event, tabs, active);
    }

    /**
     * @override
     */
    getData() {
        const data = super.getData();
        data.traits = this.actor.traits?.map(t => t.slug);
        data.party = game.actors.filter(a => a != this.actor); //TODO: change
        data.activeTab = this.tab;
        return data;
    }

    /**
     * @override
     */
    activateListeners($html) {
        super.activateListeners($html);

        this._statsChart.render();

        for (const taggifyElement of $html.find(".ptr-tagify")) {
            tagify(taggifyElement, { traits: $(taggifyElement).hasClass("system-traits") });
        }

        const actor = this.actor;
        for (const tooltipElement of $html.find(".ptr-trait")) {
            $(tooltipElement).tooltipster({
                contentAsHTML: true,
                interactive: true,
                content: 'Loading...',
                functionInit: function (origin, content) {
                    const trait = actor.traits.find(t => t.slug === tooltipElement.dataset.trait);
                    if (trait.description || trait.related.length > 0) {
                        renderTemplate("systems/ptr2e/static/templates/partials/trait-tooltip.hbs", { trait })
                            .then(html =>
                                origin.content(html)
                            );
                    }
                },
                functionReady: function (origin, content) {
                    $(content.tooltip).find(".keyword").tooltipster({
                        position: "right",
                        contentAsHTML: true,
                        content: 'This is where the creature-type keyword explanation would go and if you click it it will open the full view instead of the...',
                    })
                }
            });
        }

        $html.find(".ptr-perk-tree").on("click", () => this.actor.togglePerkTree());
    }

    // /** 
    //  * @override 
    //  * Tagify sets an empty input field to "" instead of "[]", which later causes the JSON parse to throw an error
    // */
    // async _onSubmit(event, { updateData = null, preventClose = false, preventRender = false } = {}) {
    //     const $form = $(this.form);
    //     $form.find("tags ~ input").each((_i, input) => {
    //         if (input.value === "") input.value = "[]";
    //     });

    //     return super._onSubmit(event, { updateData, preventClose, preventRender });
    // }

    // /**
    //  * @override
    //  */
    // _updateObject(event, formData) {
    //     const expanded = expandObject(formData);

    //     // Remove empty values
    //     if (Array.isArray(expanded.system.traits)) {
    //         /**
    //          * @type {TraitData[]}
    //          */
    //         expanded.system.traits = expanded.system.traits.map(s => s.value).filter(s => !!s).map(s => ({ slug: s, related: ['creature-type'], description: 'Lorem ipsum...' }));
    //     }

    //     // Update the actor
    //     return super._updateObject(event, flattenObject(expanded));
    // }
}