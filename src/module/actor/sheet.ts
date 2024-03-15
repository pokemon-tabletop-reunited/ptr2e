import { ActorPTR2e } from "@actor";
import { StatsChart } from "@actor/sheets/stats-chart.ts";
import { tagify } from "@utils";
import StatsForm from "./sheets/stats-form.ts";
import AttackPTR2e from "@module/data/models/attack.ts";
import { SpeciesDropSheet } from "./sheets/species-drop-sheet.ts";
import { SpeciesPTR2e } from "@item";
import { SpeciesSystemModel } from "@item/data/index.ts";

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

    protected override _getHeaderButtons(): ApplicationHeaderButton[] {
        const buttons = super._getHeaderButtons();
        if (this.actor.system.species) {
            buttons.unshift({
                label: "Species",
                class: "species",
                icon: "fas fa-paw",
                onclick: () => {
                    const species = this.actor.system.species!;
                    const sheet = new SpeciesDropSheet((item) => {
                        if (!item) return;
                        if (!(item instanceof CONFIG.Item.documentClass && item.system instanceof SpeciesSystemModel)) return;
                        if (item.slug !== species.slug) {
                            this.actor.update({ "system.species": item.toObject().system });
                        }
                    });
                    sheet.species = new CONFIG.Item.documentClass({
                        name: this.actor.name,
                        type: "species",
                        img: this.actor.img,
                        flags: { ptr2e: { disabled: !this.actor.system._source.species } },
                        system: species
                    }) as SpeciesPTR2e;
                    sheet.render(true);
                }
            });
        }
        return buttons;
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
            if (!uuid) return;
            const document = await fromUuid(uuid);

            return document?.toChat?.();
        });

        $html.find(".item-controls .item-edit").on("click", async (event) => {
            const uuid = (event.currentTarget.closest(".item-controls") as HTMLElement)?.dataset?.uuid;
            if (!uuid) return;
            const document = await fromUuid(uuid);

            return document?.sheet?.render(true);
        });

        $html.find(".attack .rollable").on("click", async (event) => {
            const slug = (event.currentTarget.closest("li.attack[data-action]") as HTMLElement)?.dataset?.action;
            if (!slug) return;
            const parentUuid = (event.currentTarget.closest("ul.action-list-attack[data-parent]") as HTMLElement)?.dataset?.parent;
            const parent = await fromUuid(parentUuid) as ActorPTR2e;
            if (!parent) return;

            const attack = parent.actions.attack.get(slug) as AttackPTR2e;
            if (!attack) return;

            return attack.roll();
        });

        // @ts-ignore
        $html.find(".stats-chart, .link-to-stats h2").on("dblclick", () => new StatsForm(this.actor).render(true));

        // @ts-ignore
        $html.find(".ptr-perk-tree").on("click", () => this.actor.togglePerkTree());
    }
}

interface ActorSheetPTR2e extends ActorSheet<ActorPTR2e> {
    _statsChart: StatsChart
    tab: string
}

export { ActorSheetPTR2e }