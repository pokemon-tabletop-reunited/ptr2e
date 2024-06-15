import { HasTraits, PokemonType } from "@data";
import { getTypes } from "@scripts/config/effectiveness.ts";
import { DataField, DataSchema } from "types/foundry/common/data/fields.js";
import {
    ActorPTR2e,
    AdvancementData,
    Attribute,
    Attributes,
    Biology,
    HealthData,
    HumanoidActorSystem,
    Stat,
} from "@actor";
import { SpeciesSystemModel } from "@item/data/index.ts";
import { getInitialSkillList } from "@scripts/config/skills.ts";
import { CollectionField } from "@module/data/fields/collection-field.ts";
import SkillPTR2e from "@module/data/models/skill.ts";
import natures from "@scripts/config/natures.ts";

class ActorSystemPTR2e extends HasTraits(foundry.abstract.TypeDataModel) {
    static LOCALIZATION_PREFIXES = ["PTR2E.ActorSystem"];

    declare parent: ActorPTR2e<this>;

    modifiers: Record<string, number | undefined> = {};

    static override defineSchema() {
        const fields = foundry.data.fields;

        const getAttributeField = (slug: string, withStage = true) => {
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
                    required: true,
                    initial: 40,
                    validate: (d) => (d as number) >= 1,
                }),
            };
        };
        const getStatField = (slug: string, withStage = true) => {
            const output: DataSchema = {
                slug: new fields.StringField({ required: true, initial: slug }),
            };
            if (withStage)
                output.stage = new fields.NumberField({
                    required: true,
                    initial: 0,
                    validate: (d) => (d as number) >= -6 && (d as number) <= 6,
                    label: `PTR2E.Attributes.${slug}.Stage.Label`,
                    hint: `PTR2E.Attributes.${slug}.Stage.Hint`,
                });
            return output;
        };

        return {
            ...super.defineSchema(),
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
                types: new fields.SetField(
                    new fields.StringField({
                        required: true,
                        choices: getTypes().reduce<Record<string, string>>(
                            (acc, type) => ({ ...acc, [type]: type }),
                            {}
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
                shield: new fields.SchemaField({
                    value: new fields.NumberField({
                        required: true,
                        initial: 0,
                        validate: (d) => (d as number) >= 0,
                        label: "PTR2E.FIELDS.health.shield.value.label",
                        hint: "PTR2E.FIELDS.health.shield.value.hint",
                    }),
                    max: new fields.NumberField({
                        required: true,
                        initial: 0,
                        validate: (d) => (d as number) >= 0,
                        label: "PTR2E.FIELDS.health.shield.max.label",
                        hint: "PTR2E.FIELDS.health.shield.max.hint",
                    })
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
                choices: Object.keys(natures).reduce<Record<keyof typeof natures, string>>((acc, key) => ({ ...acc, [key]: key }), {} as Record<keyof typeof natures, string>),
                initial: "hardy",
            }),
            gender: new fields.StringField({
                required: true,
                choices: {
                    "genderless": "genderless",
                    "male": "male",
                    "female": "female"
                },
                initial: "genderless" as "genderless" | "male" | "female",
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
            })
        };
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
        if(this.advancement.advancementPoints.available === undefined) {
            Object.defineProperty(this.advancement.advancementPoints, "available", {
                get: () => this.advancement.advancementPoints.total - this.advancement.advancementPoints.spent
            })
        }
    }

    override prepareBaseData(): void {
        super.prepareBaseData();
        this._initializeModifiers();
        this._prepareSpeciesData();

        if(this.parent.isHumanoid()) {
            this.advancement.level = Math.max(1,Math.floor(Math.cbrt(((this.advancement.experience.current || 1) * 4) / 5)));
            this.advancement.experience.next = Math.ceil((5 * Math.pow(Math.min(this.advancement.level + 1, 100), 3)) / 4)
            this.advancement.experience.diff =
                this.advancement.experience.next - this.advancement.experience.current;
        }
        else {
            this.advancement.level = Math.max(1, Math.floor(Math.cbrt(((this.advancement.experience.current || 1) * 6) / 3)));
            this.advancement.experience.next = Math.ceil((3 * Math.pow(Math.min(this.advancement.level + 1, 100), 3)) / 6)
            this.advancement.experience.diff =
                this.advancement.experience.next - this.advancement.experience.current;
        }

        //TODO: Change humanoid to ACE trait exclusively
        const isAce = this.parent.isHumanoid() || this.traits.has("ace");
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

        for (const k in this.attributes) {
            const key = k as keyof Attributes;
            if (this.species?.stats[key]) this.attributes[key].base = this.species.stats[key];
            this.attributes[key].value = this._calculateStatTotal(this.attributes[key]);
        }

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

        this.health.max = this.attributes.hp.value;

        this.powerPoints.max = 20 + Math.ceil(0.5 * this.advancement.level);
        this.inventoryPoints.max = 12 + Math.floor((this.skills.get('resources')?.total ?? 0) / 10);
    }

    _initializeModifiers() {
        this.modifiers = {
            slots: 0,
            accuracy: 0,
            evasion: 0,
        };
    }

    _prepareSpeciesData() {
        // If the species is not set, they are a humanoid, construct species data for Humanoids.
        if (!this._source.species) {
            if (this.parent.isHumanoid()) {
                this.species = HumanoidActorSystem.constructSpecies(this);
            } else {
                let e = new Error("Species not set for non-humanoid actor");
                (this.parent as ActorPTR2e).synthetics.preparationWarnings.add(e.message);
                Hooks.onError("ActorSystemPTR2e#_prepareSpeciesData", e, {
                    data: this._source.species,
                });
                return;
            }
        } else {
            this.species = new SpeciesSystemModel(this._source.species, { parent: this.parent, virtual: true });
        }
        this.species.prepareBaseData();

        // Add species traits to actor traits
        for (const trait of this.species.traits.values()) {
            this.traits.set(trait.slug, trait);
        }

        for (const type of this.species.types.values()) {
            this.type.types.add(type);
            if (this.type.types.size > 1 && this.type.types.has("untyped"))
                this.type.types.delete("untyped");
        }

        this.movement = new Collection(
            [
                this.species.movement.primary.map<(readonly [string, Movement])>(m => [m.type, { method: m.type, value: m.value, type: "primary" }]),
                this.species.movement.secondary.map<(readonly [string, Movement])>(m => [m.type, { method: m.type, value: m.value, type: "secondary" }])
            ].flat()
        );

        // Every creature has a base overland of 3 at least.
        if((Number(this.movement.get("overland")?.value) || 0) <= 3) {
            this.movement.set("overland", { method: "overland", value: 3, type: "secondary" });
        }
    }

    override prepareDerivedData(): void {
        super.prepareDerivedData();
        this.species?.prepareDerivedData?.();

        if (this.modifiers["slots"]) {
            this.slots = (this._source.slots as number) + this.modifiers["slots"];
        }

        for (const k in this.attributes) {
            const key = k as keyof Attributes;
            if (this.species?.stats[key]) this.attributes[key].base = this.species.stats[key];
            this.attributes[key].value = this._calculateStatTotal(this.attributes[key]);
        }
    }

    _calculateStatTotal(stat: Attribute | Omit<Attribute, "stage">): number {
        //TODO: Add these values, for now default to 1
        const nature = 1,
            sizeMod = 1,
            level = this.advancement.level;

        if ("stage" in stat) {
            /** Calculate a stat that Isn't HP */
            return Math.floor(
                (Math.floor(((2 * stat.base + stat.ivs + stat.evs / 4) * level) / 100) + 5) * nature
            );
        }

        /** Calculate HP */
        return Math.floor(
            (Math.floor(((2 * stat.base + stat.ivs + stat.evs / 4) * level * sizeMod) / 100) +
                (Math.PI / 10 + Math.log(level + 9) / Math.PI) * level +
                15) *
                nature
        );
    }

    override async _preCreate(
        data: this["parent"]["_source"],
        options: DocumentModificationContext<this["parent"]["parent"]> & { fail?: boolean },
        user: User
    ): Promise<boolean | void> {
        //@ts-expect-error
        if (this._source.traits.includes("humanoid") && this.parent.type === "pokemon") {
            this.parent.updateSource({ type: "humanoid" });
        }
        //@ts-expect-error
        if (this._source.traits.includes("pokemon") && this.parent.type === "humanoid") {
            this.parent.updateSource({ type: "pokemon" });
        }
        await super._preCreate(data, options, user);
    }

    override _preUpdate(
        changed: DeepPartial<this["parent"]["_source"]>,
        options: DocumentUpdateContext<this["parent"]["parent"]>,
        user: User
    ): Promise<boolean | void> {
        if (changed.system?.traits) {
            const hasTrait = (trait: string) => {
                if (changed.system!.traits instanceof Collection)
                    return changed.system!.traits.has(trait);
                if (Array.isArray(changed.system!.traits))
                    return changed.system!.traits.includes(trait);
                return false;
            };
            if (hasTrait("humanoid") && hasTrait("pokemon")) {
                throw new Error("Cannot have both humanoid and pokemon traits");
            }
            if (hasTrait("humanoid") && this.parent.type === "pokemon") {
                changed.type = "humanoid";
            }
            if (hasTrait("pokemon") && this.parent.type === "humanoid") {
                changed.type = "pokemon";
            }
        }

        return super._preUpdate(changed, options, user);
    }
}

interface ActorSystemPTR2e extends foundry.abstract.TypeDataModel {
    attributes: Attributes;
    battleStats: {
        evasion: Stat;
        accuracy: Stat;
        critRate: Stat;
    };
    skills: Collection<SkillPTR2e>;
    /** Biological data */
    biology: Biology;
    /** Movement Capabilities */
    type: {
        effectiveness: Record<PokemonType, number>;
        types: Set<PokemonType>;
    };
    species: SpeciesSystemModel | null;
    powerPoints: {
        max: number;
        value: number;
    };
    health: HealthData;
    advancement: AdvancementData;
    money: number;
    slots: number;
    inventoryPoints: {
        current: number,
        max: number
    }

    movement: Collection<Movement>;

    modifiers: Record<string, number | undefined>;

    _source: SourceFromSchema<ActorSystemSchema>;
}

type Movement = { method: string; value: number; type: "primary" | "secondary" };

type ActorSystemSchema = Record<string, DataField<JSONValue, unknown, boolean>> & {
    species: SpeciesSystemModel["_source"];
    traits: string[];
};

export default ActorSystemPTR2e;
