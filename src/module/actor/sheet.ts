import { tagify } from "../../util/tag.ts";
import { PTRActor } from "./base.ts";
import { StatsChart } from "./sheets/stats-chart.mjs";

class PTRActorSheet extends ActorSheet<PTRActor> {

    constructor(actor: PTRActor, options: Partial<ActorSheetOptions>) {
        super(actor, options);
        this._statsChart = new StatsChart(this);
        this.tab = PTRActorSheet.defaultOptions.tabs[0].initial;
    }

    static override get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ['ptr2e', 'sheet', 'actor'],
            template: 'systems/ptr2e/templates/actor/actor-sheet.hbs',
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

    override async close(options = {}): Promise<void> {
        if (game.ptr.tree.actor === this.actor) { this.minimize(); return; }
        return super.close(options);
    }

    override _onChangeTab(event: MouseEvent, tabs: Tabs, active: string): void {
        this.tab = active;

        return super._onChangeTab(event, tabs, active);
    }

    override getData() {
        const data = super.getData();
        // @ts-ignore
        data.traits = this.actor.traits?.map(t => t.slug);
        // @ts-ignore
        data.party = game.actors.filter(a => a != this.actor); //TODO: change
        // @ts-ignore
        data.activeTab = this.tab;
        return data;
    }

    override activateListeners($html: JQuery<HTMLElement>) {
        super.activateListeners($html);

        this._statsChart.render();

        for (const taggifyElement of $html.find(".ptr-tagify")) {
            // @ts-ignore
            tagify(taggifyElement as HTMLInputElement, { traits: $(taggifyElement).hasClass("system-traits") });
        }

        const actor = this.actor;
        for (const tooltipElement of $html.find(".ptr-trait")) {
            $(tooltipElement).tooltipster({
                contentAsHTML: true,
                interactive: true,
                content: 'Loading...',
                functionInit: function (origin, _content) {
                    const trait = actor.traits.find((t: { slug: string | undefined; }) => t.slug === tooltipElement.dataset.trait);
                    if (trait.description || trait.related.length > 0) {
                        renderTemplate("systems/ptr2e/templates/partials/trait-tooltip.hbs", { trait })
                            .then(html =>
                                origin.content(html)
                            );
                    }
                },
                functionReady: function (_origin, content) {
                    // @ts-ignore
                    $(content.tooltip).find(".keyword").tooltipster({
                        position: "right",
                        contentAsHTML: true,
                        content: 'This is where the creature-type keyword explanation would go and if you click it it will open the full view instead of the...',
                    })
                }
            });
        }

        // @ts-ignore
        $html.find(".ptr-perk-tree").on("click", () => this.actor.togglePerkTree());
    }
}

interface PTRActorSheet extends ActorSheet<PTRActor> {
    _statsChart: StatsChart
    tab: string
}

export { PTRActorSheet }