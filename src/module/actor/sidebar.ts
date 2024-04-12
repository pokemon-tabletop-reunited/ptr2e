import FolderPTR2e from "@module/folder/document.ts";
import ActorPTR2e from "./base.ts";
import ActorSystemPTR2e from "./data/system.ts";
import FolderConfigPTR2e from "@module/folder/sheet.ts";

export default class ActorDirectoryPTR2e<
    TActor extends ActorPTR2e<ActorSystemPTR2e, null>,
> extends ActorDirectory<TActor> {
    static override entryPartial: string =
        "systems/ptr2e/templates/actor/actor-directory-entry.hbs";

    static override folderPartial: string =
        "systems/ptr2e/templates/actor/actor-directory-folder.hbs";

    static override get defaultOptions() {
        return foundry.utils.mergeObject(
            super.defaultOptions,
            {
                template: "systems/ptr2e/templates/actor/actor-directory.hbs",
                dragDrop: [
                    {
                        dragSelector: ".directory-item.actor, .directory-item.folder",
                        dropSelector: ".directory-list",
                    },
                ],
            },
            { inplace: false }
        );
    }

    override _getFolderContextOptions() {
        const options = super._getFolderContextOptions();
        const option = options.find((o) => o.name === "FOLDER.Edit");
        if (option) {
            option.callback = async (header) => {
                const li = header.closest(".directory-item")[0];
                const folder = await fromUuid(li.dataset.uuid);
                const r = li.getBoundingClientRect();
                const context = {
                    document: folder!,
                    position: {
                        top: r.top,
                        left: r.left - FolderConfigPTR2e.DEFAULT_OPTIONS.position.width - 10,
                    },
                };
                new FolderConfigPTR2e(context).render(true);
            };
        }
        return options;
    }

    override async getData(options?: Partial<ApplicationOptions> | undefined): Promise<object> {
        const data = await super.getData(options);

        if ("tree" in data && data.tree) {
            const tree = data.tree as Tree;
            const team: EnfolderableDocument[] = [];
            const teamIds: string[] = [];

            function recurse(tree: Tree) {
                if (tree.folder?.team?.length && teamIds.length === 0) {
                    teamIds.push(...tree.folder.team);
                }

                for (const child of tree.children) {
                    if (child.visible) {
                        recurse(child);
                    }
                }
                if (teamIds.length) {
                    team.push(...tree.entries.filter((entry) => teamIds.includes(entry.uuid)));
                }
                if (tree.folder?.owner) {
                    const owner = tree.entries.find((entry) => entry.uuid === tree.folder.owner);
                    if (owner) {
                        tree.entries = tree.entries.filter((entry) => entry !== owner);
                        tree.owner = owner;
                    }
                }
                if (tree.folder?.party) {
                    const party = tree.entries.filter((entry) =>
                        tree.folder.party.includes(entry.uuid)
                    );
                    tree.entries = tree.entries.filter((entry) => !party.includes(entry));
                    tree.party = party;
                } else {
                    tree.party = [];
                }

                if (team.length && tree.folder?.team?.length) {
                    // TODO: Decide if this view should be shown or not, disabled for now
                    if (false) tree.team = team;
                    else tree.team = true;
                }
            }
            recurse(tree);
        }

        return data;
    }

    override activateListeners(html: JQuery): void {
        super.activateListeners(html);

        html.find(".open-party").on("click", this._openParty.bind(this));
        html.find(".open-team").on("click", this._openTeam.bind(this));
    }

    protected _openParty(event: JQuery.ClickEvent) {
        event.preventDefault();
        event.stopPropagation();

        const button = event.currentTarget as HTMLAnchorElement;
        const li = button.closest<HTMLLIElement>("li.directory-item");
        const folderId = li?.dataset.folderId;
        if (!folderId) return;

        const folder = game.folders.get<FolderPTR2e>(folderId);
        return folder?.renderPartySheet();
    }

    protected _openTeam(event: JQuery.ClickEvent) {
        event.preventDefault();
        event.stopPropagation();

        const button = event.currentTarget as HTMLAnchorElement;
        const li = button.closest<HTMLLIElement>("li.directory-item");
        const folderId = li?.dataset.folderId;
        if (!folderId) return;

        const folder = game.folders.get<FolderPTR2e>(folderId);
        return folder?.renderTeamSheet();
    }

    /**
     * Create a new Folder in this SidebarDirectory
     * @param {PointerEvent} event    The originating button click event
     * @protected
     */
    protected override _onCreateFolder(event: PointerEvent) {
        event.preventDefault();
        event.stopPropagation();
        const button = event.currentTarget as HTMLElement;
        const li = button.closest<HTMLElement>(".directory-item");
        const data = { folder: li?.dataset?.folderId || null, type: this.entryType };
        const options: {
            top: number;
            left: number;
            pack?: string;
        } = {
            top: button.offsetTop,
            left: window.innerWidth - 310 - FolderConfigPTR2e.DEFAULT_OPTIONS.position.width,
        };
        if (this.collection instanceof CompendiumCollection)
            options.pack = this.collection.collection;
        FolderPTR2e.createDialog(data, options);
    }

    protected override async _handleDroppedEntry(
        target: HTMLElement,
        data: DropCanvasData<string, object>
    ): Promise<void> {
        const { uuid, type } = data;
        // If the dropped data is not an Actor, defer to the parent class
        if (!uuid || type != "Actor") return super._handleDroppedEntry(target, data);

        // Get target Folder Document
        const closestFolder = target?.closest<HTMLElement>(".folder");
        const targetFolder = await fromUuid<FolderPTR2e<TActor>>(closestFolder?.dataset.uuid);

        // If the dropped Actor is already in the target Folder, do nothing
        if (targetFolder?.isFolderOwner(uuid)) {
            return;
        }

        // Get the Actor Document
        const actor = await fromUuid<TActor>(uuid);
        if (!actor) return super._handleDroppedEntry(target, data);

        // Get the folder the Actor is currently in
        const currentFolder = await (async () => {
            if (typeof actor.folder === "string") {
                return await fromUuid<FolderPTR2e<TActor>>(actor.folder);
            }
            if (actor.folder instanceof FolderPTR2e) {
                return actor.folder;
            }
            return null;
        })();

        // If the Actor is the owner of the current Folder, do not allow it to be moved at all
        if (currentFolder?.isFolderOwner(uuid)) {
            console.warn("Cannot move a Party Owner to another folder.");
            return;
        }
        // If the Actor is already part of a party, remove them from that party
        if (currentFolder?.isInParty(uuid)) {
            if (
                currentFolder.id === targetFolder?.id &&
                (target?.classList.contains("party") || target?.classList.contains("owner"))
            ) {
                return super._handleDroppedEntry(target, data);
            }

            await actor.update({ folder: null });

            const update = currentFolder.party.filter((member) => member !== uuid);
            await currentFolder.setFlag("ptr2e", "party", update);
        }

        // If the target was the owner of a Party, add the Actor to that Party
        if (target?.classList.contains("party") || target?.classList.contains("owner")) {
            if (!targetFolder) return;

            await actor.update({ folder: targetFolder.id });

            const update = targetFolder.party.concat(uuid);
            await targetFolder.setFlag("ptr2e", "party", update);
            return;
        }

        return super._handleDroppedEntry(target, data);
    }
}

type Tree<TDocument extends EnfolderableDocument = EnfolderableDocument> = {
    owner: TDocument | null;
    party: Array<TDocument>;
    team: Array<TDocument> | boolean;
    children: Array<Tree>;
    entries: Array<TDocument>;
    folder: FolderPTR2e;
    depth: number;
    root: boolean;
    visible: boolean;
};
