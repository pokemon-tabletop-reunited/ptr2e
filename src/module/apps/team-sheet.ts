import { ActorPTR2e, ActorSystemPTR2e } from "@actor";
import { Tab } from "@item/sheets/document.ts";
import FolderPTR2e from "@module/folder/document.ts";

class TeamSheetPTR2e extends foundry.applications.api.HandlebarsApplicationMixin(
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
            classes: ["sheet", "team-sheet"],
            position: {
                height: 600,
                width: 450,
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
            template: "/systems/ptr2e/templates/apps/team/overview.hbs",
            scrollable: [".scroll"]
        },
        party: {
            id: "party",
            template: "/systems/ptr2e/templates/apps/team/party.hbs",
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
            label: "PTR2E.TeamSheet.Tabs.overview.label",
        },
        party: {
            id: "party",
            group: "sheet",
            icon: "fa-solid fa-cogs",
            label: "PTR2E.TeamSheet.Tabs.party.label",
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
        return `${this.folder.name} - Team Sheet`;
    }

    override _initializeApplicationOptions(options: Partial<foundry.applications.api.ApplicationConfiguration> & {folder?: FolderPTR2e<ActorPTR2e<ActorSystemPTR2e, null>>}): foundry.applications.api.ApplicationConfiguration {
        options = super._initializeApplicationOptions(options);
        options.uniqueId = `${this.constructor.name}-${options.folder?.uuid}`;
        return options as foundry.applications.api.ApplicationConfiguration;
    }

    override async _prepareContext() {
        const team = [];
        for(const memberUuid of this.folder.team) {
            const actor = await fromUuid(memberUuid);
            if(actor && actor instanceof ActorPTR2e) {
                const party = [];
                if(actor.folder?.isFolderOwner(actor.uuid)) {
                    for(const partyMemberUuid of actor.folder.party) {
                        const partyMember = await fromUuid(partyMemberUuid);
                        if(partyMember) party.push(partyMember);
                    }
                }
                team.push({actor, party, folder: actor.folder});
            }
        }


        return {
            tabs: this._getTabs(),
            team,
            folder: this.folder
        }
    }

    override _attachPartListeners(partId: string, htmlElement: HTMLElement, options: foundry.applications.api.HandlebarsRenderOptions): void {
        super._attachPartListeners(partId, htmlElement, options);
        if (partId === "overview") {
            for(const member of htmlElement.querySelectorAll(".party-member")) {
                member.addEventListener("dblclick", this._onMemberClick.bind(this));
            }
            for(const member of htmlElement.querySelectorAll(".team-member > .thumbnail")) {
                member.addEventListener("dblclick", this._onMemberClick.bind(this));
            }
            for(const member of htmlElement.querySelectorAll(".team-member")) {
                member.addEventListener("dblclick", this._onTeamClick.bind(this));
            }
        }
    }

    _onMemberClick(event: Event) {
        event.stopPropagation();
        // event.stopImmediatePropagation();
        const actorId = (event.currentTarget as HTMLElement).dataset.actorId;
        if(actorId) {
            const actor = game.actors.get(actorId);
            if(actor) actor.sheet?.render(true);
        }
    }

    _onTeamClick(event: Event) {
        const folderId = (event.currentTarget as HTMLElement).dataset.folderId;
        if(folderId) {
            const folder = game.folders.get<FolderPTR2e>(folderId);
            if(folder) folder.renderPartySheet();
        }
    }
}

export default TeamSheetPTR2e;
