import { ActorPTR2e } from "@actor";
import { ApplicationV2Expanded } from "./appv2-expanded.ts";
import { htmlQueryAll } from "@utils";

export class RestApp extends foundry.applications.api.HandlebarsApplicationMixin(ApplicationV2Expanded) {
  static override DEFAULT_OPTIONS = {
    tag: "form",
    classes: ["ptr2e", "sheet", "rest-sheet"],
    position: {
      height: 'auto' as const,
      width: 325,
    },
    window: {
      minimizable: true,
      resizable: false,
    },
    form: {
      submitOnChange: false,
      closeOnSubmit: true,
      handler: RestApp.#onSubmit,
    },
  };

  static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
    actions: {
      id: "actions",
      template: "systems/ptr2e/templates/apps/rest-popup.hbs",
      scrollable: [".scroll"],
    },
  };

  name: string;
  documents: ActorPTR2e[];
  boxed: ActorPTR2e[];
  restType: string;
  fractionToHeal: number;

  constructor(name: string, documents: ActorPTR2e[], options: Partial<foundry.applications.api.ApplicationConfiguration> = {}) {
    options.id = `rest-${documents.length ? documents[0].id || fu.randomID() : fu.randomID()}`;
    super(options);
    this.name = name;
    this.documents = documents;

    this.boxed = (() => {
      const partyLeader = this.documents.at(0)?.party?.owner;
      if (!partyLeader?.folder) return [];

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
            actor: entry
          }))
        }
      });
      const folder = game.folders.get(partyLeader.folder?.id);
      if (!folder) return [];

      return getBoxData(folder).entries.map(entry => entry.actor)
    })()
  }

  override get title() {
    return `${this.name} - ${game.i18n.localize("PTR2E.ActorSheet.Rest")}`;
  }

  applyToBox = false;

  override async _prepareContext() {
    if(this.restType !== "center") this.applyToBox = false;

    const party = this.documents.map(a => ({
      img: a.img,
      name: a.name,
      uuid: a.uuid,
    }));

    return {
      id: this.options.id,
      party,
      restType: this.restType ?? "camp",
      fractionToHeal: Math.clamp(Math.round((this.fractionToHeal ?? 0) * 100), 0, 100),
      box: this.applyToBox ? this.boxed : [],
      applyToBox: this.applyToBox
    };
  }

  override _attachPartListeners(
    partId: string,
    htmlElement: HTMLElement,
    options: foundry.applications.api.HandlebarsRenderOptions
  ): void {
    super._attachPartListeners(partId, htmlElement, options);

    for (const input of htmlQueryAll(htmlElement, "[name='restType']")) {
      input.addEventListener("change", this.#onRestTypeChange.bind(this));
    }

    for (const input of htmlQueryAll(htmlElement, "[name='fractionToHeal']")) {
      input.addEventListener("change", this.#onFractionToHealChange.bind(this));
    }

    const applyToBoxButton = htmlElement.querySelector<HTMLInputElement>("[name='applyToBox']");
    if (applyToBoxButton) {
      applyToBoxButton.addEventListener("change", (event) => {
        const input = event.currentTarget as HTMLInputElement;
        this.applyToBox = input.checked;
        this.render({ parts: ["actions"] });
      });
    }
  }

  #onRestTypeChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const restType = input.value;
    this.restType = restType;
    this.render(false);
  }

  #onFractionToHealChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const fth = parseInt(input.value);
    if (isNaN(fth)) return;
    this.fractionToHeal = fth / 100;
    this.render(false);
  }

  static async #onSubmit(
    this: RestApp,
    _event: SubmitEvent | Event,
    _form: HTMLFormElement,
    formData: FormDataExtended
  ) {
    const data = fu.expandObject(formData.object);
    const healOptions = {
      fractionToHeal: 1.0,
      removeWeary: true,
      removeExposed: false,
      removeAllStacks: false,
    };

    switch (data.restType) {
      case "camp":
        healOptions.fractionToHeal = (data.fractionToHeal as unknown as number) / 100;
        break;
      case "center":
        healOptions.removeExposed = true;
        healOptions.removeAllStacks = true;
        break;
    }

    const notification = ui.notifications.info(game.i18n.localize("PTR2E.Rest.Notifications.Info"));

    await Promise.all(this.documents.map(d => d.heal(healOptions)));
    if (this.applyToBox) {
      await Promise.all(this.boxed.map(d => d.heal(healOptions)));
    }

    ui.notifications.remove(notification);
    ui.notifications.info(game.i18n.localize("PTR2E.Rest.Notifications.Success"));
  }

}