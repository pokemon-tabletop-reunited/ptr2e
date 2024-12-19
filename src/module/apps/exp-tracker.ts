import { ApplicationConfigurationExpanded, ApplicationV2Expanded } from "./appv2-expanded.ts";
import { HandlebarsRenderOptions } from "types/foundry/common/applications/handlebars-application.ts";
import { Tab } from "@item/sheets/document.ts";
import { ActorPTR2e } from "@actor";
import { ActiveEffectPTR2e } from "@effects";
import { sluggify } from "@utils";

export class EXPTracker extends foundry.applications.api.HandlebarsApplicationMixin(ApplicationV2Expanded) {
  static override DEFAULT_OPTIONS = fu.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      id: "exp-tracker",
      tag: "form",
      classes: ["sheet", "exp-tracker", "default-sheet"],
      position: {
        height: 750,
        width: 565,
      },
      window: {
        title: "PTR2E.ExpTracker.title",
        minimizable: true,
        resizable: true,
      },
      // dragDrop: [{ dragSelector: null, dropSelector: '.window-content' }],
      actions: {
        "add-modifier": async function (this: EXPTracker) {
          const labelInput = this.element.querySelector<HTMLInputElement>("input[name='customName']");
          const valueInput = this.element.querySelector<HTMLInputElement>("input[name='customValue']");
          if (!labelInput || !valueInput) return;

          const label = labelInput.value;
          const value = parseInt(valueInput.value);
          if (!label || !value) return;

          return game.settings.get("ptr2e", "expTrackerData").add(sluggify(label), label, value).then(() => this.render({ parts: ["venture"] }));
        },
        "delete-modifier": async function (this: EXPTracker, event: MouseEvent) {
          const id = (event.target as HTMLElement).dataset.modifier;
          if (!id) return;
          return game.settings.get("ptr2e", "expTrackerData").remove(id).then(() => this.render({ parts: ["venture"] }));
        },
        "apply-exp": async function (this: EXPTracker, event: MouseEvent) {
          if (!game.user?.isGM) return;

          const button = (event.target as HTMLButtonElement);
          if (!button) return;
          button.disabled = true;
          button.classList.add("disabled");
          ui.notifications.info("Applying exp...");

          const { total, cmsPercent } = this.prepareModifiers();
          const characters = this.characters;

          const { updates, messages, undoData } = characters.reduce((acc, character) => {
            const newTotal = character.system.advancement.experience.current + total;
            const levelUp = character.system.advancement.experience.next <= newTotal;
            acc.undoData.push({ _id: character.id, "system.advancement.experience.current": character.system.advancement.experience.current });
            acc.updates.push({
              _id: character.id,
              "system.advancement.experience.current": newTotal
            });
            acc.messages.push({ link: character.link, new: newTotal, old: character.system.advancement.experience.current, levelUp });
            return acc;
          }, {
            undoData: [],
            updates: [],
            messages: []
          } as Record<string, Record<string, unknown>[]>);

          await ActorPTR2e.updateDocuments(updates);
          await game.settings.set("ptr2e", "expTrackerData", { custom: game.settings.get("ptr2e", "expTrackerData").custom.map(c => ({ ...c, checked: false })) });
          await ChatMessage.create({
            content: await renderTemplate("systems/ptr2e/templates/chat/exp-tracker.hbs", { messages, total, percent: cmsPercent }),
            speaker: ChatMessage.getSpeaker({ alias: game.i18n.localize("PTR2E.ExpTracker.title") }),
            flags: {
              ptr2e: {
                undoData
              }
            },
          })

          await this.render({ parts: ["venture", "footer"] });
        }
      }
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
    },
    footer: {
      id: "footer",
      template: "systems/ptr2e/templates/apps/exp-tracker-footer.hbs"
    }
  };

  filter: SearchFilter;

  constructor(options?: Partial<ApplicationConfigurationExpanded>) {
    super(options);

    this.filter = new SearchFilter({
      inputSelector: "input[name='filter']",
      contentSelector: "fieldset.cms",
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

  private ber: number;
  private characters: ActorPTR2e[] = [];

  override _prepareContext(options?: foundry.applications.api.HandlebarsRenderOptions | undefined) {
    const getBoxData = ((folder: Folder) => {
      const recursive = (subFolders: Folder[]): Folder[] => {
        return subFolders.flatMap(data => [data, ...recursive(data.getSubfolders())]);
      }

      const folders = [folder, ...recursive(folder.getSubfolders())];
      const entries = folders.flatMap(folder => folder.contents as unknown as ActorPTR2e[]).filter(a => !a.system.party.ownerOf).sort((a, b) => {
        if (a.system.party.partyMemberOf && b.system.party.partyMemberOf) {
          return a.folder!.sorting === "a"
            ? a.name.localeCompare(b.name)
            : a.sort - b.sort;
        }
        if (a.system.party.partyMemberOf) return -1;
        if (b.system.party.partyMemberOf) return 1;
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
      if (index === arr.length - 1) {
        return Math.round(acc / arr.length);
      }
      return acc;
    }, 0)

    const expMinimumApl = Math.max(0, Math.pow(apl, 3));
    const expNextLevel = Math.pow(apl + 1, 3);
    // Base Experience Reward == 25% of the experience required to reach the next level for the average party level
    const ber = this.ber = Math.ceil((expNextLevel - expMinimumApl) * 0.25);

    const { circumstanceGroups, cmsPercent, total } = this.prepareModifiers();

    this.characters = characters.reduce((acc, { pc, data }) => {
      acc.push(pc, ...data.entries.flatMap(entry => entry.loafing ? [] : entry.actor));
      return acc;
    }, [] as ActorPTR2e[]);

    return {
      ...super._prepareContext(options),
      characters,
      ber,
      tabs: this._getTabs(),
      circumstanceGroups,
      cmsPercent,
      total
    }
  }

  prepareModifiers() {
    const circumstanceGroups = fu.duplicate(CONFIG.PTR.data.circumstanceModifierGroups);
    const setting = game.settings.get("ptr2e", "expTrackerData");
    for (const group in circumstanceGroups) {
      const modifiers = circumstanceGroups[group as keyof typeof circumstanceGroups].modifiers;
      for (const mod of modifiers) {
        mod.checked = setting.get(mod.name)?.checked ?? mod.checked;
      }
    }
    circumstanceGroups.custom.modifiers = setting.custom.map(custom => ({
      ...custom,
      name: custom.id,
      id: custom.id.replace("custom.", "")
    }));

    const cmsPercent = Object.values(circumstanceGroups).reduce((acc, group) => acc + group.modifiers.reduce((acc, mod) => acc + (mod.checked ? mod.value : 0), 0), 1);
    const total = Math.ceil(this.ber * cmsPercent);
    return {
      circumstanceGroups,
      cmsPercent,
      total
    }
  }

  override _attachPartListeners(partId: string, htmlElement: HTMLElement, options: HandlebarsRenderOptions): void {
    super._attachPartListeners(partId, htmlElement, options);

    if (partId === "venture") {
      this.filter.bind(this.element);

      for (const checkbox of htmlElement.querySelectorAll<HTMLInputElement>("input[type='checkbox']")) {
        checkbox.addEventListener("change", async () => {
          const setting = game.settings.get("ptr2e", "expTrackerData");
          const id = checkbox.name;
          const checked = checkbox.checked;
          if (!setting || !id) return;

          await setting.update(id, checked);

          const { cmsPercent, total } = this.prepareModifiers();
          const percentElement = htmlElement.querySelector<HTMLElement>("[data-name='cms-percent']");
          const expTotalElement = htmlElement.querySelector<HTMLElement>("[data-name='exp-total']");
          if (percentElement) percentElement.textContent = `${(cmsPercent * 100).toFixed(0)}%`;
          if (expTotalElement) expTotalElement.textContent = total.toString();
        });
      }
    }
  }

  _onSearchFilter(_event: KeyboardEvent, query: string, rgx: RegExp, html: HTMLElement) {
    const visibleLists = new Set();
    for (const entry of html.querySelectorAll<HTMLDivElement>("div.form-group")) {
      if (!query) {
        entry.classList.remove("hidden");
        continue;
      }
      const slug = entry.dataset.filter;
      const match = (slug && rgx.test(SearchFilter.cleanQuery(slug)));
      entry.classList.toggle("hidden", !match);
      if (match) visibleLists.add(slug);
    }

    // Remove details of which no entries are visible
    for (const entry of html.querySelectorAll<HTMLDivElement>("details")) {
      const entries = entry.querySelectorAll<HTMLDivElement>("div.form-group");
      const visible = Array.from(entries).some(e => !e.classList.contains("hidden"));
      entry.classList.toggle("hidden", !visible);
    }
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