import { Tab } from "@item/sheets/document.ts";
import { ApplicationConfigurationExpanded, ApplicationV2Expanded } from "../appv2-expanded.ts";
import { htmlQuery, htmlQueryAll, localizer } from "@utils";
import { PackInfo } from "./data.ts";

export class CompendiumBrowserSettings extends foundry.applications.api.HandlebarsApplicationMixin(ApplicationV2Expanded) {
  static override DEFAULT_OPTIONS = {
    tag: "form",
    id: "compendium-browser-settings",
    classes: ["sheet", "default-sheet"],
    position: {
      width: 800,
      height: 'auto' as const
    },
    window: {
      minimizable: true,
      resizable: true,
    },
    form: {
      closeOnSubmit: false,
      handler: CompendiumBrowserSettings.#saveSettings,
    }
  } as unknown as Omit<DeepPartial<ApplicationConfigurationExpanded>, "uniqueId">;

  static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
    tabs: {
      id: "tabs",
      template: "systems/ptr2e/templates/items/parts/item-tabs.hbs",
    },
    packs: {
      id: "packs",
      template: "systems/ptr2e/templates/apps/compendium-browser/settings/packs.hbs",
      scrollable: [".scroll"]
    },
    sources: {
      id: "sources",
      template: "systems/ptr2e/templates/apps/compendium-browser/settings/sources.hbs",
      scrollable: [".scroll"],
    },
    footer: {
      id: "footer",
      template: "systems/ptr2e/templates/apps/compendium-browser/settings/footer.hbs"
    }
  };

  tabGroups: Record<string, string> = {
    tabs: "packs",
  }

  tabs: Record<string, Tab> = {
    "packs": {
      id: "packs",
      group: "tabs",
      icon: "",
      label: "PTR2E.CompendiumBrowser.Tabs.Packs",
    },
    "sources": {
      id: "sources",
      group: "tabs",
      icon: "",
      label: "PTR2E.CompendiumBrowser.Tabs.Sources",
    }
  }

  _getTabs() {
    for (const v of Object.values(this.tabs)) {
      v.active = this.tabGroups[v.group] === v.id;
      v.cssClass = v.active ? "active" : "";
    }
    return this.tabs;
  }

  override get title() {
    return game.i18n.localize("PTR2E.CompendiumBrowser.SettingsTitle");
  }

  get browser() {
    return game.ptr.compendiumBrowser;
  }

  override async _prepareContext(options?: foundry.applications.api.HandlebarsRenderOptions | undefined) {
    return {
      ...super._prepareContext(options),
      tabs: this._getTabs(),
      settings: Object.entries(this.browser.settings).map(([tab, packs]) => ({
        label: `TYPES.Item.${tab}`,
        key: tab,
        options: packs
      })),
      sources: this.browser.packLoader.sourcesSettings
    }
  }

  override _attachPartListeners(partId: string, htmlElement: HTMLElement, options: foundry.applications.api.HandlebarsRenderOptions): void {
    super._attachPartListeners(partId, htmlElement, options);
    if (!["packs", "sources"].includes(partId)) return;

    const sourceSearch = htmlQuery<HTMLInputElement>(htmlElement, "input[data-element=setting-sources-search]");
    const sourceToggle = htmlQuery<HTMLInputElement>(htmlElement, "input[data-action=setting-sources-toggle-visible]");
    const sourceSettings = htmlQueryAll<HTMLElement>(htmlElement, "label[data-element=setting-source]");

    sourceSearch?.addEventListener("input", () => {
      const value = sourceSearch.value?.trim().toLocaleLowerCase(game.i18n.lang);

      for (const element of sourceSettings) {
        const name = element.dataset.name?.toLocaleLowerCase(game.i18n.lang);
        const shouldBeHidden = !!value && !!name && !name.includes(value);

        element.classList.toggle("hidden", shouldBeHidden);
      }

      if (sourceToggle) {
        sourceToggle.checked = false;
      }
    });

    sourceToggle?.addEventListener("click", () => {
      for (const element of sourceSettings) {
        const checkbox = htmlQuery<HTMLInputElement>(element, "input[type=checkbox]");
        if (!element.classList.contains("hidden") && checkbox) {
          checkbox.checked = sourceToggle.checked;
        }
      }
    });

    const deleteButton = htmlQuery<HTMLInputElement>(htmlElement, "button[data-action=settings-sources-delete]");
    deleteButton?.addEventListener("click", async () => {
      const localize = localizer("PTR2E.Settings.CompendiumBrowserSources");
      const confirm = await Dialog.confirm({
        title: localize("DeleteAllTitle"),
        content: `
              <p>
                  ${localize("DeleteAllQuestion")}
              </p>
              <p>
                  ${localize("DeleteAllInfo")}
              </p>
              `,
      });

      if (confirm) {
        await this.browser.packLoader.hardReset(this.browser.loadedPacksAll());
        await game.settings.set("ptr2e", "compendiumBrowserSources", this.browser.packLoader.sourcesSettings);
        // await this.#resetInitializedTabs();
        this.render(true);
      }
    });
  }

  static async #saveSettings(this: CompendiumBrowserSettings, _event: SubmitEvent, _element: HTMLElement, formData: FormDataExtended) {
    for (const [t, packs] of Object.entries(this.browser.settings) as [string, Record<string, PackInfo>][]) {
      for (const [key, pack] of Object.entries(packs) as [string, PackInfo][]) {
        pack.load = formData.get(`${t}-${key}`) === "true";
      }
    }
    await game.settings.set("ptr2e", "compendiumBrowserPacks", this.browser.settings);

    for (const [key, source] of Object.entries(this.browser.packLoader.sourcesSettings.sources)) {
      if (!source?.name) {
        delete this.browser.packLoader.sourcesSettings.sources[key]; // just to make sure we clean up
        continue;
      }
      source.load = formData.get(`source-${key}`) === "true";
    }

    this.browser.packLoader.sourcesSettings.showEmptySources = formData.get("show-empty-sources") === "true";
    this.browser.packLoader.sourcesSettings.showUnknownSources = formData.get("show-unknown-sources") === "true";
    this.browser.packLoader.sourcesSettings.ignoreAsGM = formData.get("ignore-as-gm") === "true";
    await game.settings.set("ptr2e", "compendiumBrowserSources", this.browser.packLoader.sourcesSettings);

    // await this.#resetInitializedTabs();
    this.render(true);
    ui.notifications.info("PTR2E.BrowserSettingsSaved", { localize: true });
  }
}