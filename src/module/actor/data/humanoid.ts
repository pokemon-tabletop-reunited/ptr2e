import { ActorPTR2e } from "@actor";
import { ActorSystemPTR2e } from "./index.ts";
import { SpeciesSystemModel } from "@item/data/index.ts";
import { sluggify } from "@utils";
import { PTRCONSTS } from "@data";

class HumanoidActorSystem extends ActorSystemPTR2e {
    declare parent: ActorPTR2e<this>;

    static constructSpecies(system: HumanoidActorSystem): SpeciesSystemModel {
        const data = {
            slug: sluggify(system.parent.name),
            traits: ["humanoid", "underdog", "unique-egg-group", "bipedal", "speech", "wielder"],
            number: 0,
            stats: {
                hp: system.attributes.hp.base,
                atk: system.attributes.atk.base,
                def: system.attributes.def.base,
                spa: system.attributes.spa.base,
                spd: system.attributes.spd.base,
                spe: system.attributes.spe.base
            },
            types: system.type.types || [PTRCONSTS.Types.UNTYPED],
            diet: ["omnivore"],
            movement: {
                primary: [{type: "overland", value: 4}],
                secondary: [{type: "swim", value: 2}]
            },
            skills: [
                {
                    "slug": "accounting",
                    "value": 10
                },
                {
                    "slug": "acrobatics",
                    "value": 25
                },
                {
                    "slug": "appraise",
                    "value": 10
                },
                {
                    "slug": "climb",
                    "value": 25
                },
                {
                    "slug": "conversation",
                    "value": 10
                },
                {
                    "slug": "resources",
                    "value": 10
                },
                {
                    "slug": "disguise",
                    "value": 10
                },
                {
                    "slug": "fast-talk",
                    "value": 10
                },
                {
                    "slug": "husbandry",
                    "value": 25
                },
                {
                    "slug": "intimidate",
                    "value": 10
                },
                {
                    "slug": "leadership",
                    "value": 10
                },
                {
                    "slug": "lift",
                    "value": 25
                },
                {
                    "slug": "listen",
                    "value": 25
                },
                {
                    "slug": "natural-world",
                    "value": 5
                },
                {
                    "slug": "navigate",
                    "value": 10
                },
                {
                    "slug": "negotiation",
                    "value": 10
                },
                {
                    "slug": "psychology",
                    "value": 5
                },
                {
                    "slug": "read-lips",
                    "value": 10
                },
                {
                    "slug": "research",
                    "value": 10
                },
                {
                    "slug": "ride",
                    "value": 10
                },
                {
                    "slug": "running",
                    "value": 25
                },
                {
                    "slug": "spot",
                    "value": 25
                },
                {
                    "slug": "stealth",
                    "value": 10
                },
                {
                    "slug": "survival",
                    "value": 10
                },
                {
                    "slug": "swim",
                    "value": 10
                }
            ],
            eggGroups: ["unique"],
            genderRatio: 4,
        };
        return new SpeciesSystemModel(data);
    }

    override async _preCreate(data: this["parent"]["_source"], options: DocumentModificationContext<this["parent"]["parent"]> & { fail?: boolean }, user: User){
        if(!this._source.traits?.length) {
            this.parent.updateSource({ "system.traits": ["humanoid", "underdog"] })
        }

        if(!this._source.species) {
            this.parent.updateSource({ "system.species": HumanoidActorSystem.constructSpecies(this) });
        }

        return await super._preCreate(data, options, user);
    }
}

export default HumanoidActorSystem;