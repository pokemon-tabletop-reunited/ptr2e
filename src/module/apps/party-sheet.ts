import { ActorPTR2e, ActorSystemPTR2e } from "@actor";
import { Tab } from "@item/sheets/document.ts";
import FolderPTR2e from "@module/folder/document.ts";

class PartySheetPTR2e extends foundry.applications.api.HandlebarsApplicationMixin(
    foundry.applications.api.ApplicationV2
) {
    folder: FolderPTR2e<ActorPTR2e<ActorSystemPTR2e, null>>;

    constructor(
        options: Partial<foundry.applications.api.ApplicationConfiguration> & {folder?: FolderPTR2e<ActorPTR2e<ActorSystemPTR2e, null>>} = {}
    ) {
        if(!options.folder) throw new Error("No folder provided for party sheet");
        super(options);
        this.folder = options.folder;
    }

    static override DEFAULT_OPTIONS = fu.mergeObject(
        super.DEFAULT_OPTIONS,
        {
            id: "{id}",
            classes: ["sheet","party-sheet"],
            position: {
                height: 460,
                width: 528,
            },
        },
        { inplace: false }
    );

    static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
        tabs: {
            id: "tabs",
            template: "/systems/ptr2e/templates/items/parts/item-tabs.hbs",
        },
        overview: {
            id: "overview",
            template: "/systems/ptr2e/templates/apps/party/overview.hbs",
            scrollable: [".scroll"]
        },
        party: {
            id: "party",
            template: "/systems/ptr2e/templates/apps/party/party.hbs",
            scrollable: [".scroll"],
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
            label: "PTR2E.PartySheet.Tabs.overview.label",
        },
        party: {
            id: "party",
            group: "sheet",
            icon: "fa-solid fa-cogs",
            label: "PTR2E.PartySheet.Tabs.party.label",
        },
    };

    _getTabs() {
        for (const v of Object.values(this.tabs)) {
            v.active = this.tabGroups[v.group] === v.id;
            v.cssClass = v.active ? "active" : "";
        }
        return this.tabs;
    }

    override get title() {
        return `${this.folder.name} - Party Sheet`;
    }

    override _initializeApplicationOptions(options: Partial<foundry.applications.api.ApplicationConfiguration> & {folder?: FolderPTR2e<ActorPTR2e<ActorSystemPTR2e, null>>}): foundry.applications.api.ApplicationConfiguration {
        options = super._initializeApplicationOptions(options);
        options.uniqueId = `${this.constructor.name}-${options.folder?.uuid}`;
        return options as foundry.applications.api.ApplicationConfiguration;
    }

    override async _prepareContext() {
        
        const owner = this.folder.owner ? await fromUuid(this.folder.owner) : null;
        if(!owner) throw new Error("Owner not found for party sheet");

        const party = [];
        for(const memberUuid of this.folder.party) {
            const actor = await fromUuid(memberUuid);
            if(actor) party.push(actor);
        }


        return {
            tabs: this._getTabs(),
            owner,
            party,
            folder: this.folder
        }
    }

    override _attachPartListeners(partId: string, htmlElement: HTMLElement, options: foundry.applications.api.HandlebarsRenderOptions): void {
        super._attachPartListeners(partId, htmlElement, options);
        if (partId === "overview") {
            for(const member of htmlElement.querySelectorAll(".party-member")) {
                member.addEventListener("dblclick", this._onPartyMemberClick.bind(this));
            }
        }
    }

    _onPartyMemberClick(event: Event) {
        const actorId = (event.currentTarget as HTMLElement).dataset.actorId;
        if(actorId) {
            const actor = game.actors.get(actorId);
            if(actor) actor.sheet?.render(true);
        }
    }
}

export default PartySheetPTR2e;
