import { PTRTour } from "./base.ts";

export class GeneratingPokemonTour extends PTRTour {
    protected override async _preStep(): Promise<void> {
        if(this.id === "welcome") {
            
        }   
    }
}