/** TODO: Extend CompendiumDirectory to support a search bar */
export class CompendiumDirectoryPTR2e extends CompendiumDirectory {
  static readonly STOP_WORDS = new Set(["of", "th", "the"])

  static override get defaultOptions() {
    return {
      ...super.defaultOptions,
      template: "systems/ptr2e/templates/sidebar/compendium-directory.hbs",
    }
  }

  override activateListeners(html: JQuery): void {
    super.activateListeners(html)

    html[0].querySelector("footer > button")?.addEventListener("click", () => {
      game.ptr.compendiumBrowser.render(true);
    });
  }
}