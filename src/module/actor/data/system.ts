/* eslint-disable no-fallthrough */
import { HasTraits, HasMigrations, PokemonType, ClockPTR2e, Trait } from "@data";
import { getTypes, TypeEffectiveness } from "@scripts/config/effectiveness.ts";
import {
  ActorPTR2e,
  Attribute,
  Attributes,
} from "@actor";
import { SpeciesSystemModel } from "@item/data/index.ts";
import { getInitialSkillList } from "@scripts/config/skills.ts";
import { CollectionField } from "@module/data/fields/collection-field.ts";
import SkillPTR2e from "@module/data/models/skill.ts";
import natureToStatArray, { natures } from "@scripts/config/natures.ts";
import { SlugField } from "@module/data/fields/slug-field.ts";
import { TraitsSchema } from "@module/data/mixins/has-traits.ts";
import { MigrationSchema } from "@module/data/mixins/has-migrations.ts";
import { ActorSystemSchema, AttributeSchema, StatSchema, TypeField, GenderOptions, AttributesSchema, AdvancementSchema, Movement } from "./data.ts";
import { addDataFieldMigration, sluggify } from "@utils";
import { AbilityReferenceSchema } from "@item/data/species.ts";

class ActorSystemPTR2e extends HasMigrations(HasTraits(foundry.abstract.TypeDataModel)) {
  static LOCALIZATION_PREFIXES = ["PTR2E.ActorSystem"];

  declare parent: ActorPTR2e<this>;

  modifiers: Record<string, number | undefined> = {};

  static override defineSchema(): ActorSystemSchema {
    const fields = foundry.data.fields;

    function getAttributeField(slug: string, withStage?: boolean): AttributeSchema;
    function getAttributeField(slug: string, withStage: true): AttributeSchema;
    function getAttributeField(slug: string, withStage: false): Omit<AttributeSchema, "stage">;
    function getAttributeField(slug: string, withStage = true): AttributeSchema | Omit<AttributeSchema, "stage"> {
      return {
        ...getStatField(slug, withStage),
        evs: new fields.NumberField({
          required: true,
          label: `PTR2E.Attributes.${slug}.Label`,
          initial: 0,
          min: 0,
          max: 200,
          step: 4,
          validate: (d) =>
            (d as number) >= 0 && (d as number) <= 200 && (d as number) % 4 === 0,
        }),
        ivs: new fields.NumberField({
          required: true,
          initial: 0,
          validate: (d) => (d as number) >= 0,
        }),
        base: new fields.NumberField({
          required: false,
          initial: undefined,
          validate: (d) => d === undefined || (d as number) >= 1,
        }),
      };
    };

    function getStatField(slug: string, withStage?: boolean): StatSchema;
    function getStatField(slug: string, withStage: true): StatSchema;
    function getStatField(slug: string, withStage: false): Omit<StatSchema, "stage">;
    function getStatField(slug: string, withStage = true): StatSchema | Omit<StatSchema, "stage"> {
      const output: Partial<StatSchema> = {
        slug: new SlugField({ required: true, initial: slug }),
      };
      if (withStage)
        output.stage = new fields.NumberField({
          required: true,
          initial: 0,
          validate: (d) => (d as number) >= -6 && (d as number) <= 6,
          label: `PTR2E.Attributes.${slug}.Stage.Label`,
          hint: `PTR2E.Attributes.${slug}.Stage.Hint`,
        });
      return output as StatSchema | Omit<StatSchema, "stage">;
    };

    return {
      ...super.defineSchema() as MigrationSchema & TraitsSchema,
      advancement: new fields.SchemaField({
        experience: new fields.SchemaField({
          current: new fields.NumberField({
            required: true,
            initial: 0,
            min: 0,
            label: "PTR2E.FIELDS.experience.current.label",
            hint: "PTR2E.FIELDS.experience.current.hint",
          }),
          next: new fields.NumberField({
            required: true,
            initial: 0,
            min: 0,
            label: "PTR2E.FIELDS.experience.next.label",
            hint: "PTR2E.FIELDS.experience.next.hint",
          }),
          diff: new fields.NumberField({
            required: true,
            initial: 0,
            min: 0,
            label: "PTR2E.FIELDS.experience.diff.label",
            hint: "PTR2E.FIELDS.experience.diff.hint",
          }),
        }),
        level: new fields.NumberField({
          required: true,
          initial: 1,
          min: 1,
          max: 100,
          label: "PTR2E.FIELDS.level.label",
          hint: "PTR2E.FIELDS.level.hint",
        }),
      }),
      attributes: new fields.SchemaField({
        hp: new fields.SchemaField(getAttributeField("hp", false)),
        atk: new fields.SchemaField(getAttributeField("atk")),
        def: new fields.SchemaField(getAttributeField("def")),
        spa: new fields.SchemaField(getAttributeField("spa")),
        spd: new fields.SchemaField(getAttributeField("spd")),
        spe: new fields.SchemaField(getAttributeField("spe")),
      }),
      battleStats: new fields.SchemaField({
        evasion: new fields.SchemaField(getStatField("evasion")),
        accuracy: new fields.SchemaField(getStatField("accuracy")),
        critRate: new fields.SchemaField(getStatField("crit-rate")),
      }),
      skills: new CollectionField(new fields.EmbeddedDataField(SkillPTR2e), "slug", {
        initial: getInitialSkillList,
      }),
      biology: new fields.ObjectField(),
      capabilities: new fields.ObjectField(),
      type: new fields.SchemaField({
        types: new fields.SetField<TypeField, foundry.data.fields.SourcePropFromDataField<TypeField>[], Set<foundry.data.fields.SourcePropFromDataField<TypeField>>, true, false, true>(
          new fields.StringField<keyof TypeEffectiveness, keyof TypeEffectiveness, true, false, true>({
            required: true,
            choices: getTypes().reduce<Record<PokemonType, string>>(
              (acc, type) => ({ ...acc, [type]: type }),
              {} as Record<PokemonType, string>
            ),
            initial: "untyped",
            label: "PTR2E.FIELDS.PokemonType.Label",
            hint: "PTR2E.FIELDS.PokemonType.Hint",
          }),
          {
            initial: ["untyped"],
            label: "PTR2E.FIELDS.PokemonType.LabelPlural",
            hint: "PTR2E.FIELDS.PokemonType.HintPlural",
            required: true,
            validate: (d) =>
              d instanceof Set ? d.size > 0 : Array.isArray(d) ? d.length > 0 : false,
            validationError: "PTR2E.Errors.PokemonType",
          }
        ),
      }),
      powerPoints: new fields.SchemaField({
        value: new fields.NumberField({
          required: true,
          initial: 0,
          validate: (d) => (d as number) >= 0,
          label: "PTR2E.FIELDS.powerPoints.value.label",
          hint: "PTR2E.FIELDS.powerPoints.value.hint",
        }),
        max: new fields.NumberField({
          required: true,
          initial: 0,
          validate: (d) => (d as number) >= 0,
          label: "PTR2E.FIELDS.powerPoints.max.label",
          hint: "PTR2E.FIELDS.powerPoints.max.hint",
        }),
      }),
      health: new fields.SchemaField({
        value: new fields.NumberField({
          required: true,
          initial: 0,
          validate: (d) => (d as number) >= 0,
          label: "PTR2E.FIELDS.health.value.label",
          hint: "PTR2E.FIELDS.health.value.hint",
        }),
        max: new fields.NumberField({
          required: true,
          initial: 0,
          validate: (d) => (d as number) >= 0,
          label: "PTR2E.FIELDS.health.max.label",
          hint: "PTR2E.FIELDS.health.max.hint",
        }),
      }),
      shield: new fields.SchemaField({
        value: new fields.NumberField({
          required: true,
          initial: 0,
          validate: (d) => (d as number) >= 0,
          label: "PTR2E.FIELDS.shield.value.label",
          hint: "PTR2E.FIELDS.shield.value.hint",
        }),
        max: new fields.NumberField({
          required: true,
          initial: 0,
          validate: (d) => (d as number) >= 0,
          label: "PTR2E.FIELDS.shield.max.label",
          hint: "PTR2E.FIELDS.shield.max.hint",
        })
      }),
      money: new fields.NumberField({ required: true, initial: 0 }),
      species: new fields.SchemaField(SpeciesSystemModel.defineSchema(), {
        required: false,
        nullable: true,
        initial: null,
      }),
      shiny: new fields.BooleanField({ required: true, initial: false }),
      nature: new fields.StringField({
        required: true,
        choices: natures,
        initial: "hardy",
        label: "PTR2E.FIELDS.nature.label",
      }),
      gender: new fields.StringField<GenderOptions, GenderOptions, true, false, true>({
        required: true,
        choices: {
          "genderless": "genderless",
          "male": "male",
          "female": "female"
        },
        initial: "genderless"
      }),
      slots: new fields.NumberField({
        required: true,
        initial: 6,
        integer: true,
        positive: true,
        label: "PTR2E.FIELDS.slots.label",
        hint: "PTR2E.FIELDS.slots.hint",
      }),
      inventoryPoints: new fields.SchemaField({
        current: new fields.NumberField({
          required: true,
          initial: 0,
          min: 0,
          label: "PTR2E.FIELDS.inventoryPoints.current.label",
          hint: "PTR2E.FIELDS.inventoryPoints.current.hint",
        }),
      }),
      party: new fields.SchemaField({
        ownerOf: new fields.DocumentIdField({ required: false }),
        partyMemberOf: new fields.DocumentIdField({ required: false }),
        teamMemberOf: new fields.ArrayField(new fields.DocumentIdField(), { initial: [] }),
      }),
      clocks: new CollectionField(
        new fields.EmbeddedDataField(ClockPTR2e),
        "id",
        { required: true, initial: [] }
      ),
      immunities: new fields.SetField(new SlugField(), { required: true, initial: [] }),
      details: new fields.SchemaField({
        alliance: new fields.StringField({
          choices: {
            "party": "party",
            "opposition": "opposition"
          },
          required: true,
          nullable: true,
          initial: "",
          blank: true,
          label: "PTR2E.FIELDS.details.alliance.label",
          hint: "PTR2E.FIELDS.details.alliance.hint",
        }),
        size: new fields.SchemaField({
          height: new fields.NumberField({required: true, initial: 0, label: "PTR2E.FIELDS.size.height.label", hint: "PTR2E.FIELDS.size.height.hint"}),
          weight: new fields.NumberField({required: true, initial: 0, label: "PTR2E.FIELDS.size.weight.label", hint: "PTR2E.FIELDS.size.weight.hint"}),
          heightClass: new fields.NumberField({required: true, initial: 0, min: 0, max: 7}),
          weightClass: new fields.NumberField({required: true, initial: 1, min: 1, max: 16}),
        })
      })
    };
  }

  static override migrateData(source: ActorSystemPTR2e["_source"]) {
    // Migrate the `health.shield` field to the new `shield` field
    addDataFieldMigration(source, "health.shield", "shield");

    // Migrate species Abilities data to the new format
    if (source.species?.abilities) {
      for (const abGroup of Object.keys(source.species.abilities)) {
        source.species.abilities[abGroup] = (source.species.abilities[abGroup] as foundry.data.fields.SourcePropFromDataField<foundry.data.fields.SchemaField<AbilityReferenceSchema>>[]).map(g => {
          if (typeof g == "object") return g;
          return { slug: g, uuid: null };
        });
      }
    }

    return super.migrateData(source);
  }

  protected override _initialize(options?: Record<string, unknown>): void {
    super._initialize(options);

    Object.defineProperty(this.advancement, "advancementPoints", {
      value: {
        total: 0,
        spent: 0
      },
      writable: true,
    });
    if (this.advancement.advancementPoints.available === undefined) {
      Object.defineProperty(this.advancement.advancementPoints, "available", {
        get: () => this.advancement.advancementPoints.total - this.advancement.advancementPoints.spent
      })
    }
  }

  getLevel(experience: number = this.advancement.experience.current): number {
    return this.parent.isHumanoid() ? Math.max(1, Math.floor(Math.cbrt(((experience || 1) * 1) / 1))) : Math.max(1, Math.floor(Math.cbrt(((experience || 1) * 1) / 1)));
  }

  override prepareBaseData(): void {
    super.prepareBaseData();
    this._initializeModifiers();

    for(const k in this.attributes) {
      const key = k as keyof Attributes;
      Object.defineProperty(this.attributes[key], "final", {
        get: () => key === "hp" ? this.attributes[key].value : this.parent.calcStatTotal(this.attributes[key], false),
      });
    }

    this.details.alliance = ["party", "opposition", null].includes(this.details.alliance as string)
      ? this.details.alliance
      : this.parent.hasPlayerOwner
        ? "party"
        : "opposition";

    for (const clock of this.clocks.contents) {
      const name = sluggify(clock.name);
      this.parent.rollOptions.addOption("clocks", `${name}`)
      this.parent.rollOptions.addOption("clocks", `${name}:value:${clock.value}`)
      this.parent.rollOptions.addOption("clocks", `${name}:max:${clock.max}`)
      this.parent.rollOptions.addOption("clocks", `${clock.id}`)
      this.parent.rollOptions.addOption("clocks", `${clock.id}:value:${clock.value}`)
      this.parent.rollOptions.addOption("clocks", `${clock.id}:max:${clock.max}`)
    }

    this.advancement.level = this.getLevel();
    if (this.parent.isHumanoid()) {
      this.advancement.experience.next = Math.ceil((1 * Math.pow(Math.min(this.advancement.level + 1, 100), 3)) / 1)
      this.advancement.experience.diff =
        this.advancement.experience.next - this.advancement.experience.current;
    }
    else {
      this.advancement.experience.next = Math.ceil((1 * Math.pow(Math.min(this.advancement.level + 1, 100), 3)) / 1)
      this.advancement.experience.diff =
        this.advancement.experience.next - this.advancement.experience.current;
    }

    const isAce = this.traits.has("ace");
    const rvTotal = (isAce ? 400 : 110) + 10 * (this.advancement.level - 1);
    Object.defineProperty(this.advancement, "rvs", {
      value: {
        total: rvTotal,
        spent: 0,
      },
      writable: true,
    });
    if (this.advancement.rvs.available === undefined) {
      Object.defineProperty(this.advancement.rvs, "available", {
        get: () => this.advancement.rvs.total - this.advancement.rvs.spent,
      });
    }

    // Calculate Advancement Points total
    this.advancement.advancementPoints.total = this.parent.isHumanoid() ? (19 + this.advancement.level) : (10 + Math.floor(this.advancement.level / 2));
    this.advancement.advancementPoints.spent = 0;

    this.powerPoints.max = 20 + Math.ceil(0.5 * this.advancement.level);
    this.inventoryPoints.max = 12 + Math.floor((this.skills.get('resources')?.total ?? 0) / 10);

    this.details.size.heightClass = SpeciesSystemModel.getSpeciesSize(this.details.size.height || this.parent.species?.size.height || 0, this.parent.species?.size.type as "height" | "quad" | "length" || "height").sizeClass;
    this.details.size.weightClass = this.calculateWeightClass(this.details.size.weight || this.parent.species?.size.weight || 0);
  }

  private calculateWeightClass(weight: number) {
    switch (true) {
      case weight < 10:
        return 1;
      case weight < 20:
        return 2;
      case weight < 30:
        return 3;
      case weight < 40:
        return 4;
      case weight < 55:
        return 5;
      case weight < 70:
        return 6;
      case weight < 85:
        return 7;
      case weight < 100:
        return 8;
      case weight < 120:
        return 9;
      case weight < 145:
        return 10;
      case weight < 190:
        return 11;
      case weight < 240:
        return 12;
      case weight < 305:
        return 13;
      case weight < 350:
        return 14;
      case weight < 410:
        return 15;
      default:
        return 16;
    }
  }

  _initializeModifiers() {
    this.modifiers = {
      slots: 0,
      accuracy: 0,
      evasion: 0,
      rvs: 0,
      advancementPoints: 0,
      inventoryPoints: 0,
      effectChance: 0,
      hpMultiplier: 1,
      atkMultiplier: 1,
      defMultiplier: 1,
      spaMultiplier: 1,
      spdMultiplier: 1,
      speMultiplier: 1,
      skills: 1,
      movement: 0,
      powerPoints: 0,
      weightClass: 0,
      heightClass: 0
    };
  }

  _prepareSpeciesData() {
    if(!this.parent.species?.prepareBaseData) return;
    this.parent.species.prepareBaseData();

    // Add species traits to actor traits
    for (const trait of this.parent.species.traits.values()) {
      if (!this.traits.has(trait.slug)) {
        this.traits.set(trait.slug, {
          ...trait,
          virtual: true,
        });
        this.parent.rollOptions?.addTrait(trait);
      }
    }

    for (const type of this.parent.species.types.values()) {
      this.type.types.add(type);
      if (this.type.types.size > 1 && this.type.types.has("untyped")) {
        this.type.types.delete("untyped");
        this.traits.delete("untyped");
      }
    }

    this.movement = Object.fromEntries([
      ...this.parent.species.movement.primary.map<(readonly [string, Movement])>(m => [m.type, { method: m.type, value: m.value, type: "primary" }]),
      ...this.parent.species.movement.secondary.map<(readonly [string, Movement])>(m => [m.type, { method: m.type, value: m.value, type: "secondary" }])
    ]);

    // Every creature has a base overland of 3 at least.
    if ((Number(this.movement["overland"]?.value) || 0) <= 3) {
      this.movement["overland"] = { method: "overland", value: 3, type: "secondary" };
    }
  }

  prepareEmbeddedDocuments(): void {
    this._prepareSpeciesData();

    // Prepare any 'Base' data that (may) need Species Info
    for (const k in this.attributes) {
      const key = k as keyof Attributes;
      if (this.parent.species?.stats[key]) {
        if(this.parent.isHumanoid()) this.attributes[key].base ??= this.parent.species.stats[key];
        if(this.parent.isPokemon()) this.attributes[key].base = this.parent.species.stats[key];
      }
      if (this.attributes[key].base === undefined) this.attributes[key].base = 40;
      this.attributes[key].value = this._calculateStatTotal(this.attributes[key]);
    }

    this.health.max = this.attributes.hp.value;
    this.health.percent = Math.round((this.health.value / this.health.max) * 100);

    for (const skill of this.skills) {
      skill.prepareBaseData();
    }
    for (const skill of game.ptr.data.skills) {
      if (!this.skills.has(skill.slug)) {
        const newSkill = new SkillPTR2e(fu.duplicate(skill), { parent: this });
        newSkill.prepareBaseData();
        this.skills.set(newSkill.slug, newSkill);
      }
    }

    if (this.shield.value > 0) this.parent.rollOptions.addOption("self", "state:shielded");
    switch (true) {
      case this.health.value <= Math.floor(this.health.max * 0.25): {
        this.parent.rollOptions.addOption("self", "state:desperation-1-4");
      }
      case this.health.value <= Math.floor(this.health.max * (1 / 3)): {
        this.parent.rollOptions.addOption("self", "state:desperation-1-3");
      }
      case this.health.value <= Math.floor(this.health.max * 0.5): {
        this.parent.rollOptions.addOption("self", "state:desperation-1-2");
      }
      case this.health.value <= Math.floor(this.health.max * 0.75): {
        this.parent.rollOptions.addOption("self", "state:desperation-3-4");
      }
    }
    switch (true) {
      case this.health.value == this.health.max: {
        this.parent.rollOptions.addOption("self", "state:healthy");
      }
      case this.health.value >= Math.floor(this.health.max * 0.75): {
        this.parent.rollOptions.addOption("self", "state:intrepid-3-4");
      }
      case this.health.value >= Math.floor(this.health.max * 0.5): {
        this.parent.rollOptions.addOption("self", "state:intrepid-1-2");
      }
      case this.health.value >= Math.floor(this.health.max * (1 / 3)): {
        this.parent.rollOptions.addOption("self", "state:intrepid-1-3");
      }
      case this.health.value >= Math.floor(this.health.max * 0.25): {
        this.parent.rollOptions.addOption("self", "state:intrepid-1-4");
      }
    }
  }

  override prepareDerivedData(): void {
    super.prepareDerivedData();
    this.species?.prepareDerivedData?.();
    this.parent.species?.prepareDerivedData?.();

    for (const ptype of this.type.types) {
      if (!this.traits.has(ptype) && Trait.isValid(ptype) && ptype != "untyped") {
        this.addTraitFromSlug(ptype, true);
      }
    }

    // Calculate bonus RVs if applicable
    const isAce = this.traits.has("ace");
    const rvTotal = (isAce ? 400 : 110) + 10 * (this.advancement.level - 1);
    this.advancement.rvs.total = rvTotal + (this.modifiers["rvs"] ?? 0);

    // Calculate Advancement Points total
    this.advancement.advancementPoints.total = (this.parent.isHumanoid() ? (19 + this.advancement.level) : (10 + Math.floor(this.advancement.level / 2))) + (this.modifiers["advancementPoints"] ?? 0);

    if (this.modifiers["slots"]) {
      this.slots = (this._source.slots as number) + this.modifiers["slots"];
    }

    for (const k in this.attributes) {
      const key = k as keyof Attributes;
      this.attributes[key].value = this._calculateStatTotal(this.attributes[key]);
      const modifier = this.modifiers[`${key}Multiplier`];
      if (modifier && !isNaN(modifier) && modifier !== 1) {
        this.attributes[key].value = Math.round(this.attributes[key].value * Number(modifier));
      }
    }

    this.health.max = this.attributes.hp.value;
    this.health.percent = Math.round((this.health.value / this.health.max) * 100);

    this.powerPoints.max = 20 + Math.ceil(0.5 * this.advancement.level) + (this.modifiers.powerPoints ?? 0);
    this.powerPoints.percent = Math.round((this.powerPoints.value / this.powerPoints.max) * 100);
    this.inventoryPoints.max = 12 + Math.floor((this.skills.get('resources')?.total ?? 0) / 10) + (this.modifiers.inventoryPoints ?? 0);

    // Apply type based immunities
    if (this.type.types.has("poison") || this.type.types.has("steel")) {
      this.parent.rollOptions.addOption("immunities", "affliction:poison");
      this.parent.rollOptions.addOption("immunities", "affliction:blight");
    }
    if (this.type.types.has("fire")) {
      this.parent.rollOptions.addOption("immunities", "affliction:burn");
    }
    if (this.type.types.has("ice")) {
      this.parent.rollOptions.addOption("immunities", "affliction:frozen");
      this.parent.rollOptions.addOption("immunities", "affliction:frostbite");
    }
    if (this.type.types.has("electric")) {
      this.parent.rollOptions.addOption("immunities", "affliction:paralysis");
    }

    if(!isNaN(Number(this.modifiers.movement)) && this.modifiers.movement !== 0) {
      for (const movement of Object.values(this.movement)) {
        movement.value = Math.max(1, movement.value + Number(this.modifiers.movement));
      }
    }

    this.details.size.heightClass = Math.clamp(SpeciesSystemModel.getSpeciesSize(this.details.size.height || this.parent.species?.size.height || 0, this.parent.species?.size.type as "height" | "quad" | "length" || "height").sizeClass + (this.modifiers.heightClass ?? 0), 0, 8)
    this.details.size.weightClass = Math.clamp(this.calculateWeightClass(this.details.size.weight || this.parent.species?.size.weight || 0) + (this.modifiers.weightClass ?? 0), 1, 16)
  }

  _calculateStatTotal(stat: Attribute | Omit<Attribute, "stage">): number {
    // Shedinja HP is always 1
    if (stat.base === 1) return 1;

    const nature = (() => {
      const nature = natureToStatArray[this._source.nature as keyof typeof natureToStatArray];
      if (!nature) return 1;
      if (nature[0] == nature[1]) return 1;
      if (stat.slug === nature[0]) return 1.1;
      if (stat.slug === nature[1]) return 0.9;
      return 1;
    })();

    stat.ivs = Math.clamp(stat.ivs, 0, 31);

    const level = this.advancement.level;

    if ("stage" in stat) {
      /** Calculate a stat that Isn't HP */
      return Math.floor(
        (Math.floor(((2 * stat.base + stat.ivs + stat.evs / 4) * level) / 100) + 10) * nature
      );
    }

    /** Calculate HP */
    const bulkMod = Math.pow(1 + ((Math.exp(1)) / Math.pow(Math.PI, 3)), (this.details.size.heightClass || 1) - 1);

    return Math.floor(
      (Math.floor(((2 * stat.base + stat.ivs + stat.evs / 4) * level * bulkMod) / 100) +
        ((Math.PI / 10) + (Math.log(level + 9) / (Math.PI))) * level +
        20) *
      nature
    );
  }
}

interface ActorSystemPTR2e extends ModelPropsFromSchema<ActorSystemSchema> {
  attributes: ModelPropsFromSchema<AttributesSchema> & {
    hp: Omit<Attribute, 'stage'>;
    atk: Attribute;
    def: Attribute;
    spa: Attribute;
    spd: Attribute;
    spe: Attribute;
  };

  type: {
    effectiveness: Record<PokemonType, number>;
    types: Set<PokemonType>;
  };

  advancement: ModelPropsFromSchema<AdvancementSchema> & {
    advancementPoints: {
      total: number;
      spent: number;
      available: number;
    };
    rvs: {
      total: number;
      spent: number;
      available: number;
    };
  }

  details: {
    alliance: "party" | "opposition" | null | undefined;
    size: {
      height: number;
      weight: number;
      heightClass: number;
      weightClass: number;
    }
  }

  movement: Record<string, Movement>;

  _source: SourceFromSchema<ActorSystemSchema>;
}

export default ActorSystemPTR2e;
