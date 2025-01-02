import type { PerkPTR2e, SpeciesPTR2e } from "@item";
import { HasDescription, HasEmbed, HasMigrations, HasSlug, HasTraits, PTRCONSTS, Trait } from "@module/data/index.ts";
import { getTypes } from "@scripts/config/effectiveness.ts";
import { SlugField } from "@module/data/fields/slug-field.ts";
import SkillPTR2e from "@module/data/models/skill.ts";
import { CollectionField } from "@module/data/fields/collection-field.ts";
import type { TraitsSchema } from "@module/data/mixins/has-traits.ts";
import type { MigrationSchema } from "@module/data/mixins/has-migrations.ts";
import type { DescriptionSchema } from "@module/data/mixins/has-description.ts";
import type { SlugSchema } from "@module/data/mixins/has-slug.ts";
import { getInitialSkillList } from "@scripts/config/skills.ts";
import type { PredicateStatement } from "@system/predication/predication.ts";
import { Predicate } from "@system/predication/predication.ts";
import { ImageResolver, sluggify } from "@utils";
import type { PerkSchema } from "./perk.ts";
import type PerkSystem from "./perk.ts";

const speciesSchema = (() => {
  const fields = foundry.data.fields;

  function getMoveField(hasLevel = false) {
    const innerFields: foundry.data.fields.DataSchema = {
      name: new SlugField({ required: true }),
      uuid: new fields.DocumentUUIDField({ required: true, type: "Item", embedded: false }),
      gen: new SlugField({ required: false, blank: true }),
    };
    if (hasLevel) innerFields.level = new fields.NumberField({ required: true, min: 0, initial: 0 });
    return new fields.SchemaField(innerFields)
  }

  return {
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
          validate: (d: number) => (d as number) >= 0,
          label: `PTR2E.Attributes.hp.Label`,
        }),
        atk: new fields.NumberField({
          required: true,
          initial: 0,
          validate: (d: number) => (d as number) >= 0,
          label: `PTR2E.Attributes.atk.Label`,
        }),
        def: new fields.NumberField({
          required: true,
          initial: 0,
          validate: (d: number) => (d as number) >= 0,
          label: `PTR2E.Attributes.def.Label`,
        }),
        spa: new fields.NumberField({
          required: true,
          initial: 0,
          validate: (d: number) => (d as number) >= 0,
          label: `PTR2E.Attributes.spa.Label`,
        }),
        spd: new fields.NumberField({
          required: true,
          initial: 0,
          validate: (d: number) => (d as number) >= 0,
          label: `PTR2E.Attributes.spd.Label`,
        }),
        spe: new fields.NumberField({
          required: true,
          initial: 0,
          validate: (d: number) => (d as number) >= 0,
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
        validate: (d: Set<unknown> | unknown[]) =>
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
          value: new fields.NumberField({ required: true, nullable: false, min: 0 }),
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
          value: new fields.NumberField({ required: true, nullable: false, min: 0 }),
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
    })
  };
})()

export type SpeciesSchema = typeof speciesSchema & TraitsSchema & MigrationSchema & DescriptionSchema & SlugSchema;

/**
 * @category Item Data Models
 */
export default class SpeciesSystem extends HasEmbed(
  HasMigrations(HasTraits(HasDescription(HasSlug(foundry.abstract.TypeDataModel<SpeciesSchema, Item.ConfiguredInstance>)))),
  "species"
) {
  /**
   * @internal
   */
  // declare parent: SpeciesPTR2e;

  declare virtual: boolean;

  constructor(data: foundry.abstract.DataModel.ConstructorData<SpeciesSchema>, options: foundry.abstract.DataModel.DataValidationOptions<Item.ConfiguredInstance> & { virtual?: boolean }) {
    super(data, options);

    this.virtual = options?.virtual ?? false;
  }

  static override defineSchema(): SpeciesSchema {
    return {
      ...super.defineSchema() as TraitsSchema & MigrationSchema & DescriptionSchema & SlugSchema,
      ...speciesSchema
    };
  }

  static override migrateData(source: foundry.data.fields.SchemaField.InnerPersistedType<SpeciesSchema>) {
    if (source.abilities) {
      for (const abGroup of Object.keys(source.abilities)) {
        source.abilities[abGroup as keyof typeof source.abilities] = (source.abilities[abGroup as keyof typeof source.abilities]).map(g => {
          if (typeof g == "object") return g;
          return { slug: g, uuid: null };
        });
      }
    }
    return super.migrateData(source);
  }

  public static getSpeciesSize(height: number, type: "height" | "quad" | "length"): { sizeClass: number; sizeCategory: "Diminutive" | "Tiny" | "Small" | "Medium" | "Large" | "Huge" | "Gigantic" | "Titanic" | "Max"; } {
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

  override prepareBaseData(): void {
    super.prepareBaseData();

    if (!this.evolutions) {
      this.evolutions = new EvolutionData({
        name: this.parent.slug,
        uuid: this.parent.flags.core?.sourceId ?? this.parent.uuid,
        methods: [],
        evolutions: null,
        perk: { x: 15, y: 15 }
      });
    }

    this.moves.levelUp = this.moves.levelUp.sort((a, b) => {
      const levelDifference = a.level - b.level;
      if (levelDifference !== 0) return levelDifference;
      return a.name.localeCompare(b.name);
    });
    this.moves.tutor = this.moves.tutor.sort((a, b) => a.name.localeCompare(b.name));

    const { sizeClass, sizeCategory } = SpeciesSystem.getSpeciesSize(this.size.height, this.size.type as "height" | "quad" | "length");

    this.size.sizeClass = sizeClass
    this.size.category = sizeCategory;

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

    // update traits with pokemon types
    for (const ptype of this.types) {
      if (!this.traits.has(ptype) && Trait.isValid(ptype)) {
        this.addTraitFromSlug(ptype, true);
      }
    }
    // check if the species is an underdog
    if (Object.values(this.stats).reduce((a: unknown, b: unknown) => (a as number) + (b as number), 0) as number < 510) {
      this.addTraitFromSlug("underdog", true);
    }
  }

  get shiny(): boolean {
    if (!this.parent.actor) return false;
    return this.parent.actor.system.shiny;
  }

  get allEvolutions(): EvolutionData[] {
    if (!this.evolutions) return [];

    const evolutions: EvolutionData[] = [this.evolutions];
    function recursiveEvolutions(data: EvolutionData) {
      if (!data.evolutions) return;
      for (const evolution of data.evolutions as EvolutionData[]) {
        evolutions.push(evolution);
        recursiveEvolutions(evolution);
      }
    }
    recursiveEvolutions(this.evolutions);
    return evolutions;
  }

  private async createEvolutionPerk(evolution: EvolutionData, isShiny = this.shiny): Promise<foundry.abstract.DataModel.ConstructorDataFor<Item.ConfiguredInstance> & {
    system: foundry.abstract.DataModel.ConstructorData<PerkSchema>
  }> {

    const img = await (async (): Promise<string> => {
      const species = await fromUuid<Item.ConfiguredInstance>(evolution.uuid as ItemUUID) as SpeciesPTR2e | null;
      if (!species) return this.parent?.img ?? `systems/ptr2e/img/icons/species_icon.webp`;

      const config = game.ptr.data.artMap.get(species.slug);
      if (!config) return this.parent?.img ?? `systems/ptr2e/img/icons/species_icon.webp`;

      const resolver = await ImageResolver.createFromSpeciesData({
        dexId: species.system.number!,
        shiny: isShiny,
        forms: []
      }, config);
      return resolver?.result ?? this.parent?.img ?? `systems/ptr2e/img/icons/species_icon.webp`;
    })();

    return {
      name: `Evolution: ${Handlebars.helpers.capitalizeFirst(evolution.name)}`,
      type: "perk",
      img,
      flags: {
        ptr2e: {
          evolution: {
            name: evolution.name,
            uuid: evolution.uuid,
          }
        }
      },
      system: {
        prerequisites: SpeciesSystem.evolutionMethodsToPredicate(evolution.methods),
        cost: 0,
        global: false,
        webs: [this.evolutions!.uuid],
        nodes: [
          {
            x: evolution.perk.x,
            y: evolution.perk.y,
            type: this.evolutions === evolution ? "root" : "normal",
            connected: new Set(),
          }
        ]
      }
    }
  }

  async getEvolutionPerks(isShiny = this.shiny): Promise<PerkPTR2e[]> {
    if (!this.evolutions) return [];
    async function* recursiveEvolution(data: EvolutionData, depth = 0): AsyncGenerator<[EvolutionData, number]> {
      yield [data, depth];
      if (!data.evolutions) return;
      const currentDepth = depth + 1
      for (const evolution of data.evolutions) {
        yield* recursiveEvolution(evolution as EvolutionData, currentDepth);
      }
    }

    const takenCoordinates = new Set<`${number}-${number}`>();

    const perks: foundry.abstract.DataModel.ConstructorDataFor<Item.ConfiguredInstance>[] = [];
    const perksByDepth: Record<number, foundry.abstract.DataModel.ConstructorDataFor<Item.ConfiguredInstance>[]> = {};
    const previousPerks: foundry.abstract.DataModel.ConstructorDataFor<Item.ConfiguredInstance>[] = [];
    const nextPerks: foundry.abstract.DataModel.ConstructorDataFor<Item.ConfiguredInstance>[] = [];
    let lastDepth = 0;

    const evolutions = this.evolutions ? this.evolutions : {
      name: this.parent.slug,
      uuid: this.parent.flags?.core?.sourceId ?? this.parent.uuid,
    } as EvolutionData;
    if (!evolutions.uuid) evolutions.uuid = this.parent.flags?.core?.sourceId ?? this.parent.uuid;

    for await (const [evolution, depth] of recursiveEvolution(evolutions)) {
      const data = await this.createEvolutionPerk(evolution, isShiny);
      (data.flags!.ptr2e!.evolution as Record<string, unknown>).tier = depth;

      const node = (data.system?.nodes as PerkSystem["nodes"])[0]
      const coords = (() => {
        if (!takenCoordinates.has(`${node.x!}-${node.y!}`)) return [node.x!, node.y!];
        let x = node.x!;
        let y = node.y!;
        let positive = true;
        let counter = 0;
        while (takenCoordinates.has(`${x}-${y}`)) {
          y = 15 - (2 * depth);
          x = positive
            ? 15 + (2 * counter)
            : 15 + (-2 * (counter + 1));

          if (positive) positive = false;
          else {
            counter++;
            positive = true;
          };

          if (counter > 7) break;
        }
        return [x, y];
      })()
      node.x = coords[0];
      node.y = coords[1];
      takenCoordinates.add(`${node.x}-${node.y}`);

      if (lastDepth >= depth) {
        lastDepth = depth;
        const perks: foundry.abstract.DataModel.ConstructorDataFor<Item.ConfiguredInstance>[] = perksByDepth[depth - 1] ?? [];
        previousPerks.splice(0, previousPerks.length, ...perks);
        nextPerks.splice(0, nextPerks.length, data);
      }
      else {
        lastDepth = depth;
        previousPerks.splice(0, previousPerks.length, ...nextPerks);
        nextPerks.splice(0, nextPerks.length, data);
      }

      for (const perkData of previousPerks) {
        ((data.system?.nodes as PerkSystem["nodes"])[0].connected as Set<string>).add(sluggify(perkData.name!));
        (((perkData.system as PerkSystem)?.nodes as PerkSystem["nodes"])[0].connected as Set<string>).add(sluggify(data.name!));
      }

      perks.push(data);
      perksByDepth[depth] ??= [];
      perksByDepth[depth].push(data);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return perks.toReversed().map(data => new CONFIG.Item.documentClass(data as any) as PerkPTR2e);
  }

  static evolutionMethodsToPredicate(methods: EvolutionData["methods"]): Predicate {
    const [and, or] = methods.reduce<[PredicateStatement[], PredicateStatement[]]>(([and, or], method) => {
      switch (method.type) {
        case "level": {
          const predicate = `{"gte": ["{actor|system.advancement.level}", ${method.level}]}`;

          if (method.operand === "and") and.push(predicate);
          else or.push(predicate);

          break;
        }
        case "item": {
          const item = method.item.toLowerCase();
          const predicate = `{"or": ["item:consumable:${item}","item:equipment:${item}","item:gear:${item}"]}`;

          if (method.operand === "and") and.push(predicate);
          else or.push(predicate);

          break;
        }
        case "move": {
          const predicate = `{"and": ["item:move:${method.move.toLowerCase()}"]}`;

          if (method.operand === "and") and.push(predicate);
          else or.push(predicate);

          break;
        }
        case "gender": {
          //TODO: Add gender prereq support once gender is tracked on actors
          break;
          // const predicate = ``;

          // if(method.operand === "and") and.push(predicate);
          // else or.push(predicate);

          // break;
        }
      }
      return [and, or];
    }, [[], []]);

    try {
      const andPredicate = and.length > 0 ? JSON.parse(`{"and": [${and.join(',')}]}`) : null;
      const orPredicate = or.length > 0 ? JSON.parse(`{"or": [${or.join(',')}]}`) : null;

      return andPredicate && orPredicate
        ? new Predicate(andPredicate, orPredicate)
        : andPredicate
          ? new Predicate(andPredicate)
          : orPredicate
            ? new Predicate(orPredicate)
            : new Predicate();
    } catch (error) {
      console.warn(error);
      return new Predicate();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async _preCreate(data: foundry.abstract.TypeDataModel.ParentAssignmentType<SpeciesSchema, Item.ConfiguredInstance>, options: foundry.abstract.Document.PreCreateOptions<any>, user: User): Promise<boolean | void> {
    const result = await super._preCreate(data, options, user);
    if (result === false) return false;

    if (!data.img || data.img === "icons/svg/item-bag.svg") {
      this.parent.updateSource({
        img: "systems/ptr2e/img/icons/species_icon.webp",
      });
    }
  }
}

export default interface SpeciesSystem {
  size: {
    category: string;
    type: string;
    height: number;
    weight: number;
    sizeClass: number;
    weightClass: number;
  }
  moves: {
    levelUp: { name: string; uuid: string; level: number }[];
    tutor: { name: string; uuid: string }[];
  }
}

interface TypeMethodFieldPartialSchema extends foundry.data.fields.DataSchema {
  type: foundry.data.fields.StringField<{ required: true, initial: string, choices: Record<string, string> }, "level" | "item" | "move" | "gender", "level" | "item" | "move" | "gender">;
  operand: foundry.data.fields.StringField<{ required: true, initial: string, choices: Record<string, string> }, "and" | "or", "and" | "or">;
}

interface LevelMethodFieldSchema extends TypeMethodFieldPartialSchema {
  level: foundry.data.fields.NumberField<{ required: true, min: number, max: number, initial: number }>;
}

interface GenderMethodFieldSchema extends TypeMethodFieldPartialSchema {
  gender: foundry.data.fields.StringField<{ required: true, initial: string, choices: Record<string, string> }, "male" | "female" | "genderless", "male" | "female" | "genderless">;
}

interface ItemMethodFieldSchema extends TypeMethodFieldPartialSchema {
  item: foundry.data.fields.StringField<{ required: true, initial: string }>;
  held: foundry.data.fields.BooleanField<{ required: true, initial: boolean }>;
}

interface MoveMethodFieldSchema extends TypeMethodFieldPartialSchema {
  move: foundry.data.fields.StringField<{ required: true, initial: string }>;
}

const evolutionSchema = (() => {
  const fields = foundry.data.fields;

  const getTypeField = (initial: "level" | "item" | "move" | "gender"): TypeMethodFieldPartialSchema => ({
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
  class LevelMethodField extends foundry.abstract.DataModel<LevelMethodFieldSchema> {
    static override defineSchema(): LevelMethodFieldSchema {
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
  class GenderMethodField extends foundry.abstract.DataModel<GenderMethodFieldSchema> {
    static override defineSchema(): GenderMethodFieldSchema {
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
  class ItemMethodField extends foundry.abstract.DataModel<ItemMethodFieldSchema> {
    static override defineSchema(): ItemMethodFieldSchema {
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
  class MoveMethodField extends foundry.abstract.DataModel<MoveMethodFieldSchema> {
    static override defineSchema(): MoveMethodFieldSchema {
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
    perk: new fields.SchemaField({
      x: new fields.NumberField({ required: true, initial: 15 }),
      y: new fields.NumberField({ required: true, initial: 15 }),
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
})();

export type EvolutionSchema = typeof evolutionSchema;

export class EvolutionData extends foundry.abstract.DataModel<EvolutionSchema> {
  static override defineSchema(): EvolutionSchema {
    return evolutionSchema;
  }
}