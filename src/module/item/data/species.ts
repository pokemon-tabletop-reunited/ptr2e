import { SpeciesPTR2e } from "@item";
import { HasDescription, HasEmbed, HasMigrations, HasSlug, HasTraits, PTRCONSTS } from "@module/data/index.ts";
import { PokemonType } from "@data";
import { BaseItemSourcePTR2e, ItemSystemSource } from "./system.ts";
import { getTypes } from "@scripts/config/effectiveness.ts";
import { SlugField } from "@module/data/fields/slug-field.ts";
import { ActorPTR2e } from "@actor";
import { DataSchema, SourcePropFromDataField } from "types/foundry/common/data/fields.js";
import SkillPTR2e from "@module/data/models/skill.ts";
import { CollectionField } from "@module/data/fields/collection-field.ts";
import { TraitsSchema } from "@module/data/mixins/has-traits.ts";
import { MigrationSchema } from "@module/data/mixins/has-migrations.ts";
import { DescriptionSchema } from "@module/data/mixins/has-description.ts";
import { SlugSchema } from "@module/data/mixins/has-slug.ts";
import { getInitialSkillList } from "@scripts/config/skills.ts";

const SpeciesExtension = HasEmbed(
  HasMigrations(HasTraits(HasDescription(HasSlug(foundry.abstract.TypeDataModel)))),
  "species"
);

/**
 * @category Item Data Models
 */
class SpeciesSystem extends SpeciesExtension {
  /**
   * @internal
   */
  declare parent: SpeciesPTR2e | ActorPTR2e;

  constructor(data?: object, options?: DataModelConstructionOptions<foundry.abstract.Document | null> & { virtual?: boolean }) {
    super(data, options);

    this.virtual = options?.virtual ?? false;
  }

  static override defineSchema(): SpeciesSchema {
    const fields = foundry.data.fields;

    function getMoveField(hasLevel: boolean): foundry.data.fields.SchemaField<MoveSchema | LevelUpMoveSchema>;
    function getMoveField(hasLevel: true): foundry.data.fields.SchemaField<LevelUpMoveSchema>;
    function getMoveField(hasLevel: false): foundry.data.fields.SchemaField<MoveSchema>
    function getMoveField(hasLevel = false): foundry.data.fields.SchemaField<MoveSchema | LevelUpMoveSchema> {
      const innerFields: Record<string, foundry.data.fields.DataField> = {
        name: new SlugField({ required: true }),
        uuid: new fields.DocumentUUIDField({ required: true, type: "Item", embedded: false }),
        gen: new SlugField({ required: false, blank: true }),
      };
      if (hasLevel) innerFields.level = new fields.NumberField({ required: true, min: 0, initial: 0 });
      return new fields.SchemaField(innerFields) as foundry.data.fields.SchemaField<MoveSchema | LevelUpMoveSchema>;
    }

    return {
      ...super.defineSchema() as TraitsSchema & MigrationSchema & DescriptionSchema & SlugSchema,
      number: new fields.NumberField({
        required: true,
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
            validate: (d) => (d as number) >= 0,
            label: `PTR2E.Attributes.hp.Label`,
          }),
          atk: new fields.NumberField({
            required: true,
            initial: 0,
            validate: (d) => (d as number) >= 0,
            label: `PTR2E.Attributes.atk.Label`,
          }),
          def: new fields.NumberField({
            required: true,
            initial: 0,
            validate: (d) => (d as number) >= 0,
            label: `PTR2E.Attributes.def.Label`,
          }),
          spa: new fields.NumberField({
            required: true,
            initial: 0,
            validate: (d) => (d as number) >= 0,
            label: `PTR2E.Attributes.spa.Label`,
          }),
          spd: new fields.NumberField({
            required: true,
            initial: 0,
            validate: (d) => (d as number) >= 0,
            label: `PTR2E.Attributes.spd.Label`,
          }),
          spe: new fields.NumberField({
            required: true,
            initial: 0,
            validate: (d) => (d as number) >= 0,
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
          validate: (d) =>
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
        starting: new fields.SetField(new fields.SchemaField({
            slug: new SlugField({ blank: false }), 
            uuid: new fields.DocumentUUIDField(),
        }), { required: true, initial: [], label: "PTR2E.FIELDS.abilities.starting.label", },),
        basic: new fields.SetField(new fields.SchemaField({
            slug: new SlugField({ blank: false }), 
            uuid: new fields.DocumentUUIDField(),
        }), { required: true, initial: [], label: "PTR2E.FIELDS.abilities.basic.label", },),
        advanced: new fields.SetField(new fields.SchemaField({
            slug: new SlugField({ blank: false }), 
            uuid: new fields.DocumentUUIDField(),
        }), { required: true, initial: [], label: "PTR2E.FIELDS.abilities.advanced.label", },),
        master: new fields.SetField(new fields.SchemaField({
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
        levelUp: new fields.ArrayField(getMoveField(true), { required: true, initial: [] }),
        tutor: new fields.ArrayField(getMoveField(false), { required: true, initial: [] }),
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
      }),
    };
  }

  override prepareBaseData(): void {
    super.prepareBaseData();

    this.moves.levelUp = this.moves.levelUp.sort((a, b) => {
      const levelDifference = a.level - b.level;
      if (levelDifference !== 0) return levelDifference;
      return a.name.localeCompare(b.name);
    });
    this.moves.tutor = this.moves.tutor.sort((a, b) => a.name.localeCompare(b.name));

    this.size.sizeClass = (() => {
      const height = this.size.height;
      switch (this.size.type) {
        case "height": {
          switch (true) {
            case height < 0.3048:
              return 1;
            case height < 0.6858:
              return 2;
            case height < 1.3208:
              return 3;
            case height < 3.048:
              return 4;
            case height < 5.4864:
              return 5;
            case height < 10.9728:
              return 6;
            case height < 16.4592:
              return 7;
            default:
              return 8;
          }
        }
        case "quad": {
          switch (true) {
            case height < 0.1512:
              return 1;
            case height < 0.3402:
              return 2;
            case height < 0.6551:
              return 3;
            case height < 1.5118:
              return 4;
            case height < 2.7213:
              return 5;
            case height < 5.4425:
              return 6;
            case height < 8.1638:
              return 7;
            default:
              return 8;
          }
        }
        case "length": {
          switch (true) {
            case height < 0.5073:
              return 1;
            case height < 1.1413:
              return 2;
            case height < 2.1981:
              return 3;
            case height < 5.0725:
              return 4;
            case height < 9.1305:
              return 5;
            case height < 18.2611:
              return 6;
            case height < 27.3916:
              return 7;
            default:
              return 8;
          }
        }
        default:
          return 8;
      }
    })();
    this.size.category = (() => {
      switch (this.size.sizeClass) {
        case 1:
          return "Diminutive";
        case 2:
          return "Tiny";
        case 3:
          return "Small";
        case 4:
          return "Medium";
        case 5:
          return "Large";
        case 6:
          return "Huge";
        case 7:
          return "Gigantic";
        case 8:
          return "Titanic";
        default:
          return "Max";
      }
    })();
    this.size.weightClass = (() => {
      switch (true) {
        case this.size.weight < 10:
          return 1;
        case this.size.weight < 20:
          return 2;
        case this.size.weight < 30:
          return 3;
        case this.size.weight < 40:
          return 4;
        case this.size.weight < 55:
          return 5;
        case this.size.weight < 70:
          return 6;
        case this.size.weight < 85:
          return 7;
        case this.size.weight < 100:
          return 8;
        case this.size.weight < 120:
          return 9;
        case this.size.weight < 145:
          return 10;
        case this.size.weight < 190:
          return 11;
        case this.size.weight < 240:
          return 12;
        case this.size.weight < 305:
          return 13;
        case this.size.weight < 350:
          return 14;
        case this.size.weight < 410:
          return 15;
        default:
          return 16;
      }
    })();
  }

  override async _preCreate(
    data: this["parent"]["_source"],
    options: DocumentModificationContext<this["parent"]["parent"]>,
    user: User
  ): Promise<boolean | void> {
    const result = await super._preCreate(data, options, user);
    if (result === false) return false;

    if (!data.img || data.img === "icons/svg/item-bag.svg") {
      this.parent.updateSource({
        img: "/systems/ptr2e/img/icons/species_icon.webp",
      });
    }
  }
}

export class EvolutionData extends foundry.abstract.DataModel {
  static override defineSchema(): foundry.data.fields.DataSchema {
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
    class LevelMethodField extends foundry.abstract.DataModel {
      static override defineSchema(): DataSchema {
        const fields = foundry.data.fields;
        return {
          ...getTypeField("level"),
          level: new fields.NumberField({
            required: true,
            min: 1,
            max: 100,
            initial: 20,
          }),
        };
      }
    }
    // Must have a certain gender
    class GenderMethodField extends foundry.abstract.DataModel {
      static override defineSchema(): DataSchema {
        const fields = foundry.data.fields;
        return {
          ...getTypeField("gender"),
          gender: new fields.StringField({
            required: true,
            choices: ["male", "female", "genderless"].reduce<Record<string, string>>((acc, gender) => ({ ...acc, [gender]: gender }), {}),
            initial: "genderless"
          }),
        };
      }
    }
    // Must hold/use a certain item
    class ItemMethodField extends foundry.abstract.DataModel {
      static override defineSchema(): DataSchema {
        const fields = foundry.data.fields;
        return {
          ...getTypeField("item"),
          item: new fields.StringField({ required: true, initial: "" }),
          // If true the item must be held, otherwise it must be used.
          held: new fields.BooleanField({ required: true, initial: false }),
        };
      }
    }
    // Must know a certain move
    class MoveMethodField extends foundry.abstract.DataModel {
      static override defineSchema(): DataSchema {
        const fields = foundry.data.fields;
        return {
          ...getTypeField("move"),
          move: new fields.StringField({ required: true, initial: "" }),
        };
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
}

export interface EvolutionData extends foundry.abstract.DataModel {
  name: string;
  uuid: string;
  methods: ({
    operand: "and" | "or";
  } & (
      | {
        type: "level";
        level: number;
      }
      | {
        type: "item";
        item: string;
      }
      | {
        type: "move";
        move: string;
      }
      | {
        type: "gender";
        gender: "male" | "female" | "genderless";
      }
    ))[];
  evolutions: EvolutionData[] | null;
}

interface SpeciesSystem extends ModelPropsFromSchema<SpeciesSchema> {
  _source: SourceFromSchema<SpeciesSchema>;

  size: ModelPropsFromSchema<SizeSchema> & {
    sizeClass: number;
    weightClass: number;
    category: "Diminutive" | "Tiny" | "Small" | "Medium" | "Large" | "Huge" | "Gigantic" | "Titanic" | "Max";
  };
  // /**
  //  * The # number of the species in the Pokedex.
  //  */
  // number: number;

  // /**
  //  * The form of the species.
  //  */
  // form: string | null;

  // /**
  //  * The stats of the species.
  //  */
  // stats: {
  //     hp: number;
  //     atk: number;
  //     def: number;
  //     spa: number;
  //     spd: number;
  //     spe: number;
  // };

  // captureRate: number;

  // /**
  //  * The typing of the effect.
  //  * @remarks
  //  * This is the type of the attack, which is used to determine the effectiveness of the attack.
  //  * @defaultValue `'untyped'`
  //  */
  // types: Set<PokemonType>;

  // size: {
  //     /** quadraped / height measurement */
  //     type: "height" | "quad" | "length";

  //     height: number;
  //     weight: number;

  //     sizeClass: number;
  //     weightClass: number;
  //     category: "Diminutive" | "Tiny" | "Small" | "Medium" | "Large" | "Huge" | "Gigantic" | "Titanic" | "Max";
  // };

  // diet: string[];

  // moves: {
  //     levelUp: { name: string; uuid: string; gen?: string, level: number }[];
  //     tutor: { name: string; uuid: string; gen?: string }[];
  // };

  // abilities: {
  //     starting: string[];
  //     basic: string[];
  //     advanced: string[];
  //     master: string[];
  // };

  // movement: {
  //     primary: { type: string; value: number }[];
  //     secondary: { type: string; value: number }[];
  // };

  // evolutions: EvolutionData;

  // skills: Collection<SkillPTR2e>;

  // virtual: boolean;
}

export interface SpeciesSchema extends foundry.data.fields.DataSchema, TraitsSchema, MigrationSchema, DescriptionSchema, SlugSchema {
  number: foundry.data.fields.NumberField<number, number, true, false, true>;
  form: SlugField<string, string, false, true, true>;
  stats: foundry.data.fields.SchemaField<StatsSchema, SourceFromSchema<StatsSchema>, ModelPropsFromSchema<StatsSchema>>;
  types: foundry.data.fields.SetField<SlugField<string, string, true, false, true>, PokemonType[], Set<PokemonType>, true, false, true>;
  size: foundry.data.fields.SchemaField<SizeSchema, SourceFromSchema<SizeSchema>, ModelPropsFromSchema<SizeSchema>>;
  diet: foundry.data.fields.SetField<SlugField<string, string, true, false, true>, string[], Set<string>, true, false, true>;
  abilities: foundry.data.fields.SchemaField<AbilitySchema, SourceFromSchema<AbilitySchema>, ModelPropsFromSchema<AbilitySchema>>;
  movement: foundry.data.fields.SchemaField<MovementSchema, SourceFromSchema<MovementSchema>, ModelPropsFromSchema<MovementSchema>>;
  skills: CollectionField<foundry.data.fields.EmbeddedDataField<SkillPTR2e>>;
  moves: foundry.data.fields.SchemaField<MovesSchema, SourceFromSchema<MovesSchema>, ModelPropsFromSchema<MovesSchema>>;
  captureRate: foundry.data.fields.NumberField<number, number, true, false, true>;
  eggGroups: foundry.data.fields.SetField<SlugField<string, string, true, false, true>, string[], Set<string>, true, false, true>;
  genderRatio: foundry.data.fields.NumberField<number, number, true, false, true>;
  habitats: foundry.data.fields.SetField<SlugField<string, string, true, false, true>, string[], Set<string>, true, false, true>;
  evolutions: foundry.data.fields.EmbeddedDataField<EvolutionData, true, true, true>;
}

interface StatsSchema extends foundry.data.fields.DataSchema {
  hp: foundry.data.fields.NumberField<number, number, true, false, true>;
  atk: foundry.data.fields.NumberField<number, number, true, false, true>;
  def: foundry.data.fields.NumberField<number, number, true, false, true>;
  spa: foundry.data.fields.NumberField<number, number, true, false, true>;
  spd: foundry.data.fields.NumberField<number, number, true, false, true>;
  spe: foundry.data.fields.NumberField<number, number, true, false, true>;
}

interface SizeSchema extends foundry.data.fields.DataSchema {
  category: SlugField<string, string, true, false, true>;
  type: SlugField<string, string, true, false, true>;
  height: foundry.data.fields.NumberField<number, number, true, false, true>;
  weight: foundry.data.fields.NumberField<number, number, true, false, true>;
}

interface AbilitySchema extends foundry.data.fields.DataSchema {
  starting: foundry.data.fields.SetField<foundry.data.fields.SchemaField<AbilityReferenceSchema>, foundry.data.fields.SourcePropFromDataField<foundry.data.fields.SchemaField<AbilityReferenceSchema>>[], Set<foundry.data.fields.ModelPropFromDataField<foundry.data.fields.SchemaField<AbilityReferenceSchema>>>, true, false, true>;
  basic: foundry.data.fields.SetField<foundry.data.fields.SchemaField<AbilityReferenceSchema>, foundry.data.fields.SourcePropFromDataField<foundry.data.fields.SchemaField<AbilityReferenceSchema>>[], Set<foundry.data.fields.ModelPropFromDataField<foundry.data.fields.SchemaField<AbilityReferenceSchema>>>, true, false, true>;;
  advanced: foundry.data.fields.SetField<foundry.data.fields.SchemaField<AbilityReferenceSchema>, foundry.data.fields.SourcePropFromDataField<foundry.data.fields.SchemaField<AbilityReferenceSchema>>[], Set<foundry.data.fields.ModelPropFromDataField<foundry.data.fields.SchemaField<AbilityReferenceSchema>>>, true, false, true>;;
  master: foundry.data.fields.SetField<foundry.data.fields.SchemaField<AbilityReferenceSchema>, foundry.data.fields.SourcePropFromDataField<foundry.data.fields.SchemaField<AbilityReferenceSchema>>[], Set<foundry.data.fields.ModelPropFromDataField<foundry.data.fields.SchemaField<AbilityReferenceSchema>>>, true, false, true>;;
}

interface AbilityReferenceSchema extends foundry.data.fields.DataSchema {
    slug: SlugField<string, string, true, false, true>,
    uuid: foundry.data.fields.DocumentUUIDField<"Item", true, false, false>
}

interface MovementSchema extends foundry.data.fields.DataSchema {
  primary: foundry.data.fields.ArrayField<
    foundry.data.fields.SchemaField<MovementTypeSchema, SourceFromSchema<MovementTypeSchema>, ModelPropsFromSchema<MovementTypeSchema>>,
    SourcePropFromDataField<MovementTypeSchema>[],
    ModelPropsFromSchema<MovementTypeSchema>[],
    true,
    false,
    true
  >;
  secondary: foundry.data.fields.ArrayField<
    foundry.data.fields.SchemaField<MovementTypeSchema, SourceFromSchema<MovementTypeSchema>, ModelPropsFromSchema<MovementTypeSchema>>,
    SourcePropFromDataField<MovementTypeSchema>[],
    ModelPropsFromSchema<MovementTypeSchema>[],
    true,
    false,
    true
  >;
}

interface MovementTypeSchema extends foundry.data.fields.DataSchema {
  type: SlugField<string, string, true, false, true>;
  value: foundry.data.fields.NumberField<number, number, true, false, false>;
}

interface MovesSchema extends foundry.data.fields.DataSchema {
  levelUp: foundry.data.fields.ArrayField<
    foundry.data.fields.SchemaField<LevelUpMoveSchema, SourceFromSchema<LevelUpMoveSchema>, ModelPropsFromSchema<LevelUpMoveSchema>>,
    SourcePropFromDataField<LevelUpMoveSchema>[],
    ModelPropsFromSchema<LevelUpMoveSchema>[],
    true,
    false,
    true
  >;
  tutor: foundry.data.fields.ArrayField<
    foundry.data.fields.SchemaField<MoveSchema, SourceFromSchema<MoveSchema>, ModelPropsFromSchema<MoveSchema>>,
    SourcePropFromDataField<MoveSchema>[],
    ModelPropsFromSchema<MoveSchema>[],
    true,
    false,
    true
  >;
}

export interface LevelUpMoveSchema extends MoveSchema {
  level: foundry.data.fields.NumberField<number, number, true, false, true>;
}

interface MoveSchema extends foundry.data.fields.DataSchema {
  name: SlugField<string, string, true, false, true>;
  uuid: foundry.data.fields.DocumentUUIDField<string, true, false, true>;
  gen: SlugField<string, string, false, true, true>;
}

export default SpeciesSystem;

export type SpeciesSource = BaseItemSourcePTR2e<"species", SpeciesSystemSource>;

interface SpeciesSystemSource extends Omit<ItemSystemSource, "container" | "actions"> {
  number: number;
  form: string | null;
  stats: {
    hp: number;
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
  };
  types: PokemonType[];

  size: {
    /** small, huge, medium etc. */
    category: string;
    /** quadraped / height measurement */
    type: string;
  };

  diet: string[];
  habitat: string[];
  eggGroups: string[];

  abilities: {
    starting: string[];
    basic: string[];
    advanced: string[];
    master: string[];
  };

  moves: {
    levelUp: { name: string; uuid: string; gen?: string, level: number }[];
    tutor: { name: string; uuid: string; gen?: string }[];
  }

  movement: {
    primary: { type: string; value: number }[];
    secondary: { type: string; value: number }[];
  };

  genderRatio: number; // 0-8, -1 for genderless

  evolutions: EvolutionData;

  skills: SkillPTR2e["_source"][];
}
