import FolderConfigPTR2e from "@module/folder/sheet.ts";

export default class ActorDirectoryPTR2e extends ActorDirectory {
  static override entryPartial =
    "systems/ptr2e/templates/sidebar/actor-directory-entry.hbs";

  static override folderPartial =
    "systems/ptr2e/templates/sidebar/actor-directory-folder.hbs";

  static override get defaultOptions() {
    return foundry.utils.mergeObject(
      super.defaultOptions,
      {
        template: "systems/ptr2e/templates/sidebar/actor-directory.hbs",
        dragDrop: [
          {
            dragSelector: ".directory-item.actor, .directory-item.folder",
            dropSelector: ".directory-list",
          },
        ],
      },
      { inplace: false }
    ) as DocumentDirectoryOptions;
  }

  override _getFolderContextOptions() {
    const options = super._getFolderContextOptions();
    const option = options.find((o) => o.name === "FOLDER.Edit");
    if (option) {
      option.callback = async (header) => {
        const li = header.closest(".directory-item")[0];
        const folder = await fromUuid<Folder.ConfiguredInstance>(li.dataset.uuid as FolderUUID);
        const r = li.getBoundingClientRect();
        const context = {
          document: folder!,
          position: {
            top: r.top,
            left: r.left - CONFIG.PTR.Folder.sheetClasses.folder.DEFAULT_OPTIONS.position.width - 10,
          },
        };
        new CONFIG.PTR.Folder.sheetClasses.folder(context).render(true);
      };
    }
    return options;
  }

  override async getData(options?: Partial<DocumentDirectoryOptions> | undefined): Promise<object> {
    const data = await super.getData(options);

    if ("tree" in data && data.tree) {
      const tree = data.tree as Tree;
      const team: FolderableDocuments[] = [];
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
          tree.team = true;
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

    const folder = game.folders.get(folderId);
    return folder?.renderPartySheet();
  }

  protected _openTeam(event: JQuery.ClickEvent) {
    event.preventDefault();
    event.stopPropagation();

    const button = event.currentTarget as HTMLAnchorElement;
    const li = button.closest<HTMLLIElement>("li.directory-item");
    const folderId = li?.dataset.folderId;
    if (!folderId) return;

    const folder = game.folders.get(folderId);
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
    const data = { folder: li?.dataset?.folderId || null, type: this.entryType as Folder.TypeNames };
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
    CONFIG.Folder.documentClass.createDialog(data, options);
  }

  protected override async _handleDroppedEntry(
    target: HTMLElement,
    data: TokenLayer.DropData & { targetFolderUuid?: string, noParty?: boolean }
  ): Promise<void> {
    const { uuid, type, targetFolderUuid, noParty} = data;
    // If the dropped data is not an Actor, defer to the parent class
    if (!uuid || type != "Actor") return super._handleDroppedEntry(target, data);

    // Get target Folder Document
    const closestFolder = target?.closest<HTMLElement>(".folder");
    const targetFolder = await fromUuid<Folder.ConfiguredInstance>((closestFolder?.dataset.uuid ?? targetFolderUuid) as FolderUUID);

    // If the dropped Actor is already in the target Folder, do nothing
    if (targetFolder?.isFolderOwner(uuid)) {
      return;
    }

    // Get the Actor Document
    const actor = await fromUuid<Actor.ConfiguredInstance>(uuid as ActorUUID);
    if (!actor) return super._handleDroppedEntry(target, data);

    const party = actor.system.party;
    // If the Actor is the owner of the current Folder, do not allow it to be moved at all
    if (party.ownerOf) {
      ui.notifications.error("Cannot move a Party Owner to another folder.");
      return;
    }

    // Prepare update data
    const update = {
      folder: targetFolder?.id,
    } as Record<string, unknown>;

    // If the target Folder is a party, update the party membership
    if(targetFolder && noParty !== true && targetFolder.owner) {
      update["system.party.partyMemberOf"] = targetFolder.id;

      const user = game.users.find((user) => user.character?.uuid === targetFolder.owner);
      if(user) {
        update['ownership'] = {[user.id]: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER, default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER};
      }
      else if(game.user.isGM) {
        update["ownership"] = Object.keys(actor.ownership).reduce((acc, key) => ({ ...acc, [key]: CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE }), {});
      }
    }
    else {
      update["system.party.partyMemberOf"] = undefined;

      if(!targetFolder && game.user.isGM) {
        update["ownership"] = Object.keys(actor.ownership).reduce((acc, key) => ({ ...acc, [key]: CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE }), {});
      }
    }

    await actor.update(update);
    // If this is coming from the party sheet through a player account, don't handle the drop twice
    if(targetFolderUuid && !target) return;

    return super._handleDroppedEntry(target, data);
  }
}

interface Tree<TDocument extends FolderableDocuments = FolderableDocuments> {
  owner: TDocument | null;
  party: TDocument[];
  team: TDocument[] | boolean;
  children: Tree[];
  entries: TDocument[];
  folder: Folder.ConfiguredInstance;
  depth: number;
  root: boolean;
  visible: boolean;
}