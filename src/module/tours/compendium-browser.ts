import { PTRTour } from "./base.ts";

export class CompendiumBrowserTour extends PTRTour {

  override get app() {
    return game.ptr.compendiumBrowser;
  }

  protected override async _preStep(): Promise<void> {
    await super._preStep();

    if(this.currentStep?.id === "filtering") {
      await new Promise(resolve => setTimeout(resolve, 250));
      this.app.compendiumTabs.move.resetFilters();
      this.app.compendiumTabs.move.filterData.multiselects.traits.selected = [];
      this.app.compendiumTabs.move.filterData.multiselects.traits.selected.push({value: "dash", label: "Dash"});
      await this.app.render(true);
      await new Promise(resolve => setTimeout(resolve, 250));
    }
  }

  protected override _tearDown(complete?: boolean): Promise<void> {
    if(this.app.compendiumTabs.move.isInitialized) {
      this.app.compendiumTabs.move.filterData.multiselects.traits.selected = [];
    }
    return super._tearDown(complete);
  }
}