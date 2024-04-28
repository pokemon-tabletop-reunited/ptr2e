import { SpeciesPTR2e } from "@item";
import ActorPTR2e from "./base.ts";
import { SpeciesDropSheet } from "./sheets/species-drop-sheet.ts";
import { SpeciesSystemModel } from "@item/data/index.ts";
import { sluggify } from "@utils";
import { Tab } from "@item/sheets/document.ts";

class ActorSheetPTRV2 extends foundry.applications.api.HandlebarsApplicationMixin(
    foundry.applications.sheets.ActorSheetV2<
        ActorPTR2e,
        foundry.applications.api.HandlebarsDocumentSheetConfiguration<ActorPTR2e>
    >
) {
    static override DEFAULT_OPTIONS = fu.mergeObject(
        super.DEFAULT_OPTIONS,
        {
            classes: ["ptr2e", "sheet", "actor", "v2"],
            position: {
                width: 900,
                height: 660,
            },
            window: {
                resizable: true,
            },
            form: {
                submitOnChange: true,
            },
            actions: {
                "species-header": async function(this: ActorSheetPTRV2, event: Event) {
                    event.preventDefault();
                    const species = this.actor.system.species!;
                    const sheet = new SpeciesDropSheet((item) => {
                        if (!item) return;
                        if (
                            !(
                                item instanceof CONFIG.Item.documentClass &&
                                item.system instanceof SpeciesSystemModel
                            )
                        )
                            return;
                        if (item.slug !== species.slug) {
                            const species = item.toObject().system;
                            species.slug ||= sluggify(item.name);
                            this.actor.update({ "system.species": species });
                        }
                    });
                    sheet.species = new CONFIG.Item.documentClass({
                        name: this.document.hasEmbeddedSpecies() ? Handlebars.helpers.formatSlug(species.slug) : this.actor.name,
                        type: "species",
                        img: this.actor.img,
                        flags: { ptr2e: { disabled: !this.actor.system._source.species } },
                        system: species.toObject(),
                    }) as SpeciesPTR2e;
                    sheet.render(true);
                },
                "open-perk-web": function(this: ActorSheetPTRV2, _event: Event) {
                    game.ptr.web.open(this.actor);
                }
            }
        },
        { inplace: false }
    );

    static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
        header: {
            id: "header",
            template: "systems/ptr2e/templates/actor/actor-header.hbs",
        },
        nav: {
            id: "nav",
            template: "systems/ptr2e/templates/actor/actor-nav.hbs",
        },
        sidebar: {
            id: "sidebar",
            template: "systems/ptr2e/templates/actor/actor-sidebar.hbs",
        },
        overview: {
            id: "overview",
            template: "systems/ptr2e/templates/actor/actor-overview.hbs",
        },
        actions: {
            id: "actions",
            template: "systems/ptr2e/templates/actor/actor-actions.hbs",
        },
        inventory: {
            id: "inventory",
            template: "systems/ptr2e/templates/actor/actor-inventory.hbs",
        },
        clocks: {
            id: "clocks",
            template: "systems/ptr2e/templates/actor/actor-clocks.hbs",
        },
        perks: {
            id: "perks",
            template: "systems/ptr2e/templates/actor/actor-perks.hbs",
        },
        biography: {
            id: "biography",
            template: "systems/ptr2e/templates/actor/actor-biography.hbs",
        },
        effects: {
            id: "effects",
            template: "systems/ptr2e/templates/actor/actor-effects.hbs",
        },
    };

    tabGroups: Record<string, string> = {
        sheet: "overview",
    };

    tabs: Record<string, Tab> = {
        overview: {
            id: "overview",
            group: "sheet",
            icon: "fa-solid fa-house",
            label: "PTR2E.ActorSheet.Tabs.overview.label",
        },
        actions: {
            id: "actions",
            group: "sheet",
            icon: "fa-solid fa-burst",
            label: "PTR2E.ActorSheet.Tabs.actions.label",
        },
        inventory: {
            id: "inventory",
            group: "sheet",
            icon: "fa-solid fa-suitcase",
            label: "PTR2E.ActorSheet.Tabs.inventory.label",
        },
        clocks: {
            id: "clocks",
            group: "sheet",
            icon: "fa-solid fa-clock",
            label: "PTR2E.ActorSheet.Tabs.clocks.label",
        },
        perks: {
            id: "perks",
            group: "sheet",
            icon: "fa-solid fa-crown",
            label: "PTR2E.ActorSheet.Tabs.perks.label",
        },
        biography: {
            id: "biography",
            group: "sheet",
            icon: "fa-solid fa-book-open",
            label: "PTR2E.ActorSheet.Tabs.biography.label",
        },
        effects: {
            id: "effects",
            group: "sheet",
            icon: "fa-solid fa-star",
            label: "PTR2E.ActorSheet.Tabs.effects.label",
        },
    };

    _getTabs() {
        for (const v of Object.values(this.tabs)) {
            v.active = this.tabGroups[v.group] === v.id;
            v.cssClass = v.active ? "active" : "";
        }
        return this.tabs;
    }

    override async _prepareContext(options?: foundry.applications.api.HandlebarsDocumentSheetConfiguration<ActorPTR2e>){
        const context = await super._prepareContext(options) as Record<string, unknown>;

        context.actor = this.actor;
        context.source = this.actor._source;
        context.fields = this.actor.system.schema.fields;
        context.baseFields = this.actor.schema.fields;
        context.tabs = this._getTabs();

        return context;
    }

    override _attachPartListeners(partId: string, htmlElement: HTMLElement, options: foundry.applications.api.HandlebarsRenderOptions): void {
        super._attachPartListeners(partId, htmlElement, options);

        
    }

    override async close(options: Partial<foundry.applications.api.ApplicationClosingOptions> = {}): Promise<this> {
        if(game.ptr.web.actor === this.actor) {
            this.minimize();
            return this;
        }
        return super.close(options) as Promise<this>;
    }

    override async _renderFrame(options: foundry.applications.api.HandlebarsDocumentSheetConfiguration<ActorPTR2e>): Promise<HTMLElement> {
        const frame = await super._renderFrame(options);

        // Add Species button to the header
        const speciesLabel = game.i18n.localize("PTR2E.ActorSheet.Species");
        const speciesButton = `<button type="button" class="header-control fa-solid fa-paw" data-action="species-header"
                                    data-tooltip="${speciesLabel}" aria-label="${speciesLabel}"></button>`;
        this.window.close.insertAdjacentHTML("beforebegin", speciesButton);

        return frame;
    }
}

export default ActorSheetPTRV2;