export class CompendiumDirectoryPTR2e extends foundry.applications.sidebar.tabs.CompendiumDirectory {
  static readonly STOP_WORDS = new Set(["of", "th", "the"])

  static DEFAULT_OPTIONS = {
    actions: {
      "openCompendiumBrowser": () => game.ptr.compendiumBrowser.render({ force: true })
    }
  }

  async _preparePartContext(partId: string, context: foundry.applications.api.ApplicationRenderContext, options: foundry.applications.api.HandlebarsRenderOptions) {
    //@ts-expect-error - Missing types for this function
    super._preparePartContext(partId, context, options);

    if (partId === "footer") await this._prepareFooterContext(context);
    return context;
  }

  async _prepareFooterContext(context: foundry.applications.api.ApplicationRenderContext) {
    context.buttons ??= [];
    //@ts-expect-error - Untyped property
    context.buttons.push({
      type: "button",
      cssClass: "compendium-browser-btn",
      icon: "fa-solid fa-magnifying-glass",
      label: game.i18n.localize("PTR2E.CompendiumBrowser.Title"),
      action: "openCompendiumBrowser",
    })
  }
}