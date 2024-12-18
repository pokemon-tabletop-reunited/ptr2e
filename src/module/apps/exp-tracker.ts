import { ApplicationConfigurationExpanded, ApplicationV2Expanded } from "./appv2-expanded.ts";
import { HandlebarsRenderOptions } from "types/foundry/common/applications/handlebars-application.ts";
import { Tab } from "@item/sheets/document.ts";
import { ActorPTR2e } from "@actor";
import { ActiveEffectPTR2e } from "@effects";

export class EXPTracker extends foundry.applications.api.HandlebarsApplicationMixin(ApplicationV2Expanded) {
  static override DEFAULT_OPTIONS = fu.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      tag: "form",
      classes: ["sheet", "exp-tracker", "default-sheet"],
      position: {
        height: 680,
        width: 565,
      },
      window: {
        title: "PTR2E.ExpTracker.title",
        minimizable: true,
        resizable: true,
      },
      // dragDrop: [{ dragSelector: null, dropSelector: '.window-content' }],
      actions: {}
    },
    { inplace: false }
  );

  tabGroups: Record<string, string> = {
    sheet: "venture",
  };

  tabs: Record<string, Tab> = {
    venture: {
      id: "venture",
      group: "sheet",
      icon: "fa-solid fa-house",
      label: "PTR2E.ExpTracker.Tabs.venture.label",
    },
    training: {
      id: "training",
      group: "sheet",
      icon: "fa-solid fa-book",
      label: "PTR2E.ExpTracker.Tabs.training.label",
    }
  }

  static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
    tabs: {
      id: "tabs",
      template: "systems/ptr2e/templates/items/parts/item-tabs.hbs",
    },
    venture: {
      id: "venture",
      template: "systems/ptr2e/templates/apps/exp-tracker-venture.hbs",
      scrollable: [".scroll"],
    },
    training: {
      id: "training",
      template: "systems/ptr2e/templates/apps/exp-tracker-training.hbs",
      scrollable: [".scroll"],
    }
  };

  filter: SearchFilter;

  constructor(options?: Partial<ApplicationConfigurationExpanded>) {
    super(options);

    this.filter = new SearchFilter({
      inputSelector: "input[name='filter']",
      contentSelector: "nav.tutor-list-options",
      callback: this._onSearchFilter.bind(this),
    });
  }

  _getTabs() {
    for (const v of Object.values(this.tabs)) {
      v.active = this.tabGroups[v.group] === v.id;
      v.cssClass = v.active ? "active" : "";
    }
    return this.tabs;
  }

  override _prepareContext(options?: foundry.applications.api.HandlebarsRenderOptions | undefined) {
    const getBoxData = ((folder: Folder) => {
      const recursive = (subFolders: Folder[]): Folder[] => {
        return subFolders.flatMap(data => [data, ...recursive(data.getSubfolders())]);
      }

      const folders = [folder, ...recursive(folder.getSubfolders())];
      const entries = folders.flatMap(folder => folder.contents as unknown as ActorPTR2e[]).filter(a => !a.system.party.ownerOf).sort((a,b) => {
        if(a.system.party.partyMemberOf && b.system.party.partyMemberOf) {
          return a.folder!.sorting === "a"
            ? a.name.localeCompare(b.name)
            : a.sort - b.sort;
        }
        if(a.system.party.partyMemberOf) return -1;
        if(b.system.party.partyMemberOf) return 1;
        return a.folder!.sorting === "a"
            ? a.name.localeCompare(b.name)
            : a.sort - b.sort;
      })
      return {
        folders,
        entries: entries.map(entry => ({
          actor: entry,
          loafing: (entry).effects.get("loafingafflictio") as ActiveEffectPTR2e
        }))
      }
    });

    const pcs = game.users.contents.flatMap(user => user.character ?? []);
    const characters = pcs.reduce((acc, pc) => {
      // Check if anyone from this party has already been added
      const existing = acc.find(c => c.pc.folder?.id && c.pc.folder.id === pc.folder?.id);
      if (existing) {
        if (pc.system.party.ownerOf === existing.pc.folder!.id) {
          existing.pc = pc;
        }
        return acc;
      }

      acc.push({
        pc,
        data: pc.folder ? getBoxData(pc.folder) : { folders: [], entries: [] }
      });
      return acc;
    }, [] as { pc: ActorPTR2e, data: { folders: Folder[], entries: { actor: ActorPTR2e, loafing?: ActiveEffectPTR2e }[] } }[]);

    const apl = pcs.reduce((acc, pc, index, arr) => {
      acc += pc.level
      if (index === arr.length) {
        return Math.round(acc /= arr.length);
      }
      return acc;
    }, 0)

    const expMinimumApl = Math.max(0, Math.pow(apl, 3));
    const expNextLevel = Math.pow(apl + 1, 3);
    // Base Experience Reward == 25% of the experience required to reach the next level for the average party level
    const ber = Math.ceil((expNextLevel - expMinimumApl) * 0.25);

    // TODO: Add custom CM support
    const circumstanceGroups = CONFIG.PTR.data.circumstanceModifierGroups;

    return {
      ...super._prepareContext(options),
      characters,
      ber,
      tabs: this._getTabs(),
      circumstanceGroups
    }
  }

  override _attachPartListeners(partId: string, htmlElement: HTMLElement, options: HandlebarsRenderOptions): void {
    super._attachPartListeners(partId, htmlElement, options);

    if (partId === "venture") {
      this.filter.bind(this.element);
    }
  }

  _onSearchFilter(_event: KeyboardEvent, query: string, rgx: RegExp, html: HTMLElement) {
    // const visibleLists = new Set();
    // for (const entry of html.querySelectorAll<HTMLAnchorElement>("a.item.list-tab")) {
    //   if (!query) {
    //     entry.classList.remove("hidden");
    //     continue;
    //   }
    //   const slug = entry.dataset.tab;
    //   const match = (slug && rgx.test(SearchFilter.cleanQuery(slug)));
    //   entry.classList.toggle("hidden", !match);
    //   if (match) visibleLists.add(slug);
    // }

    // // Hide lists that don't match the query
    // if (!this.currentTab) {
    //   for (const section of this.element.querySelectorAll<HTMLElement>("main section.tutor-list")) {
    //     section.classList.toggle("hidden", !!query && !visibleLists.has(section.dataset.tab));
    //   }
    // }
  }

  override async _onDrop(event: DragEvent) {
    event.preventDefault();
    // const data: { uuid: string, type: string } = TextEditor.getDragEventData(event);
    // if (data.type !== "Actor" || !data.uuid) return;

    // const actor = await fromUuid<ActorPTR2e>(data.uuid);
    // if (!actor) return;
    // this.render({ actor, parts: ["aside", "list"] });
  }
}

export interface EXPTracker {
  constructor: typeof EXPTracker;
}