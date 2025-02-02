import { PTRTour } from "./base.ts";

export class MiscTour extends PTRTour {
  protected override async _preStep(): Promise<void> {
    await super._preStep();

    if(this.currentStep?.id === "exp-tracker") {
      document.querySelector<HTMLElement>("li.scene-control[data-control='token']")?.click()
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
}