import { HasTraits, PokemonType } from "@data";
import { getTypes } from "@scripts/config/effectiveness.ts";
import { DataField, DataSchema } from "types/foundry/common/data/fields.js";
import {
    ActorPTR2e,
    AdvancementData,
    Attribute,
    Attributes,
    Biology,
    Capabilities,
    HealthData,
    HumanoidActorSystem,
    Stat,
} from "@actor";
import { SpeciesSystemModel } from "@item/data/index.ts";
import { getInitialSkillList } from "@scripts/config/skills.ts";
import { CollectionField } from "@module/data/fields/collection-field.ts";
import SkillPTR2e from "@module/data/models/skill.ts";

class ActorSystemPTR2e extends HasTraits(foundry.abstract.TypeDataModel) {
    static LOCALIZATION_PREFIXES = ["PTR2E.ActorSystem"];

    declare parent: ActorPTR2e<this>;

    modifiers: Record<string, { value: number; source: string; type: string } | undefined> = {};

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
                    initial: 50,
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
                critRate: new fields.SchemaField(getStatField("critRate")),
            }),
            skills: new CollectionField(
                new fields.EmbeddedDataField(SkillPTR2e),
                "slug",
                { initial: getInitialSkillList }
            ),
            biology: new fields.ObjectField(),
            capabilities: new fields.ObjectField(),
            type: new fields.SchemaField({
                types: new fields.SetField(
                    new fields.StringField({
                        required: true,
                        choices: getTypes,
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
            money: new fields.NumberField({ required: true, initial: 0 }),
            species: new fields.SchemaField(SpeciesSystemModel.defineSchema(), {
                required: false,
                nullable: true,
                initial: null,
            }),
            slots: new fields.NumberField({
                required: true,
                initial: 6,
                integer: true,
                positive: true,
                label: "PTR2E.FIELDS.slots.label",
                hint: "PTR2E.FIELDS.slots.hint",
            }),
        };
    }

    // static override validateJoint(data: SourceFromSchema<DataSchema>): void {
    //     super.validateJoint(data);
    //     //@ts-expect-error
    //     for (const [key, skill] of Object.entries(data.skills) as [string, Skill][]) {
    //         if (["luck", "resources"].includes(skill.slug) && skill.rvs !== null) {
    //             throw new Error("Luck & Resources should not have RVs");
    //         }
    //         // if(skill.slug !== key) {
    //         //     throw new Error("Skill key does not match slug");
    //         // }
    //     }
    // }

    override prepareBaseData(): void {
        super.prepareBaseData();
        this._prepareSpeciesData();

        this.advancement.level = Math.floor(Math.cbrt(this.advancement.experience.current || 1));
        this.advancement.experience.next = Math.pow(Math.min(this.advancement.level + 1, 100), 3);
        this.advancement.experience.diff =
            this.advancement.experience.next - this.advancement.experience.current;

        for (const k in this.attributes) {
            const key = k as keyof Attributes;
            if (this.species?.stats[key]) this.attributes[key].base = this.species.stats[key];
            this.attributes[key].value = this._calculateStatTotal(this.attributes[key]);
        }

        for (const skill of this.skills) {
            skill.prepareBaseData();
        }
        for(const skill of game.ptr.data.skills) {
            if(!this.skills.has(skill.slug)) {
                const newSkill = new SkillPTR2e(fu.duplicate(skill), { parent: this });
                newSkill.prepareBaseData();
                this.skills.set(newSkill.slug, newSkill);
            }
        }

        this.health.max = this.attributes.hp.value;

        this.powerPoints.max = 20 + Math.ceil(0.5 * this.advancement.level);
    }

    _prepareSpeciesData() {
        // If the species is not set, they are a humanoid, construct species data for Humanoids.
        if (!this._source.species) {
            if (this.parent.isHumanoid()) {
                this.species = HumanoidActorSystem.constructSpecies(this);
                return;
            }
            let e = new Error("Species not set for non-humanoid actor");
            (this.parent as ActorPTR2e).synthetics.preparationWarnings.add(e.message);
            Hooks.onError("ActorSystemPTR2e#_prepareSpeciesData", e, {
                data: this._source.species,
            });
            return;
        }

        this.species = new SpeciesSystemModel(this._source.species, { parent: this.parent });
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
    }

    override prepareDerivedData(): void {
        super.prepareDerivedData();
        this.species?.prepareDerivedData?.();

        if (this.modifiers["slots"]?.value) {
            this.slots = (this._source.slots as number) + this.modifiers["slots"].value;
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
    capabilities: Capabilities;
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

    modifiers: Record<
        string,
        | {
              value: number;
              source: string;
              type: string;
          }
        | undefined
    >;

    _source: SourceFromSchema<ActorSystemSchema>;
}

type ActorSystemSchema = Record<string, DataField<JSONValue, unknown, boolean>> & {
    species: SpeciesSystemModel["_source"];
    traits: string[];
};

export default ActorSystemPTR2e;
