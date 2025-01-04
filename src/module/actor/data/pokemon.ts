import { ActorSystemPTR2e } from "./index.ts";
import { SpeciesDropSheet } from "@actor/sheets/species-drop-sheet.ts";
import { BlueprintSheetPTR2e } from "@item/sheets/index.ts";
import type { ActorSystemSchema } from "./system.ts";

class PokemonActorSystem extends ActorSystemPTR2e {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async _preCreate(data: foundry.abstract.TypeDataModel.ParentAssignmentType<ActorSystemSchema, Actor.ConfiguredInstance>, options: foundry.abstract.Document.PreCreateOptions<any>, user: User): Promise<boolean | void> {
    if (!this.parent.items.has("actorspeciesitem")) {
      const promise = await new Promise<Item.ConfiguredInstance | null>((resolve) => {
        const app = new SpeciesDropSheet(resolve);
        app.render(true);
      });

      if (promise instanceof CONFIG.Item.documentClass && promise.system instanceof CONFIG.PTR.Item.dataModels.species) {
        const blueprint = await CONFIG.Item.documentClass.create(
          {
            name: promise.name,
            type: "blueprint",
            system: {
              blueprints: [{
                species: promise.uuid,
              }]
            }
          },
          {
            temporary: true
          }
        );
        if (!blueprint) {
          options.fail = true;
          return false;
        }

        const generatedData = await new BlueprintSheetPTR2e({
          document: blueprint as Item.ConfiguredInstance,
          generation: {
            x: 0,
            y: 0,
            canvas,
            temporary: true
          }
        }).dataOnly();

        // const generatedData = await blueprint.system.generate(null, true);
        if (!generatedData) {
          options.fail = true;
          return false;
        }

        const source = this.parent.toObject();
        const update = foundry.utils.mergeObject(source, generatedData[0], { inplace: false });
        if (source.folder && source.folder !== update.folder) update.folder = source.folder;
        this.parent.updateSource(update);

        if (!data.name.includes(game.i18n.localize("TYPES.Actor.pokemon"))) {
          this.parent.updateSource({ name: data.name });
        }

        return true;
      }

      options.fail = true;
      return false;
    }

    return await super._preCreate(data, options, user);
  }
}

export default PokemonActorSystem;
