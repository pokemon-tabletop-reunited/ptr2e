import { ActorSystemPTR2e } from "./index.ts";
import { SpeciesSystemModel } from "@item/data/index.ts";
import { sluggify } from "@utils";
import { PTRCONSTS } from "@data";
import type { ActorSystemSchema } from "./system.ts";

class HumanoidActorSystem extends ActorSystemPTR2e {

  static constructSpecies(system: PTR.Actor.SystemSource, name = system.parent.name): SpeciesSystemModel {
    const data = {
      slug: sluggify(name),
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
        primary: [{ type: "overland", value: 4 }],
        secondary: [{ type: "swim", value: 2 }]
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async _preCreate(data: foundry.abstract.TypeDataModel.ParentAssignmentType<ActorSystemSchema, Actor.ConfiguredInstance>, options: foundry.abstract.Document.PreCreateOptions<any>, user: User): Promise<boolean | void> {
    if (!this._source.traits?.length) {
      this.parent.updateSource({ "system.traits": ["humanoid", "underdog"] })
    }

    if (!this.parent.items.has("actorspeciesitem")) {
      const items = this.parent.toObject().items ?? [];
      this.parent.updateSource({
        "items": [
          ...items,
          {
            name: data.name,
            type: 'species',
            img: data.img,
            _id: "actorspeciesitem",
            system: HumanoidActorSystem.constructSpecies(this).toObject()
          }
        ]
      });
    }

    if (this.health?.max && this.health?.value !== this.health?.max) {
      this.parent.updateSource({ "system.health.value": this.health.max });
    }
    if (this.powerPoints?.max && this.powerPoints?.value !== this.powerPoints?.max) {
      this.parent.updateSource({ "system.powerPoints.value": this.powerPoints.max });
    }

    return await super._preCreate(data, options, user);
  }
}

export default HumanoidActorSystem;