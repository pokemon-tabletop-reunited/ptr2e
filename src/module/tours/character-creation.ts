export class CharacterCreationTour extends Tour {
    protected override async _preStep(): Promise<void> {
        if(this.id === "welcome") {
            ui.sidebar.activateTab("actors");
        }   
    }
}