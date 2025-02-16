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
      dragDrop: [{ dragSelector: ".box .actor:not(.loafing)", dropSelector: ".training-targets .actor" }],
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
        "apply-venture-exp": async function (this: EXPTracker, event: MouseEvent) {
          if (!game.user?.isGM) return;

          const button = (event.target as HTMLButtonElement);
          if (!button) return;
          button.disabled = true;
          button.classList.add("disabled");
          ui.notifications.info("Applying exp...");

          const { total, cmsPercent } = this._prepareModifiers();
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
        },
        "apply-training-exp": async function (this: EXPTracker, event: MouseEvent) {
          if (!game.user?.isGM) return;

          const button = (event.target as HTMLButtonElement);
          if (!button) return;
          button.disabled = true;
          button.classList.add("disabled");
          ui.notifications.info("Applying exp...");

          const total = this.ber;
          if(!total) return;
          const characters = Object.values(this.slots).flatMap(slot => slot.flatMap(s => s.actor ?? []));
          if(!characters.length) {
            ui.notifications.error("No characters selected");
            return void this.render({ parts: ["footer"] });
          }

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
          
          this.slots = {};
          this.openDetails = null;
          game.user.unsetFlag("ptr2e", "exp-training-slots");

          await ChatMessage.create({
            content: await renderTemplate("systems/ptr2e/templates/chat/exp-tracker.hbs", { messages, total }),
            speaker: ChatMessage.getSpeaker({ alias: game.i18n.localize("PTR2E.ExpTracker.title") }),
            flags: {
              ptr2e: {
                undoData
              }
            },
          })

          await this.render({ parts: ["training", "footer"] });
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
  
  override changeTab(tab: string, group: string, options?: { event?: Event; navElement?: HTMLElement; force?: boolean; updatePosition?: boolean; }): void {
    super.changeTab(tab, group, options);

    this.render({parts: ["footer"]});
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
          loafing: entry.effects.get("loafingafflictio") as ActiveEffectPTR2e
        }))
      }
    });

    const pcs = game.users.contents.flatMap(user => user.character ?? []);
    const characters = pcs.reduce((acc, pc) => {
      // Check if anyone from this party has already been added
      const existing = acc.find(c => c.pc.folder?.id && c.pc.folder.id === pc.folder?.id);
      if (existing) {
        if (pc.system.party.ownerOf === existing.pc.folder!.id) {
          delete this.slots[existing.pc.uuid];
          existing.pc = pc;
          existing.slots = this._getSlots(pc);
        }
        return acc;
      }

      acc.push({
        pc,
        data: pc.folder ? getBoxData(pc.folder) : { folders: [], entries: [] },
        slots: this._getSlots(pc)
      });
      return acc;
    }, [] as { pc: ActorPTR2e, data: { folders: Folder[], entries: { actor: ActorPTR2e, loafing?: ActiveEffectPTR2e }[] }, slots: { actor?: ActorPTR2e }[] }[]);

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

    const { circumstanceGroups, cmsPercent, total } = this._prepareModifiers();

    this.characters = characters.reduce((acc, { pc, data }) => {
      acc.push(pc, ...data.entries.flatMap(entry => entry.loafing ? [] : entry.actor));
      return acc;
    }, [] as ActorPTR2e[]);

    const open = this.openDetails;
    this.openDetails = null;

    return {
      ...super._prepareContext(options),
      characters,
      ber,
      tabs: this._getTabs(),
      circumstanceGroups,
      cmsPercent,
      total,
      open,
      //@ts-expect-error - This is a hack to get around the fact that pf2e typing doesn't support nested properties
      amountField: game.settings.get("ptr2e", "expTrackerData").schema.fields.data.element.fields.amount
    }
  }

  _prepareModifiers() {
    const circumstanceGroups = fu.duplicate(CONFIG.PTR.data.circumstanceModifierGroups);
    const setting = game.settings.get("ptr2e", "expTrackerData");
    for (const group in circumstanceGroups) {
      const modifiers = circumstanceGroups[group as keyof typeof circumstanceGroups].modifiers;
      for (const mod of modifiers) {
        mod.amount =  setting.get(mod.name)?.amount ?? mod.amount ?? ((setting.get(mod.name) as {checked?: boolean})?.checked ?? (mod as {checked?: boolean}).checked) ?? 0;
      }
    }
    circumstanceGroups.custom.modifiers = setting.custom.map(custom => ({
      ...custom,
      name: custom.id,
      id: custom.id.replace("custom.", "")
    }));

    const cmsPercent = Object.values(circumstanceGroups).reduce((acc, group) => acc + group.modifiers.reduce((acc, mod) => acc + (mod.amount ? mod.value * mod.amount : 0), 0), 1);
    const total = Math.ceil(this.ber * cmsPercent);
    return {
      circumstanceGroups,
      cmsPercent,
      total
    }
  }

  private slots: Record<string, { actor?: ActorPTR2e }[]>;
  private openDetails: string | null = null;

  _getSlots(pc: ActorPTR2e) {
    if(!this.slots) this.slots = game.user.getFlag("ptr2e", "exp-training-slots") as Record<string, {actor?: ActorPTR2e}[]> ?? {};

    return this.slots[pc.uuid.replaceAll(".","-")] ?? (this.slots[pc.uuid.replaceAll(".","-")] = [{}, {}, {}, {}, {}, {}]);
  }

  override _attachPartListeners(partId: string, htmlElement: HTMLElement, options: HandlebarsRenderOptions): void {
    super._attachPartListeners(partId, htmlElement, options);

    if (partId === "venture") {
      this.filter.bind(this.element);
    }
    if (partId === "training") {
      for (const element of htmlElement.querySelectorAll<HTMLDivElement>(".slot .actor:not(.empty)")) {
        element.addEventListener("contextmenu", () => {
          const slot = parseInt(element.parentElement?.dataset.slot ?? "");
          if (isNaN(slot)) return;

          this.slots[element.dataset.uuid!][slot].actor = undefined;
          return this.render({ parts: ["training"] })
        });
      }
    }
  }

  override _onRender(context: foundry.applications.api.ApplicationRenderContext, options: foundry.applications.api.HandlebarsRenderOptions): void {
    super._onRender(context, options);

    for (const input of this.element.querySelectorAll<HTMLInputElement>("range-picker input")) {
      input.addEventListener("change", async () => {
        const setting = game.settings.get("ptr2e", "expTrackerData");
        const id = (input.parentElement as HTMLInputElement)?.name;
        const value = parseInt(input.value);
        if (!setting || !id) return;
        if(isNaN(value)) return;

        await setting.update(id, value);

        const { cmsPercent, total } = this._prepareModifiers();
        const percentElement = this.element.querySelector<HTMLElement>("[data-name='cms-percent']");
        const expTotalElement = this.element.querySelector<HTMLElement>("[data-name='exp-total']");
        if (percentElement) percentElement.textContent = `${(cmsPercent * 100).toFixed(0)}%`;
        if (expTotalElement) expTotalElement.textContent = total.toString();
      });
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

  override _onDragStart(event: DragEvent): void {
    const target = event.currentTarget as HTMLElement;
    if (!target.classList.contains("actor")) return;

    const uuid = target.dataset.uuid;
    if (!uuid) return;

    event.dataTransfer?.setData("text/plain", JSON.stringify({ type: 'Actor', uuid }));
  }

  override async _onDrop(event: DragEvent) {
    event.preventDefault();

    const target = event.currentTarget as HTMLElement;
    if (!target.classList.contains("actor")) return;

    const targetUuid = target.parentElement?.dataset.parent?.replaceAll(".","-");
    if (!targetUuid || !this.slots[targetUuid]) return;

    const slot = parseInt(target.parentElement?.dataset.slot ?? "");
    if (isNaN(slot)) return;

    const data = TextEditor.getDragEventData(event) as { type: string, uuid: string };
    if (!(data?.type === "Actor" && data.uuid)) return;

    const actor = await fromUuid<ActorPTR2e>(data.uuid);
    if (!actor) return;

    const slotElement = this.element.querySelector<HTMLDivElement>(`.slot[data-slot="${slot}"]`);
    if (!slotElement) return;

    for(const slot of this.slots[targetUuid]) {
      if(slot.actor?.id === actor.id) slot.actor = undefined;
    }
    this.slots[targetUuid][slot].actor = actor;
    game.user.setFlag("ptr2e", "exp-training-slots", this.slots);

    this.openDetails = target.parentElement!.dataset.parent!;

    return this.render({ parts: ["training"] })
  }
}

export interface EXPTracker {
  constructor: typeof EXPTracker;
}