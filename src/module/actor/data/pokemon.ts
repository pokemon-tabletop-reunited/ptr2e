import { ActorPTR2e } from "@actor";
import { ActorSystemPTR2e } from "./index.ts";
import { SpeciesDropSheet } from "@actor/sheets/species-drop-sheet.ts";
import { ItemPTR2e } from "@item";
import { SpeciesSystemModel } from "@item/data/index.ts";

class PokemonActorSystem extends ActorSystemPTR2e {
    declare parent: ActorPTR2e<this>;

    override async _preCreate(data: this["parent"]["_source"], options: DocumentModificationContext<this["parent"]["parent"]> & { fail?: boolean }, _user: User): Promise<boolean | void> {
        if (!this._source.species) {

            const promise = await new Promise((resolve, _reject) => {
                const app = new SpeciesDropSheet(resolve);
                app.render(true);
            });

            if (promise instanceof ItemPTR2e && promise.system instanceof SpeciesSystemModel) {
                this.updateSource({ species: promise.toObject().system })
                if (data.name.includes("New Actor")) {
                    this.parent.updateSource({ name: promise.name });
                }
                if ((!data.img || data.img === 'icons/svg/mystery-man.svg') && promise.img) {
                    this.parent.updateSource({ img: promise.img });
                }
                return true;
            }

            options.fail = true;
            return false;
        }

        await super._preCreate(data, options, _user);
    }
}

export default PokemonActorSystem;