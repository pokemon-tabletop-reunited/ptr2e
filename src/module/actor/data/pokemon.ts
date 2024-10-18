import { ActorPTR2e } from "@actor";
import { ActorSystemPTR2e } from "./index.ts";
// import { SpeciesDropSheet } from "@actor/sheets/species-drop-sheet.ts";
// import { AbilityPTR2e, ItemPTR2e, MovePTR2e } from "@item";
// import { SpeciesSystemModel } from "@item/data/index.ts";
// import natureData from "@scripts/config/natures.ts";
// import { htmlQuery, ImageResolver, sluggify } from "@utils";
// import { AttackPTR2e } from "@data";
// import { Progress } from "src/util/progress.ts";
// import { LevelUpMoveSchema } from "@item/data/species.ts";

class PokemonActorSystem extends ActorSystemPTR2e {
    declare parent: ActorPTR2e<this>;

    override async _preCreate(
        data: this["parent"]["_source"],
        options: DocumentModificationContext<this["parent"]["parent"]> & { fail?: boolean },
        user: User
    ) {
        // if (!this._source.species) {
        //     const promise = await new Promise<ItemPTR2e<SpeciesSystemModel> | null>((resolve) => {
        //         const app = new SpeciesDropSheet(resolve);
        //         app.render(true);
        //     });

        //     if (promise instanceof ItemPTR2e && promise.system instanceof SpeciesSystemModel) {
        //         this.updateSource({ species: promise.toObject().system });
        //         if (data.name.includes(game.i18n.localize("TYPES.Actor.pokemon"))) {
        //             this.parent.updateSource({ name: Handlebars.helpers.formatSlug(sluggify(promise.name)) });
        //         }
        //         if ((!data.img || data.img === "icons/svg/mystery-man.svg") && promise.img) {
        //             this.parent.updateSource({ img: promise.img });
        //         }
        //         await this._preCreateGenerateSpeciesData(this._source.species as unknown as NonNullable<this['_source']['species']>);
        //         return true;
        //     }

        //     options.fail = true;
        //     return false;
        // }
        // await this._preCreateGenerateSpeciesData(this._source.species);

        return await super._preCreate(data, options, user);
    }
}

export default PokemonActorSystem;
