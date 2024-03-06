import { ActorPTR2e } from "@actor";
import { StatsChart } from "@actor/sheets/stats-chart.ts";
import { tagify } from "@utils";
import StatsForm from "./sheets/stats-form.ts";

class ActorSheetPTR2e extends ActorSheet<ActorPTR2e> {

    constructor(actor: ActorPTR2e, options: Partial<ActorSheetOptions>) {
        super(actor, options);
        this._statsChart = new StatsChart(this);
        this.tab = ActorSheetPTR2e.defaultOptions.tabs[0].initial;
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
        const data: Record<string, any> = super.getData();
        data.party = game.actors.filter(a => a != this.actor); //TODO: change
        data.activeTab = this.tab;
        return data as ActorSheetData<ActorPTR2e>;
    }

    override activateListeners($html: JQuery<HTMLElement>) {
        super.activateListeners($html);

        this._statsChart.render();

        for (const taggifyElement of $html.find(".ptr-tagify")) {
            tagify(taggifyElement as HTMLInputElement, { traits: $(taggifyElement).hasClass("system-traits") });
        }

        $html.find(".item-controls .item-to-chat").on("click", async (event) => {
            const uuid = (event.currentTarget.closest(".item-controls") as HTMLElement)?.dataset?.uuid;
            if(!uuid) return;
            const document = await fromUuid(uuid);

            return document?.toChat?.();
        });
        $html.find(".item-controls .item-edit").on("click", async (event) => {
            const uuid = (event.currentTarget.closest(".item-controls") as HTMLElement)?.dataset?.uuid;
            if(!uuid) return;
            const document = await fromUuid(uuid);

            return document?.sheet?.render(true);
        });
        
        // @ts-ignore
        $html.find(".stats-chart").on("dblclick", () => new StatsForm(this.actor).render(true));

        // @ts-ignore
        $html.find(".ptr-perk-tree").on("click", () => this.actor.togglePerkTree());
    }
}

interface ActorSheetPTR2e extends ActorSheet<ActorPTR2e> {
    _statsChart: StatsChart
    tab: string
}

export { ActorSheetPTR2e }