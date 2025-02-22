import { GithubSheet } from "../github.ts";

export class SettingsSidebarPTR2e extends Settings {
  static override get defaultOptions() {
    return fu.mergeObject(super.defaultOptions, {
      template: "systems/ptr2e/templates/sidebar/settings.hbs",
    });
  }

  protected override _onSettingsButton(event: MouseEvent): void {
    event.preventDefault();

    const button = event.currentTarget as HTMLElement;
    switch (button.dataset.action) {
      case "tutor-list": return void game.ptr.tutorList.render({force: true, actor: null});
      case "compendium-browser": return void game.ptr.compendiumBrowser.render(true);
      case "github-app": return void new GithubSheet().render(true);
    }

    return super._onSettingsButton(event);
  }
}