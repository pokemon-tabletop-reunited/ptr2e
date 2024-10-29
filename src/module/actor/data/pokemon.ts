import { ActorPTR2e } from "@actor";
import { ActorSystemPTR2e } from "./index.ts";
import { SpeciesDropSheet } from "@actor/sheets/species-drop-sheet.ts";
import { ItemPTR2e } from "@item";
import { BlueprintSystemModel, SpeciesSystemModel } from "@item/data/index.ts";
import { BlueprintSheetPTR2e } from "@item/sheets/index.ts";

class PokemonActorSystem extends ActorSystemPTR2e {
  declare parent: ActorPTR2e<this>;

  override async _preCreate(
    data: this["parent"]["_source"],
    options: DocumentModificationContext<this["parent"]["parent"]> & { fail?: boolean },
    user: User
  ) {
    if (!this._source.species) {
      const promise = await new Promise<ItemPTR2e<SpeciesSystemModel> | null>((resolve) => {
        const app = new SpeciesDropSheet(resolve);
        app.render(true);
      });

      if (promise instanceof ItemPTR2e && promise.system instanceof SpeciesSystemModel) {
        const blueprint = await ItemPTR2e.create<ItemPTR2e<BlueprintSystemModel, null>>(
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
        if(!blueprint) {
          options.fail = true;
          return false;
        }

        //@ts-expect-error - This is a valid document.
        const generatedData = await new BlueprintSheetPTR2e({
          document: blueprint,
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
        const update = fu.mergeObject(source, generatedData[0], { inplace: false });
        if(source.folder && source.folder !== update.folder) update.folder = source.folder;
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
