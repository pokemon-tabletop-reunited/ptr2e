import { PTRTour } from "./base.ts";

export class WelcomeTour extends PTRTour {
    protected override async _preStep(): Promise<void> {
        if(this.currentStep?.id === "next") {
            ui.sidebar.activateTab("settings");
        }   
    }
}