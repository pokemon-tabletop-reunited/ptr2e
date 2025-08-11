import { GithubSheet } from "../github.ts";
import { GlobalPerkGeneratorConfig } from "../global-perk-generator-config.ts";

export class SettingsSidebarPTR2e extends foundry.applications.sidebar.tabs.Settings {

  static DEFAULT_OPTIONS = {
    actions: {
      "tutor-list": () => game.ptr.tutorList.render({force: true, actor: null}),
      "compendium-browser": () => game.ptr.compendiumBrowser.render(true),
      "github-app": () => new GithubSheet().render(true),
      "global-perk-config": () => new GlobalPerkGeneratorConfig().render(true)
    }
  }

  static PARTS = {
    settings: {
      template: "systems/ptr2e/templates/sidebar/settings.hbs",
      root: true
    }
  }
}