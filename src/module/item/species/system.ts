import { ItemSystemPTR2e } from "@item";

class SpeciesSystemPTR2e extends ItemSystemPTR2e {
    static override defineSchema() {
        const fields = foundry.data.fields;
        return Object.assign(super.defineSchema(), {
            number: new fields.NumberField({ required: true }),
            form: new fields.StringField({ required: false, nullable: true }),
            stats: new fields.SchemaField({
                hp: new fields.NumberField({ required: true, initial: 0, validate: (d) => d as number >= 0 }),
                atk: new fields.NumberField({ required: true, initial: 0, validate: (d) => d as number >= 0 }),
                def: new fields.NumberField({ required: true, initial: 0, validate: (d) => d as number >= 0 }),
                spa: new fields.NumberField({ required: true, initial: 0, validate: (d) => d as number >= 0 }),
                spd: new fields.NumberField({ required: true, initial: 0, validate: (d) => d as number >= 0 }),
                spe: new fields.NumberField({ required: true, initial: 0, validate: (d) => d as number >= 0 }),
            }),
            types: new fields.ArrayField(new fields.StringField())
        })
    }
}

interface SpeciesSystemPTR2e extends ItemSystemPTR2e {
    number: number
    form: string | null

    stats: {
        hp: number,
        atk: number,
        def: number,
        spa: number,
        spd: number,
        spe: number
    }

    types: PokemonType[]
}

export { SpeciesSystemPTR2e };