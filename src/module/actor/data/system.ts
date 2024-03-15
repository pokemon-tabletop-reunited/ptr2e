import { PokemonType } from "@data";
import { getTypes } from "@scripts/config/effectiveness.ts";
import { DataField, DataSchema } from "types/foundry/common/data/fields.js";
import { ActorPTR2e, AdvancementData, Attribute, Attributes, Biology, Capabilities, HealthData, HumanoidActorSystem, Skill, Skills, Stat } from "@actor";
import { SpeciesSystemModel } from "@item/data/index.ts";

class ActorSystemPTR2e extends foundry.abstract.TypeDataModel {
    static LOCALIZATION_PREFIXES = ["PTR2E.ActorSystem"];

    declare parent: ActorPTR2e<this>;

    static override defineSchema() {
        const fields = foundry.data.fields;

        const getAttributeField = (slug: string, withStage = true) => {
            return {
                ...getStatField(slug, withStage),
                evs: new fields.NumberField({ required: true, label: `PTR2E.Attributes.${slug}.Label`, initial: 0, min: 0, max: 200, step: 4, validate: (d) => d as number >= 0 && d as number <= 200 && d as number % 4 === 0 }),
                ivs: new fields.NumberField({ required: true, initial: 0, validate: (d) => d as number >= 0 }),
                base: new fields.NumberField({ required: true, initial: 50, validate: (d) => d as number >= 1 }),
            }
        }
        const getStatField = (slug: string, withStage = true) => {
            const output: DataSchema = {
                slug: new fields.StringField({ required: true, initial: slug }),
            }
            if (withStage) output.stage = new fields.NumberField({ required: true, initial: 0, validate: (d) => d as number >= -6 && d as number <= 6 });
            return output;
        }

        return {
            advancement: new fields.SchemaField({
                experience: new fields.SchemaField({
                    current: new fields.NumberField({ required: true, initial: 0, validate: (d) => d as number >= 0, label: "PTR2E.Fields.Experience.Label", hint: "PTR2E.Fields.Experience.Hint" })
                })
            }),
            attributes: new fields.SchemaField({
                hp: new fields.SchemaField(getAttributeField("hp", false)),
                atk: new fields.SchemaField(getAttributeField("atk")),
                def: new fields.SchemaField(getAttributeField("def")),
                spa: new fields.SchemaField(getAttributeField("spa")),
                spd: new fields.SchemaField(getAttributeField("spd")),
                spe: new fields.SchemaField(getAttributeField("spe"))
            }),
            battleStats: new fields.SchemaField({
                evasion: new fields.SchemaField(getStatField("evasion")),
                accuracy: new fields.SchemaField(getStatField("accuracy")),
                critRate: new fields.SchemaField(getStatField("critRate")),
            }),
            skills: new fields.ObjectField({
                validate: (d: Record<string, Skill> | any) => {
                    if (typeof d !== "object") return false;
                    for (const [key, value] of Object.entries(d as Record<string, Skill>)) {
                        if (typeof key !== "string" || typeof value !== "object") return false;
                        if (typeof value.slug !== "string" || typeof value.value !== "number" || typeof value.rvs !== "number") return false;
                    }
                    return true;
                }
            }),
            biology: new fields.ObjectField(),
            capabilities: new fields.ObjectField(),
            traits: new fields.SetField(new fields.StringField()),
            type: new fields.SchemaField({
                types: new fields.SetField(new fields.StringField({ required: true, choices: getTypes, initial: "untyped", label: "PTR2E.Fields.PokemonType.Label", hint: "PTR2E.Fields.PokemonType.Hint" }), { initial: ["untyped"], label: "PTR2E.Fields.PokemonType.LabelPlural", hint: "PTR2E.Fields.PokemonType.HintPlural", required: true, validate: (d) => (d instanceof Set ? d.size > 0 : Array.isArray(d) ? d.length > 0 : false), validationError: "PTR2E.Errors.PokemonType" }),
            }),
            powerPoints: new fields.SchemaField({
                value: new fields.NumberField({ required: true, initial: 0, validate: (d) => d as number >= 0 }),
            }),
            health: new fields.SchemaField({
                value: new fields.NumberField({ required: true, initial: 0, validate: (d) => d as number >= 0 }),
                max: new fields.NumberField({ required: true, initial: 0, validate: (d) => d as number >= 0 }),
            }),
            money: new fields.NumberField({ required: true, initial: 0 }),
            species: new fields.SchemaField(SpeciesSystemModel.defineSchema(), { required: false, nullable: true, initial: null }),
        }
    }

    override prepareBaseData(): void {
        this._prepareSpeciesData();

        this.advancement.level = Math.floor(Math.cbrt(this.advancement.experience.current || 1));
        this.advancement.experience.next = Math.pow(Math.min(this.advancement.level + 1, 100), 3);

        for (const k in this.attributes) {
            const key = k as keyof Attributes;
            if (this.species?.stats[key]) this.attributes[key].base = this.species.stats[key];
            this.attributes[key].value = this._calculateStatTotal(this.attributes[key]);
        }

        this.health.max = this.attributes.hp.value;
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
            Hooks.onError("ActorSystemPTR2e#_prepareSpeciesData", e, { data: this._source.species });
            return;
        }

        this.species = new SpeciesSystemModel(this._source.species);
    }

    _calculateStatTotal(stat: Attribute | Omit<Attribute, 'stage'>): number {
        //TODO: Add these values, for now default to 1
        const nature = 1, sizeMod = 1, level = this.advancement.level;

        if ('stage' in stat) {
            /** Calculate a stat that Isn't HP */
            return Math.floor(
                (
                    Math.floor(
                        (
                            (
                                (2 * stat.base)
                                + stat.ivs
                                + (stat.evs / 4)
                            )
                            * level
                        )
                        / 100
                    )
                    + 5
                )
                * nature
            )
        }

        /** Calculate HP */
        return Math.floor(
            (
                Math.floor(
                    (
                        (
                            (2 * stat.base)
                            + stat.ivs
                            + (stat.evs / 4)
                        )
                        * level
                        * sizeMod
                    )
                    / 100
                )
                + (
                    (
                        (Math.PI / 10) + ((Math.log(level + 9)) / Math.PI)
                    )
                    * level
                )
                + 15
            )
            * nature
        )
    }
}

interface ActorSystemPTR2e extends foundry.abstract.TypeDataModel {
    attributes: Attributes,
    battleStats: {
        evasion: Stat,
        accuracy: Stat,
        critRate: Stat,
    },
    skills: Skills,
    /** Biological data */
    biology: Biology,
    /** Movement Capabilities */
    capabilities: Capabilities,
    /** All traits for this actor */
    traits: Set<string>, //TODO: Map this to Set<Traits>
    type: {
        effectiveness: Record<PokemonType, number>,
        types: Set<PokemonType>,
    },
    species: SpeciesSystemModel | null,
    powerPoints: {
        max: number,
        value: number,
    },
    health: HealthData,
    advancement: AdvancementData,
    money: number

    _source: SourceFromSchema<ActorSystemSchema>
}

type ActorSystemSchema = Record<string, DataField<JSONValue, unknown, boolean>> & {
    species: SpeciesSystemModel['_source'];
}

export default ActorSystemPTR2e;