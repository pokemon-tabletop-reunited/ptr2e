export class WelcomeTour extends Tour {
    protected override async _preStep(): Promise<void> {
        if(this.currentStep?.id === "next") {
            ui.sidebar.activateTab("settings");
        }   
    }
}