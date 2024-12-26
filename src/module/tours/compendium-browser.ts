import { PTRTour } from "./base.ts";

export class CompendiumBrowserTour extends PTRTour {
  protected override async _preStep(): Promise<void> {
    await super._preStep();
  }
}