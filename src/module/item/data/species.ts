import { SpeciesPTR2e } from "@item";
import { HasDescription, HasSlug, HasTraits } from "@module/data/index.ts";

const SpeciesExtension = HasTraits(HasDescription(HasSlug(foundry.abstract.TypeDataModel)))

/**
 * @category Item Data Models
 */
export default abstract class SpeciesSystem extends SpeciesExtension {
    /**
     * @internal
     */
    declare parent: SpeciesPTR2e;

    /**
     * The # number of the species in the Pokedex.
     */
    abstract number: number;

    /**
     * The form of the species.
     */
    abstract form: string | null;

    /**
     * The stats of the species.
     */
    abstract stats: {
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
    abstract types: PokemonType[];

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