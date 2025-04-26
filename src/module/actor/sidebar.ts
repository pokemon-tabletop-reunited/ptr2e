import FolderPTR2e from "@module/folder/document.ts";
import ActorPTR2e from "./base.ts";
import ActorSystemPTR2e from "./data/system.ts";
import FolderConfigPTR2e from "@module/folder/sheet.ts";

export default class ActorDirectoryPTR2e<
  TActor extends ActorPTR2e<ActorSystemPTR2e, null>,
> extends foundry.applications.sidebar.tabs.ActorDirectory<TActor> {

  static DEFAULT_OPTIONS = {
    classes: ["ptr2e"],
    actions: {
      "open-team": ActorDirectoryPTR2e.#openTeam,
      "open-party": ActorDirectoryPTR2e.#openParty,
    }
  }

  //@ts-expect-error - Missing types for this function
  static override PARTS = fu.mergeObject(super.PARTS, {
    directory: {
      template: "systems/ptr2e/templates/sidebar/actor-directory.hbs"
    }
  }, { inplace: false });

  static _entryPartial =
    "systems/ptr2e/templates/sidebar/actor-directory-entry.hbs";

  static _folderPartial =
    "systems/ptr2e/templates/sidebar/actor-directory-folder.hbs";


  override _getFolderContextOptions() {
    const options = super._getFolderContextOptions();
    const option = options.find((o) => o.name === "FOLDER.Edit");
    if (option) {
      option.callback = async (header) => {
        const li = header.closest<HTMLElement>(".directory-item");
        if(!li) return;
        const folder = await fu.fromUuid(li.dataset.uuid);
        const r = li.getBoundingClientRect();
        const context = {
          document: folder!,
          position: {
            top: r.top,
            left: r.left - (FolderConfigPTR2e.DEFAULT_OPTIONS.position!.width as number) - 10,
          },
        };
        new FolderConfigPTR2e(context).render(true);
      };
    }
    return options;
  }

  async _prepareDirectoryContext(context: foundry.applications.api.ApplicationRenderContext, options: foundry.applications.api.HandlebarsRenderOptions) {
    // @ts-expect-error - Missing types for this function
    super._prepareDirectoryContext(context, options);

    if ("tree" in context && context.tree) {
      const tree = context.tree as Tree;
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
          tree.team = true;
        }
      }
      recurse(tree);
    }
  }

  static #openParty<
    TActor extends ActorPTR2e<ActorSystemPTR2e, null>,
  >(this: ActorDirectoryPTR2e<TActor>, event: PointerEvent, target: HTMLElement) {
    event.preventDefault();
    event.stopPropagation();

    const li = target.closest<HTMLLIElement>("li.directory-item");
    const folderId = li?.dataset.folderId;
    if (!folderId) return;

    const folder = game.folders.get<FolderPTR2e>(folderId);
    return folder?.renderPartySheet();
  }

  static #openTeam<
    TActor extends ActorPTR2e<ActorSystemPTR2e, null>,
  >(this: ActorDirectoryPTR2e<TActor>, event: PointerEvent, target: HTMLElement) {
    event.preventDefault();
    event.stopPropagation();

    const li = target.closest<HTMLLIElement>("li.directory-item");
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
  protected override _onCreateFolder(event: PointerEvent, target: HTMLElement): void {
    event.preventDefault();
    event.stopPropagation();
    const { folderId } = (target.closest(".directory-item") as HTMLElement)?.dataset ?? {};
    const data = { folder: folderId ?? null, type: this.documentName };
    const options: {
      top: number;
      left: number;
      pack?: string;
    } = {
      top: target.offsetTop,
      left: window.innerWidth - 310 - (FolderConfigPTR2e.DEFAULT_OPTIONS.position!.width as number),
    };
    const operation: {pack?: string} = {}
    if (this.collection instanceof CompendiumCollection)
      operation.pack = this.collection.collection;
    FolderPTR2e.createDialog(data, operation, options);
  }

  protected override async _handleDroppedEntry(
    target: HTMLElement,
    data: DropCanvasData<string, object> & { targetFolderUuid?: string, noParty?: boolean }
  ): Promise<void> {
    const { uuid, type, targetFolderUuid, noParty } = data;
    // If the dropped data is not an Actor, defer to the parent class
    if (!uuid || type != "Actor") return super._handleDroppedEntry(target, data);

    // Get target Folder Document
    const closestFolder = target?.closest<HTMLElement>(".folder");
    closestFolder?.classList.remove("droptarget");
    const targetFolder = await fu.fromUuid<FolderPTR2e<TActor>>(closestFolder?.dataset.uuid ?? targetFolderUuid);

    // If the dropped Actor is already in the target Folder, do nothing
    if (targetFolder?.isFolderOwner(uuid)) {
      return;
    }

    // Get the Actor Document
    const actor = await fu.fromUuid<TActor>(uuid);
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

    const oldParty = actor.system.party.partyMemberOf;
    // If the target Folder is a party, update the party membership
    if (targetFolder && noParty !== true && targetFolder.owner) {
      update["system.party.partyMemberOf"] = targetFolder.id;

      const user = game.users.find((user) => user.character?.uuid === targetFolder.owner);
      if (user) {
        update['ownership'] = { [user.id]: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER, default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER };
      }
      else if (game.user.isGM) {
        update["ownership"] = Object.keys(actor.ownership).reduce((acc, key) => ({ ...acc, [key]: CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE }), {});
      }
    }
    else {
      update["system.party.partyMemberOf"] = undefined;

      if (!targetFolder && game.user.isGM) {
        update["ownership"] = Object.keys(actor.ownership).reduce((acc, key) => ({ ...acc, [key]: CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE }), {});
      }
    }

    await actor.update(update);
    // If this is coming from the party sheet through a player account, don't handle the drop twice
    if (targetFolderUuid && !target) return;

    return super._handleDroppedEntry(target, data).then(() => {
      if (!targetFolder && !oldParty) return;

      if (targetFolder) {
        // Refresh actors in the party
        for (const actor of targetFolder.contents) {
          actor.reset();
        }
      }

      if (!oldParty) return;
      const oldFolder = game.folders.get(oldParty);
      if (!oldFolder) return;

      // Refresh actors in the old party
      for (const actor of oldFolder.contents) {
        actor.reset();
      }
    });
  }

  declare documentName: string;
}

interface Tree<TDocument extends EnfolderableDocument = EnfolderableDocument> {
  owner: TDocument | null;
  party: TDocument[];
  team: TDocument[] | boolean;
  children: Tree[];
  entries: TDocument[];
  folder: FolderPTR2e;
  depth: number;
  root: boolean;
  visible: boolean;
}