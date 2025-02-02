import { GithubSheet } from "../github.ts";

export class SettingsSidebarPTR2e extends foundry.applications.sidebar.tabs.Settings {
  static override DEFAULT_OPTIONS = {
    actions: {
      "tutor-list": function(this: SettingsSidebarPTR2e) {
        game.ptr.tutorList.render({force: true, actor: null});
      },
      "compendium-browser": function(this: SettingsSidebarPTR2e) {
        game.ptr.compendiumBrowser.render(true);
      },
      "github-app": function(this: SettingsSidebarPTR2e) {
        new GithubSheet().render(true);
      },
    }
  }

  override _onRender(context: foundry.applications.api.ApplicationRenderContext, options: foundry.applications.api.ApplicationRenderOptions){
    super._onRender(context, options);

    const section = this.element.querySelector<HTMLElement>("section.settings.flexcol")
    if(!section) return;

    const sectionPTR = document.createElement("section");
    sectionPTR.classList.add("settings", "flexcol");
    
    const headerPTR = document.createElement("h4");
    headerPTR.classList.add("divider");
    headerPTR.textContent = game.i18n.localize('PTR2E.Settings.Header');
    sectionPTR.appendChild(headerPTR);

    const compendiumBrowserButton = document.createElement("button");
    compendiumBrowserButton.classList.add("compendium-browser");
    compendiumBrowserButton.dataset.action = "compendium-browser";
    compendiumBrowserButton.innerHTML = `<i class="fas fa-magnifying-glass"></i> ${game.i18n.localize('PTR2E.CompendiumBrowser.Title')}`
    sectionPTR.appendChild(compendiumBrowserButton);

    const tutorListButton = document.createElement("button");
    tutorListButton.classList.add("tutor-list");
    tutorListButton.dataset.action = "tutor-list";
    tutorListButton.innerHTML = `<i class="fas fa-list"></i> ${game.i18n.localize('SETTINGS.TutorList')}`
    sectionPTR.appendChild(tutorListButton);

    if(Handlebars.helpers.devMode()) {
      const githubButton = document.createElement("button");
      githubButton.classList.add("github-app");
      githubButton.dataset.action = "github-app";
      githubButton.innerHTML = `<i class="fab fa-github"></i> ${game.i18n.localize('SETTINGS.Github')}`

      sectionPTR.appendChild(githubButton);
    }

    section.insertAdjacentElement("afterend", sectionPTR);
  }
}