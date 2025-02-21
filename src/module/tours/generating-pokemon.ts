import { BlueprintSheetPTR2e } from "@item/sheets/index.ts";
import { PTRTour } from "./base.ts";
import { BlueprintPTR2e, ItemPTR2e } from "@item";

export class GeneratingPokemonTour extends PTRTour {
  private blueprintApp: foundry.applications.api.ApplicationV2 | undefined;
  
  override get app() {
    return this.blueprintApp;
  }

  protected override async _preStep(): Promise<void> {
    if(this.currentStep?.id === "example" && !this.blueprintApp) {
      //@ts-expect-error - Type check fails.
      this.blueprintApp = await new BlueprintSheetPTR2e({
        document: new ItemPTR2e({
          name: "Bulbasaur",
          type: "blueprint",
          system: {
            blueprints: [{
              species: "Compendium.ptr2e.core-species.Item.pCSOFZ2UvRx8QTGs"
            }]
          },
          ownership: {default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER}
        }) as BlueprintPTR2e,
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