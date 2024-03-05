import { ItemPTR2e, SpeciesPTR2e } from "@item";
import { DataSchema } from "types/foundry/common/data/fields.js";

class ActorSystemPTR2e extends foundry.abstract.TypeDataModel {
    static override defineSchema() {
        const fields = foundry.data.fields;

        const getAttributeField = (slug: string, withStage = true) => {
            return {
                ...getStatField(slug, withStage),
                evs: new fields.NumberField({ required: true, label: `PTR2E.Attributes.${slug}.Label`, initial: 0, min: 0, max: 200, step: 4, validate: (d) => d as number >= 0 && d as number <= 200 && d as number % 4 === 0 }),
                ivs: new fields.NumberField({ required: true, initial: 0, validate: (d) => d as number >= 0 }),
                base: new fields.NumberField({ required: true, initial: 50, validate: (d) => d as number >= 1 }),
                // value: new fields.NumberField({ required: true, initial: 0, validate: (d) => d as number >= 0 }),
            }
        }
        const getStatField = (slug: string, withStage = true) => {
            const output: DataSchema = {
                slug: new fields.StringField({ required: true, initial: slug}),
            }
            if (withStage) output.stage = new fields.NumberField({ required: true, initial: 0, validate: (d) => d as number >= -6 && d as number <= 6});
            return output;
        }

        return {
            attributes: new fields.SchemaField({
                hp: new fields.SchemaField(getAttributeField("hp",false)),
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
            skills: new fields.ObjectField({validate: (d: Record<string, Skill> | any) => {
                if (typeof d !== "object") return false;
                for (const [key, value] of Object.entries(d as Record<string, Skill>)) {
                    if (typeof key !== "string" || typeof value !== "object") return false;
                    if (typeof value.slug !== "string" || typeof value.value !== "number" || typeof value.rvs !== "number") return false;
                }
                return true;
            }}),
            biology: new fields.ObjectField(),
            capabilities: new fields.ObjectField(),
            traits: new fields.SetField(new fields.StringField()),
            advancementPoints: new fields.NumberField({ required: true, initial: 0, validate: (d) => d as number >= 0 }),
            type: new fields.SchemaField({
                types: new fields.ArrayField(new fields.StringField()),
            }),
            species: new fields.ForeignDocumentField(ItemPTR2e, { required: false, nullable: true }),
            powerPoints: new fields.SchemaField({
                value: new fields.NumberField({ required: true, initial: 0, validate: (d) => d as number >= 0 }),
            }),
            health: new fields.SchemaField({
                value: new fields.NumberField({ required: true, initial: 0, validate: (d) => d as number >= 0 }),
            }),
            experience: new fields.NumberField({ required: true, initial: 0, validate: (d) => d as number >= 0 }),
            money: new fields.NumberField({ required: true, initial: 0}),
        }
    }

    override prepareBaseData(): void {

        for(const k in this.attributes) {
            const key = k as keyof Attributes;
            this.attributes[key].value = this._calculateStatTotal(this.attributes[key]);
        }
    }

    _calculateStatTotal(stat: Attribute | Omit<Attribute, 'stage'>): number {
        //TODO: Add these values, for now default to 1
        const nature = 1, sizeMod = 1, level = 30;

        if('stage' in stat) {
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
                    / 65
                )
                + level
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
    /** Available advancement points */
    advancementPoints: number,
    type: {
        effectiveness: object,
        types: string[],
    },
    species: SpeciesPTR2e | null,
    powerPoints: {
        max: number,
        value: number,
    },
    health: HealthData,
    advancement: AdvancementData,
    money: number
}

export { ActorSystemPTR2e }