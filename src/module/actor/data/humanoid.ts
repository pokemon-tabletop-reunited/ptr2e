import { ActorPTR2e } from "@actor";
import { ActorSystemPTR2e } from "./index.ts";
import { SpeciesSystemModel } from "@item/data/index.ts";
import { sluggify } from "@utils";
import { PTRCONSTS } from "@data";

class HumanoidActorSystem extends ActorSystemPTR2e {
    static constructSpecies(system: HumanoidActorSystem): SpeciesSystemModel {
        const data = {
            slug: sluggify(system.parent.name),
            traits: ["Humanoid"],
            number: 0,
            stats: {
                hp: system.attributes.hp.base,
                atk: system.attributes.atk.base,
                def: system.attributes.def.base,
                spa: system.attributes.spa.base,
                spd: system.attributes.spd.base,
                spe: system.attributes.spe.base
            },
            types: system.type.types || [PTRCONSTS.Types.UNTYPED]
        };
        return new SpeciesSystemModel(data);
    }
    declare parent: ActorPTR2e<this>;
}

export default HumanoidActorSystem;