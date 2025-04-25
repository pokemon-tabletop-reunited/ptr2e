import { SlugField } from "../../fields/slug-field";
import fields = foundry.data.fields;
import { getTypes } from "../../config/effectiveness";
import { PTRCONSTS } from "../..";
import { getInitialSkillList } from "../../config/skills";
import SkillPTR2e from "../../models/skill";
import { CollectionField } from "../../fields/collection-field";
import { exactKeys } from "../../../util/misc";
import type { SizeTypes, SpeciesSize } from "../../actor/models/data";
import { HasSlug, type SlugSchema } from "../../mixins/has-slug";

declare namespace SpeciesSystem {
  type Schema = typeof speciesSchema & SlugSchema;
}

class SpeciesSystem extends HasSlug(foundry.abstract.TypeDataModel)<SpeciesSystem.Schema, foundry.abstract.Document.Any> {
  static override defineSchema() {
    return {
      ...super.defineSchema(),
      ...speciesSchema
    };
  }

  static override migrateData(source: foundry.data.fields.SchemaField.SourceData<SpeciesSystem.Schema>) {
    if (source.abilities) {
      for (const abGroup of exactKeys(source.abilities)) {
        source.abilities[abGroup] = source.abilities[abGroup].map(g => {
          if (typeof g == "object") return g;
          return { slug: g, uuid: null };
        });
      }
    }
    return super.migrateData(source);
  }

  public static getSpeciesSize(height: number, type: SizeTypes): SpeciesSize {
    const sizeClass = (() => {
      switch (type) {
        case "height": {
          switch (true) {
            case height < 0.3048:
              return 0;
            case height < 0.6096:
              return 1;
            case height < 1.2192:
              return 2;
            case height < 2.4384:
              return 3;
            case height < 4.8768:
              return 4;
            case height < 9.7536:
              return 5;
            case height < 16.4592:
              return 6;
            default:
              return 7;
          }
        }
        case "quad": {
          switch (true) {
            case height < 0.1512:
              return 0;
            case height < 0.3024:
              return 1;
            case height < 0.6047:
              return 2;
            case height < 1.2094:
              return 3;
            case height < 2.4189:
              return 4;
            case height < 4.8378:
              return 5;
            case height < 8.1638:
              return 6;
            default:
              return 7;
          }
        }
        case "length": {
          switch (true) {
            case height < 0.5073:
              return 0;
            case height < 1.0145:
              return 1;
            case height < 2.029:
              return 2;
            case height < 4.058:
              return 3;
            case height < 8.116:
              return 4;
            case height < 16.2321:
              return 5;
            case height < 27.3916:
              return 6;
            default:
              return 7;
          }
        }
        default:
          return 0;
      }
    })();
    const sizeCategory = (() => {
      switch (sizeClass) {
        case 0:
          return "Diminutive";
        case 1:
          return "Tiny";
        case 2:
          return "Small";
        case 3:
          return "Medium";
        case 4:
          return "Large";
        case 5:
          return "Huge";
        case 6:
          return "Gigantic";
        case 7:
          return "Titanic";
        default:
          return "Max";
      }
    })();
    return { sizeClass, sizeCategory };
  }

  foo() {
    return this.slug;
  }

  bar() {
    return this.skills?.get("acrobatics")?.rvs;
  }

  zar() {
    return this.evolutions?.evolutions[0]?.methods[0]?.type
  }

  override async _preCreate(
    data: Item.CreateData,
    options: Item.Database.PreCreateOptions,
    user: User.Implementation
  ): Promise<boolean | void> {
    //@ts-expect-error - Improper typing due to the parent needing to be set to Document.Any.
    const result = await super._preCreate(data, options, user);
    if (result === false) return false;

    if (!data.img || data.img === "icons/svg/item-bag.svg") {
      this.parent.updateSource({
        img: "systems/ptr2e/img/icons/species_icon.webp",
      });
    }
  }
}

declare namespace EvolutionData {
  type Schema = ReturnType<typeof defineEvolutionSchema>;
}

class EvolutionData extends foundry.abstract.DataModel<EvolutionData.Schema> {
  static override defineSchema(): EvolutionData.Schema {
    return defineEvolutionSchema();
  }
}

function defineEvolutionSchema() {
  const fields = foundry.data.fields;

  const getTypeField = (initial: "level" | "item" | "move" | "gender") => ({
    type: new fields.StringField({
      required: true,
      initial: initial as string,
      choices: ["level", "item", "move", "gender"].reduce<Record<string, string>>((acc, type) => ({ ...acc, [type]: type }), {}),
    }),
    operand: new fields.StringField({
      required: true,
      initial: "and",
      choices: ["and", "or"].reduce<Record<string, string>>((acc, operand) => ({ ...acc, [operand]: operand }), {}),
    }),
  });

  // Minimum level required to evolve
  const levelMethodSchema = {
    ...getTypeField("level"),
    level: new foundry.data.fields.NumberField({
      required: true,
      min: 1,
      max: 100,
      initial: 20,
    }),
  };

  class LevelMethodField extends foundry.abstract.DataModel<typeof levelMethodSchema> {
    static override defineSchema() {
      return levelMethodSchema;
    }
  }

  // Must have a certain gender
  const genderMethodSchema = {
    ...getTypeField("gender"),
    gender: new fields.StringField({
      required: true,
      choices: ["male", "female", "genderless"].reduce<Record<string, string>>((acc, gender) => ({ ...acc, [gender]: gender }), {}),
      initial: "genderless"
    }),
  };

  class GenderMethodField extends foundry.abstract.DataModel<typeof genderMethodSchema> {
    static override defineSchema() {
      return genderMethodSchema;
    }
  }

  // Must hold/use a certain item
  const itemMethodSchema = {
    ...getTypeField("item"),
    item: new fields.StringField({ required: true, initial: "" }),
    // If true the item must be held, otherwise it must be used.
    held: new fields.BooleanField({ required: true, initial: false }),
  };

  class ItemMethodField extends foundry.abstract.DataModel<typeof itemMethodSchema> {
    static override defineSchema() {
      return itemMethodSchema;
    }
  }

  // Must know a certain move
  const moveMethodSchema = {
    ...getTypeField("move"),
    move: new fields.StringField({ required: true, initial: "" }),
  }

  class MoveMethodField extends foundry.abstract.DataModel<typeof moveMethodSchema> {
    static override defineSchema() {
      return moveMethodSchema
    }
  }

  const getSchema = () => ({
    name: new SlugField({ required: true }),
    uuid: new fields.DocumentUUIDField({ type: "Item", required: false }),
    methods: new fields.ArrayField(
      new fields.TypedSchemaField({
        level: LevelMethodField,
        item: ItemMethodField,
        move: MoveMethodField,
        gender: GenderMethodField,
      }),
      {
        required: true,
        initial: [],
      }
    ),
    details: new fields.SchemaField(
      {
        gender: new SlugField({
          required: true,
          blank: false,
          nullable: true,
          choices: ["male", "female"].reduce<Record<string, string>>((acc, gender) => ({ ...acc, [gender]: gender }), {}),
        }),
        item: new SlugField({ required: true, nullable: true }),
        level: new fields.NumberField({
          required: true,
          nullable: true,
          min: 0,
          max: 100,
        }),
        knownMove: new SlugField({
          required: true,
          nullable: true,
        }),
      },
      { required: true, nullable: true }
    ),
    perk: new fields.SchemaField({
      x: new fields.NumberField({ required: true, initial: 26 }),
      y: new fields.NumberField({ required: true, initial: 26 }),
    })
  });

  return {
    ...getSchema(),
    evolutions: new fields.ArrayField(
      new fields.SchemaField({
        ...getSchema(),
        evolutions: new fields.ArrayField(
          new fields.SchemaField(
            {
              ...getSchema(),
              evolutions: new fields.ArrayField(
                new fields.SchemaField({
                  ...getSchema(),
                  evolutions: new fields.ArrayField(
                    new fields.ObjectField(),
                    { required: false }
                  ),
                }),
                { required: false }
              ),
            },
            { required: false }
          )
        ),
      }),
      { required: true, initial: [] }
    ),
  };
}

const speciesSchema = {
  number: new fields.NumberField({
    required: true,
    nullable: false,
    min: 0,
    label: "PTR2E.FIELDS.pokemonNumber.label",
    hint: "PTR2E.FIELDS.pokemonNumber.hint",
  }),
  form: new SlugField({
    required: false,
    nullable: true,
    initial: null,
    label: "PTR2E.FIELDS.pokemonForm.label",
    hint: "PTR2E.FIELDS.pokemonForm.hint",
  }),
  stats: new fields.SchemaField(
    {
      hp: new fields.NumberField({
        required: true,
        initial: 0,
        validate: (d: number) => d >= 0,
        label: `PTR2E.Attributes.hp.Label`,
      }),
      atk: new fields.NumberField({
        required: true,
        initial: 0,
        validate: (d: number) => d >= 0,
        label: `PTR2E.Attributes.atk.Label`,
      }),
      def: new fields.NumberField({
        required: true,
        initial: 0,
        validate: (d: number) => d >= 0,
        label: `PTR2E.Attributes.def.Label`,
      }),
      spa: new fields.NumberField({
        required: true,
        initial: 0,
        validate: (d: number) => d >= 0,
        label: `PTR2E.Attributes.spa.Label`,
      }),
      spd: new fields.NumberField({
        required: true,
        initial: 0,
        validate: (d: number) => d >= 0,
        label: `PTR2E.Attributes.spd.Label`,
      }),
      spe: new fields.NumberField({
        required: true,
        initial: 0,
        validate: (d: number) => d >= 0,
        label: `PTR2E.Attributes.spe.Label`,
      }),
    },
    { label: "PTR2E.FIELDS.stats.label" }
  ),
  types: new fields.SetField(
    new SlugField({
      required: true,
      choices: getTypes().reduce<Record<string, string>>((acc, type) => ({ ...acc, [type]: type }), {}),
      initial: PTRCONSTS.Types.UNTYPED,
      label: "PTR2E.FIELDS.pokemonType.label",
    }),
    {
      initial: ["untyped"],
      label: "PTR2E.FIELDS.pokemonType.labelPlural",
      hint: "PTR2E.FIELDS.pokemonType.hintPlural",
      required: true,
      validate: (d: Iterable<string>) =>
        d instanceof Set ? d.size > 0 : Array.isArray(d) ? d.length > 0 : false,
      validationError: "PTR2E.Errors.PokemonType",
    }
  ),
  size: new fields.SchemaField({
    category: new SlugField({
      required: true,
      initial: "medium",
      blank: false,
      label: "PTR2E.FIELDS.size.category.label",
      hint: "PTR2E.FIELDS.size.category.hint",
    }),
    type: new SlugField({
      required: true,
      initial: "height",
      blank: false,
      label: "PTR2E.FIELDS.size.type.label",
      hint: "PTR2E.FIELDS.size.type.hint",
    }),
    height: new fields.NumberField({
      required: true,
      initial: 0,
      integer: false,
      label: "PTR2E.FIELDS.size.height.label",
      hint: "PTR2E.FIELDS.size.height.hint",
    }),
    weight: new fields.NumberField({
      required: true,
      initial: 0,
      integer: false,
      label: "PTR2E.FIELDS.size.weight.label",
      hint: "PTR2E.FIELDS.size.weight.hint",
    }),
  }),
  diet: new fields.SetField(new SlugField({ blank: false }), {
    required: true,
    initial: [],
    label: "PTR2E.FIELDS.diet.label",
    hint: "PTR2E.FIELDS.diet.hint",
  }),
  abilities: new fields.SchemaField({
    starting: new fields.ArrayField(new fields.SchemaField({
      slug: new SlugField({ blank: false }),
      uuid: new fields.DocumentUUIDField(),
    }), { required: true, initial: [], label: "PTR2E.FIELDS.abilities.starting.label", },),
    basic: new fields.ArrayField(new fields.SchemaField({
      slug: new SlugField({ blank: false }),
      uuid: new fields.DocumentUUIDField(),
    }), { required: true, initial: [], label: "PTR2E.FIELDS.abilities.basic.label", },),
    advanced: new fields.ArrayField(new fields.SchemaField({
      slug: new SlugField({ blank: false }),
      uuid: new fields.DocumentUUIDField(),
    }), { required: true, initial: [], label: "PTR2E.FIELDS.abilities.advanced.label", },),
    master: new fields.ArrayField(new fields.SchemaField({
      slug: new SlugField({ blank: false }),
      uuid: new fields.DocumentUUIDField(),
    }), { required: true, initial: [], label: "PTR2E.FIELDS.abilities.master.label", },),
  }),
  movement: new fields.SchemaField({
    primary: new fields.ArrayField(
      new fields.SchemaField({
        type: new SlugField({
          required: true,
          blank: true,
          nullable: false,
          initial: "",
        }),
        value: new fields.NumberField({ required: true, min: 0 }),
      }),
      {
        required: true,
        initial: [],
        label: "PTR2E.FIELDS.movement.primary.label",
      }
    ),
    secondary: new fields.ArrayField(
      new fields.SchemaField({
        type: new SlugField({
          required: true,
          blank: true,
          nullable: false,
          initial: "",
        }),
        value: new fields.NumberField({ required: true, min: 0 }),
      }),
      {
        required: true,
        initial: [],
        label: "PTR2E.FIELDS.movement.secondary.label",
      }
    ),
  }),
  skills: new CollectionField(new fields.EmbeddedDataField(SkillPTR2e), "slug", {
    initial: getInitialSkillList,
  }),
  moves: new fields.SchemaField({
    levelUp: new fields.ArrayField(new fields.SchemaField({
      name: new SlugField({ required: true }),
      uuid: new fields.DocumentUUIDField({ required: true, type: "Item", embedded: false }),
      gen: new SlugField({ required: false, blank: true }),
      level: new fields.NumberField({ required: true, nullable: false, min: 0, initial: 0 })
    }), { required: true, initial: [] }),
    tutor: new fields.ArrayField(new fields.SchemaField({
      name: new SlugField({ required: true }),
      uuid: new fields.DocumentUUIDField({ required: true, type: "Item", embedded: false }),
      gen: new SlugField({ required: false, blank: true })
    }), { required: true, initial: [] }),
  }),
  captureRate: new fields.NumberField({
    required: true,
    initial: 0,
    min: 0,
    max: 255,
    label: "PTR2E.FIELDS.captureRate.label",
    hint: "PTR2E.FIELDS.captureRate.hint",
  }),
  eggGroups: new fields.SetField(new SlugField({ blank: false }), {
    required: true,
    initial: [],
    label: "PTR2E.FIELDS.eggGroups.label",
    hint: "PTR2E.FIELDS.eggGroups.hint",
  }),
  genderRatio: new fields.NumberField({
    required: true,
    initial: -1,
    min: -1,
    max: 8,
    label: "PTR2E.FIELDS.genderRatio.label",
    hint: "PTR2E.FIELDS.genderRatio.hint",
  }),
  habitats: new fields.SetField(new SlugField({ blank: false }), {
    required: true,
    initial: [],
    label: "PTR2E.FIELDS.habitats.label",
    hint: "PTR2E.FIELDS.habitats.hint",
  }),
  evolutions: new fields.EmbeddedDataField(EvolutionData, {
    required: true,
    nullable: true,
    initial: null,
  })
}

export { SpeciesSystem, type EvolutionData };