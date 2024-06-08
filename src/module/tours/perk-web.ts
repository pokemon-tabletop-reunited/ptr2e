import { PTRTour } from "./base.ts";

export class PerkWebTour extends PTRTour {
    protected override async _preStep(): Promise<void> {
        if(this.id === "welcome") {
            
        }   
    }
}