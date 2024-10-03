import { ActorPTR2e, ActorSystemPTR2e } from "@actor";
import { Tab } from "@item/sheets/document.ts";
import FolderPTR2e from "@module/folder/document.ts";
import {
  ApplicationConfigurationExpanded,
  ApplicationV2Expanded,
} from "./appv2-expanded.ts";
import FolderConfigPTR2e from "@module/folder/sheet.ts";

class PartySheetPTR2e extends foundry.applications.api.HandlebarsApplicationMixin(
  ApplicationV2Expanded
) {
  folder: FolderPTR2e<ActorPTR2e<ActorSystemPTR2e, null>>;

  constructor(
    options: Partial<ApplicationConfigurationExpanded> & { folder?: FolderPTR2e<ActorPTR2e<ActorSystemPTR2e, null>> } = {}
  ) {
    if (!options.folder) throw new Error("No folder provided for party sheet");
    super(options);
    this.folder = options.folder;
  }

  static override DEFAULT_OPTIONS = fu.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      id: "{id}",
      classes: ["sheet", "party-sheet"],
      position: {
        height: 465,
        width: 528,
      },
      window: {
        resizable: true,
      },
      dragDrop: [
        {
          dragSelector: ".tab[data-tab=party] .party-drag-item",
          dropSelector: ".tab[data-tab=party] article.party, .tab[data-tab=party] main.boxes"
        }
      ],
      scrollY: [".scroll"],
      actions: {
        "create-folder": function (this: PartySheetPTR2e, event: Event) {
          event.preventDefault();
          event.stopPropagation();
          const button = event.target as HTMLButtonElement;
          const rect = button.getBoundingClientRect();

          FolderPTR2e.createDialog({
            folder: this.folder.id,
            type: this.folder.type
          }, {
            top: rect.top + rect.height + 10,
            left: rect.left - Number(FolderConfig.defaultOptions.width) + rect.width,
          }).then((folder) => {
            if(folder instanceof FolderPTR2e) {
              //@ts-expect-error - App v1 compatability
              this.boundBoxes[folder.id] = folder;
              //@ts-expect-error - App v1 compatability
              folder.apps[this.id] = this;
              this.render({ parts: ["party"] });
            }
          });
        }
      }
    },
    { inplace: false }
  );

  static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
    tabs: {
      id: "tabs",
      template: "systems/ptr2e/templates/items/parts/item-tabs.hbs",
    },
    overview: {
      id: "overview",
      template: "systems/ptr2e/templates/apps/party/overview.hbs",
      scrollable: [".scroll"]
    },
    party: {
      id: "party",
      template: "systems/ptr2e/templates/apps/party/party.hbs",
      scrollable: ["main.boxes .content", "article.party .contents"],
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

  override _initializeApplicationOptions(options: Partial<ApplicationConfigurationExpanded> & { folder?: FolderPTR2e<ActorPTR2e<ActorSystemPTR2e, null>> }): ApplicationConfigurationExpanded {
    options = super._initializeApplicationOptions(options);
    options.uniqueId = `${this.constructor.name}-${options.folder?.uuid}`;
    return options as ApplicationConfigurationExpanded;
  }

  override async _prepareContext() {
    const owner = this.folder.owner ? await fromUuid(this.folder.owner) : null;
    if (!owner) throw new Error("Owner not found for party sheet");

    const party: ActorPTR2e[] = [];
    for (const memberUuid of this.folder.party) {
      const actor = await fromUuid<ActorPTR2e>(memberUuid);
      if (actor) party.push(actor);
    }

    const nonParty: ActorPTR2e[] = [];
    for(const actor of this.folder.contents) {
      if(actor === owner) continue;
      if(!party.includes(actor)) nonParty.push(actor);
    }

    const boxData = (() => {
      const recursive = (subFolders: Folder[]): Folder[] => {
        return subFolders.flatMap(data => [data, ...recursive(data.getSubfolders())]);
      }

      const folders = recursive(this.folder.getSubfolders())
      const entries = folders.flatMap(folder => folder.contents);
      return {
        folders,
        entries
      }
    })();

    return {
      tabs: this._getTabs(),
      owner,
      party: party.sort((a, b) => this.folder.sorting === "a" ? a.name.localeCompare(b.name) : a.sort - b.sort),
      folder: this.folder,
      boxData,
      disableButton: game.user.isGM ? false : game.settings.get("ptr2e", "player-folder-create-permission") === false,
      nonParty: nonParty.sort((a, b) => this.folder.sorting === "a" ? a.name.localeCompare(b.name) : a.sort - b.sort)
    }
  }

  override _attachPartListeners(partId: string, htmlElement: HTMLElement, options: foundry.applications.api.HandlebarsRenderOptions): void {
    super._attachPartListeners(partId, htmlElement, options);
    if (partId === "overview") {
      for (const member of htmlElement.querySelectorAll(".party-member")) {
        member.addEventListener("dblclick", this._onPartyMemberClick.bind(this));
      }
    }
    if (partId === "party") {
      for (const member of htmlElement.querySelectorAll(".party-drag-item")) {
        member.addEventListener("dblclick", this._onPartyMemberClick.bind(this));
      }

      ContextMenu.create(this, $(htmlElement), ".party-drag-item.box-header", this._getFolderContextOptions());
      ContextMenu.create(this, $(htmlElement), ".party-drag-item[data-actor-id]", this._getActorContextOptions());
    }
  }

  _getFolderContextOptions() {
    return [
      {
        name: "FOLDER.Edit",
        icon: '<i class="fas fa-edit"></i>',
        condition: true,
        callback: async (header: JQuery) => {
          const li = header.closest(".party-drag-item.box-header")[0];
          if(!li) return void console.warn("No directory item found for folder edit context menu option");
          const folder = game.folders.get(li.dataset.folderId);
          if(!folder) return;
          const r = li.getBoundingClientRect();
          const options = {top: r.top, left: r.left - Number(FolderConfig.defaultOptions.width) - 10};
          new FolderConfigPTR2e({
            document: folder,
            position: options
          }).render(true);
        }
      },
      {
        name: "FOLDER.CreateTable",
        icon: `<i class="${CONFIG.RollTable.sidebarIcon}"></i>`,
        condition: async (header: JQuery) => {
          const li = header.closest(".party-drag-item.box-header")[0];
          if(!li) return false;
          const folder = game.folders.get(li.dataset.folderId);
          if(!folder) return false;
          return CONST.COMPENDIUM_DOCUMENT_TYPES.includes(folder.type);
        },
        callback: async (header: JQuery) => {
          const li = header.closest(".party-drag-item.box-header")[0];
          if(!li) return false;
          const folder = game.folders.get(li.dataset.folderId);
          if(!folder) return;
          const r = li.getBoundingClientRect();
          // @ts-expect-error - This is valid
          return Dialog.confirm({
            title: `${game.i18n.localize("FOLDER.CreateTable")}: ${folder.name}`,
            content: game.i18n.localize("FOLDER.CreateTableConfirm"),
            yes: () => RollTable.fromFolder(folder),
            options: {
              top: r.top + r.height + 10,
              left: r.left,
              width: 360
            }
          });
        }
      },
      {
        name: "FOLDER.Remove",
        icon: '<i class="fas fa-trash"></i>',
        condition: game.user.isGM,
        callback: async (header: JQuery) => {
          const li = header.closest(".party-drag-item.box-header")[0];
          if(!li) return;
          const folder = game.folders.get(li.dataset.folderId);
          if(!folder) return;
          const r = li.getBoundingClientRect();
          // @ts-expect-error - This is valid
          return Dialog.confirm({
            title: `${game.i18n.localize("FOLDER.Remove")} ${folder.name}`,
            content: `<h4>${game.i18n.localize("AreYouSure")}</h4><p>${game.i18n.localize("FOLDER.RemoveWarning")}</p>`,
            yes: () => folder.delete({deleteSubfolders: false, deleteContents: false}),
            options: {
              top: r.top + r.height + 10,
              left: r.left,
              width: 400
            }
          });
        }
      },
      {
        name: "FOLDER.Delete",
        icon: '<i class="fas fa-dumpster"></i>',
        condition: game.user.isGM,
        callback: async (header: JQuery) => {
          const li = header.closest(".party-drag-item.box-header")[0];
          if(!li) return;
          const folder = game.folders.get(li.dataset.folderId);
          if(!folder) return;
          const r = li.getBoundingClientRect();
          // @ts-expect-error - This is valid
          return Dialog.confirm({
            title: `${game.i18n.localize("FOLDER.Delete")} ${folder.name}`,
            content: `<h4>${game.i18n.localize("AreYouSure")}</h4><p>${game.i18n.localize("FOLDER.DeleteWarning")}</p>`,
            yes: () => folder.delete({deleteSubfolders: true, deleteContents: true}),
            options: {
              top: r.top + r.height + 10,
              left: r.left,
              width: 400
            }
          });
        }
      },
      {
        name: "OWNERSHIP.Configure",
        icon: '<i class="fas fa-lock"></i>',
        condition: () => game.user.isGM,
        callback: async (header: JQuery) => {
          const li = header.closest(".party-drag-item.box-header")[0];
          if(!li) return;
          const folder = game.folders.get(li.dataset.folderId);
          // @ts-expect-error - Typing for this sheet is missing
          new DocumentOwnershipConfig(folder, {
            top: Math.min(li.offsetTop, window.innerHeight - 350),
            left: window.innerWidth - 720
          }).render(true);
        }
      },
      {
        name: "FOLDER.Export",
        icon: '<i class="fas fa-atlas"></i>',
        condition: (header: JQuery) => {
          const li = header.closest(".party-drag-item.box-header")[0];
          const folder = game.folders.get(li.dataset.folderId);
          if(!folder) return false;
          return CONST.COMPENDIUM_DOCUMENT_TYPES.includes(folder.type);
        },
        callback: async (header: JQuery) => {
          const li = header.closest(".party-drag-item.box-header")[0];
          if(!li) return;
          const folder = game.folders.get(li.dataset.folderId);
          if(!folder) return;
          return folder.exportDialog(null, {
            top: Math.min(li.offsetTop, window.innerHeight - 350),
            left: window.innerWidth - 720,
            width: 400
          });
        }
      }
    ] as unknown as ContextMenuEntry[];
  }

  _getActorContextOptions() {
    return [
      {
        name: "SIDEBAR.CharArt",
        icon: '<i class="fas fa-image"></i>',
        condition: (li: JQuery) => {
          const actor = game.actors.get(li.data("actorId"));
          return actor?.img !== CONST.DEFAULT_TOKEN;
        },
        callback: (li: JQuery) => {
          const actor = game.actors.get(li.data("actorId"));
          if(!actor) return;
          new ImagePopout(actor.img, {
            title: actor.name,
            uuid: actor.uuid
          }).render(true);
        }
      },
      {
        name: "SIDEBAR.TokenArt",
        icon: '<i class="fas fa-image"></i>',
        condition: (li: JQuery) => {
          const actor = game.actors.get(li.data("actorId"));
          if(!actor) return false;
          if ( actor.prototypeToken.randomImg ) return false; //@ts-expect-error - This is correct
          return ![null, undefined, CONST.DEFAULT_TOKEN].includes(actor.prototypeToken.texture.src);
        },
        callback: (li: JQuery) => {
          const actor = game.actors.get(li.data("actorId"));
          if(!actor) return;
          new ImagePopout(actor.prototypeToken.texture.src, {
            title: actor.name,
            uuid: actor.uuid
          }).render(true);
        }
      },
      {
        name: "OWNERSHIP.Configure",
        icon: '<i class="fas fa-lock"></i>',
        condition: () => game.user.isGM,
        callback: (header: JQuery) => {
          const li = header.closest(".party-drag-item");
          const document = ui.actors.collection.get(li.data("actorId"));
          // @ts-expect-error - Typing for this sheet is missing
          new DocumentOwnershipConfig(document, {
            top: Math.min(li[0].offsetTop, window.innerHeight - 350),
            left: window.innerWidth - 720
          }).render(true);
        }
      },
      {
        name: "SIDEBAR.Export",
        icon: '<i class="fas fa-file-export"></i>',
        condition: (header: JQuery) => {
          const li = header.closest(".party-drag-item");
          const document = ui.actors.collection.get(li.data("actorId"));
          return document?.isOwner;
        },
        callback: (header: JQuery) => {
          const li = header.closest(".party-drag-item");
          const document = ui.actors.collection.get(li.data("actorId"));
          return document?.exportToJSON();
        }
      },
      {
        name: "SIDEBAR.Import",
        icon: '<i class="fas fa-file-import"></i>',
        condition: (header: JQuery) => {
          const li = header.closest(".party-drag-item");
          const document = ui.actors.collection.get(li.data("actorId"));
          return document?.isOwner;
        },
        callback: (header: JQuery) => {
          const li = header.closest(".party-drag-item");
          const document = ui.actors.collection.get(li.data("actorId"));
          return document?.importFromJSONDialog();
        }
      },
      {
        name: "SIDEBAR.Delete",
        icon: '<i class="fas fa-trash"></i>',
        condition: () => game.user.isGM,
        callback: (header: JQuery) => {
          const li = header.closest(".party-drag-item");
          const entry = ui.actors.collection.get(li.data("actorId"));
          if ( !entry ) return;
          return entry.deleteDialog({
            top: Math.min(li[0].offsetTop, window.innerHeight - 350),
            left: window.innerWidth - 720
          });
        }
      },
      {
        name: "SIDEBAR.Duplicate",
        icon: '<i class="far fa-copy"></i>', //@ts-expect-error - Typing is missing
        condition: () => game.user.isGM || ui.actors.collection.documentClass.canUserCreate(game.user),
        callback: (header: JQuery) => {
          const li = header.closest(".party-drag-item");
          const original = ui.actors.collection.get(li.data("actorId"));
          return original?.clone({name: `${original._source.name} (Copy)`}, {save: true, addSource: true});
        }
      }
    ] as unknown as ContextMenuEntry[];
  }

  _onPartyMemberClick(event: Event) {
    const actorId = (event.currentTarget as HTMLElement).dataset.actorId;
    if (actorId) {
      const actor = game.actors.get(actorId);
      if (actor) actor.sheet?.render(true);
    }
  }

  get isOwner() {
    return !!(game.user.isGM || this.folder.ownerActor?.isOwner);
  }

  override _canDragStart(): boolean {
    return this.isOwner;
  }

  override _canDragDrop(): boolean {
    return this.isOwner;
  }

  override _onDragStart(event: DragEvent): void {
    const entry = event.currentTarget as HTMLElement;
    const { actorId, folderId } = entry.dataset;

    if (!actorId && !folderId) return;

    if (actorId) {
      const actor = game.actors.get(entry.dataset.actorId);
      if (!actor) return;

      // Create drag data
      const dragData = actor.toDragData();
      if (!dragData) return;

      // Set data transfer
      return void event.dataTransfer?.setData("text/plain", JSON.stringify(dragData));
    }

    if (folderId) {
      const folder = game.folders.get(folderId);
      if (!folder) return;

      // Create drag data
      const dragData = folder.toDragData();
      if (!dragData) return;

      // Set data transfer
      return void event.dataTransfer?.setData("text/plain", JSON.stringify(dragData));
    }
  }

  override async _onDrop(event: DragEvent) {
    const data = TextEditor.getDragEventData(event) as DropCanvasData;
    switch (data.type) {
      case "Folder": return this._onDropFolder(event, data);
      case "Actor": return this._onDropEntry(event, data);
    }
  }

  async _onDropFolder(event: DragEvent, data: DropCanvasData) {
    const folder = await FolderPTR2e.fromDropData(data);
    if (!folder || folder.type !== "Actor") return;

    const article = (event.target as HTMLElement).closest("[data-folder-id]") as HTMLElement;
    if(!article) return;

    if(article.dataset.folderId === 'party') {
      const currentFolderContents = folder.contents.filter(a => a.isOwner).map(actor => actor.id);
      const currentPartyContents = this.folder.party.map(uuid => fu.parseUuid(uuid).id).filter(id => !!id) as string[];
      const updates = [
        ...currentFolderContents.map(id => ({_id: id, "folder": this.folder.id, system: {party: { partyMemberOf: this.folder.id }}})),
        ...currentPartyContents.map(id => ({_id: id, "folder": folder.id, system: {party: { partyMemberOf: null }}}))
      ]
      await ActorPTR2e.updateDocuments(updates);
      return void await this.render({ parts: ["party"] });
    }

    const targetFolder =game.folders.get(article.dataset.folderId) as Maybe<FolderPTR2e<ActorPTR2e<ActorSystemPTR2e, null>>>;
    if (!targetFolder || targetFolder.type !== "Actor") return;

    const target = ui.actors.element.find(`[data-folder-id="${targetFolder.id}"]`);
    
    //@ts-expect-error - Accessing protected member
    await (target.length ? ui.actors._handleDroppedFolder(target[0], data) : ui.actors._handleDroppedFolder(null, {...data, targetFolderUuid: folder.uuid}));

    if(game.user.isGM && folder.contents.length) {
      const user = this.folder.userFromAvatarIfOwner;
      if(user) {
        const updates = [];
        for(const actor of folder.contents as unknown as ActorPTR2e[]) {
          if(actor.ownership[user.id!] !== CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) {
            updates.push({_id: actor.id, "ownership": {[user.id!]: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER, default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER} });
          }
        }
        if(updates.length) {
          await ActorPTR2e.updateDocuments(updates);
        }
      }
    }

    return void await this.render({ parts: ["party"] });
  }

  async _onDropEntry(event: DragEvent, data: DropCanvasData) {
    const actor = await ActorPTR2e.fromDropData(data);
    if (!actor) return;

    const targetActor = game.actors.get(((event.target as HTMLElement)?.closest(".party-drag-item") as HTMLElement)?.dataset?.actorId);

    const article = (event.target as HTMLElement).closest("article[data-folder-id], main[data-folder-id]") as HTMLElement;
    if(!article) return;

    const folderId = article.dataset.folderId;
    if (folderId === 'party') {
      const target = ui.actors.element.find(targetActor ? `[data-entry-id="${targetActor.id}"]` : `[data-folder-id="${this.folder.id}"]`)

      //@ts-expect-error - Accessing protected member
      await (target.length ? ui.actors._handleDroppedEntry(target[0], data) : ui.actors._handleDroppedEntry(null, {...data, targetFolderUuid: this.folder.uuid}));
    }
    else {
      const folder = game.folders.get(folderId) as FolderPTR2e<ActorPTR2e<ActorSystemPTR2e, null>>;
      if (!folder) return;

      const target = ui.actors.element.find(targetActor ? `[data-entry-id="${targetActor.id}"]` : `[data-folder-id="${folder.id}"]`);

      
      await (
        target.length //@ts-expect-error - Accessing protected member
        ? ui.actors._handleDroppedEntry(target[0], {...data, noParty: folderId === this.folder.id}) //@ts-expect-error - Accessing protected member
        : ui.actors._handleDroppedEntry(null, {...data, targetFolderUuid: folder.uuid, noParty: folderId === this.folder.id})
      );
    
      if(game.user.isGM) {
        const user = this.folder.userFromAvatarIfOwner;
        if(user && actor.ownership[user.id!] !== CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) {
          await actor.update({ "ownership": {[user.id!]: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER, default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER} });
        }
      }
    }

    return void await this.render({ parts: ["party"] });
  }

  boundBoxes: Record<string, FolderPTR2e<ActorPTR2e<ActorSystemPTR2e, null>>> = {};

  /** @override */
  override _onFirstRender(context: foundry.applications.api.ApplicationRenderContext) {
    if ('boxData' in context && context.boxData && typeof context.boxData === 'object' && 'folders' in context.boxData) {
      for (const folder of context.boxData.folders as FolderPTR2e<ActorPTR2e<ActorSystemPTR2e, null>>[]) {
        //@ts-expect-error - App v1 compatability
        folder.apps[this.id] = this;
        this.boundBoxes[folder.id] = folder;
      }
    }
  }

  /* -------------------------------------------- */

  /** @override */
  override _onClose() {
    for (const folder of Object.values(this.boundBoxes)) {
      //@ts-expect-error  - App v1 compatability
      delete folder.apps[this.id];
      delete this.boundBoxes[folder.id];
    }
  }
}

export default PartySheetPTR2e;
