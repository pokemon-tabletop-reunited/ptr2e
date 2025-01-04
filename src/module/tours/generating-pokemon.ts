import { BlueprintSheetPTR2e } from "@item/sheets/index.ts";
import { PTRTour } from "./base.ts";

export class GeneratingPokemonTour extends PTRTour {
  private blueprintApp: foundry.applications.api.ApplicationV2.Any | undefined;
  
  override get app() {
    return this.blueprintApp;
  }

  protected override async _preStep(): Promise<void> {
    if(this.currentStep?.id === "example" && !this.blueprintApp) {
      this.blueprintApp = await new BlueprintSheetPTR2e({
        document: new CONFIG.Item.documentClass({
          name: "Bulbasaur",
          type: "blueprint",
          system: {
            blueprints: [{
              species: "Compendium.ptr2e.core-species.Item.pCSOFZ2UvRx8QTGs"
            }]
          }
        }) as PTR.Item.System.Blueprint.ParentInstance,
        generation: {
          x: 0,
          y: 0,
          canvas: canvas,
          temporary: true
        }
      }).render(true);
    }

    await super._preStep();
  }
}