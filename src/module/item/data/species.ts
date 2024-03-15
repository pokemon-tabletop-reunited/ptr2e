import { SpeciesPTR2e } from "@item";
import { HasDescription, HasSlug, HasTraits } from "@module/data/index.ts";
import { PokemonType } from "@data";

const SpeciesExtension = HasTraits(HasDescription(HasSlug(foundry.abstract.TypeDataModel)))

/**
 * @category Item Data Models
 */
class SpeciesSystem extends SpeciesExtension {
    /**
     * @internal
     */
    declare parent: SpeciesPTR2e;

    declare _source: InstanceType<typeof SpeciesExtension>['_source'] & {
        number: number;
        form: string | null;
        stats: {
            hp: number,
            atk: number,
            def: number,
            spa: number,
            spd: number,
            spe: number
        };
        types: PokemonType[];
    }

    static override defineSchema(): foundry.data.fields.DataSchema {
        const fields = foundry.data.fields;
        return {
            ...super.defineSchema(),
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
        }
    }
}

interface SpeciesSystem {
    /**
     * The # number of the species in the Pokedex.
     */
    number: number;

    /**
     * The form of the species.
     */
    form: string | null;

    /**
     * The stats of the species.
     */
    stats: {
        hp: number,
        atk: number,
        def: number,
        spa: number,
        spd: number,
        spe: number
    }

    /**
     * The types of the species.
     */
    types: PokemonType[];
}

export default SpeciesSystem;