import { SpeciesPTR2e } from "@item";
import { HasDescription, HasSlug, HasTraits, PTRCONSTS } from "@module/data/index.ts";
import { PokemonType } from "@data";
import { BaseItemSourcePTR2e, ItemSystemSource } from "./system.ts";
import { getTypes } from "@scripts/config/effectiveness.ts";

const SpeciesExtension = HasTraits(HasDescription(HasSlug(foundry.abstract.TypeDataModel)));

/**
 * @category Item Data Models
 */
class SpeciesSystem extends SpeciesExtension {
    /**
     * @internal
     */
    declare parent: SpeciesPTR2e;

    declare _source: InstanceType<typeof SpeciesExtension>["_source"] & {
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
    };

    static override defineSchema(): foundry.data.fields.DataSchema {
        const fields = foundry.data.fields;
        return {
            ...super.defineSchema(),
            number: new fields.NumberField({ required: true, min: 0 }),
            form: new fields.StringField({ required: false, nullable: true }),
            stats: new fields.SchemaField({
                hp: new fields.NumberField({
                    required: true,
                    initial: 0,
                    validate: (d) => (d as number) >= 0,
                }),
                atk: new fields.NumberField({
                    required: true,
                    initial: 0,
                    validate: (d) => (d as number) >= 0,
                }),
                def: new fields.NumberField({
                    required: true,
                    initial: 0,
                    validate: (d) => (d as number) >= 0,
                }),
                spa: new fields.NumberField({
                    required: true,
                    initial: 0,
                    validate: (d) => (d as number) >= 0,
                }),
                spd: new fields.NumberField({
                    required: true,
                    initial: 0,
                    validate: (d) => (d as number) >= 0,
                }),
                spe: new fields.NumberField({
                    required: true,
                    initial: 0,
                    validate: (d) => (d as number) >= 0,
                }),
            }),
            types: new fields.SetField(new fields.StringField({ required: true, choices: getTypes(), initial: PTRCONSTS.Types.UNTYPED, label: "PTR2E.FIELDS.pokemonType.label", hint: "PTR2E.FIELDS.pokemonType.hint" }), { initial: ["untyped"], label: "PTR2E.FIELDS.pokemonType.labelPlural", hint: "PTR2E.FIELDS.pokemonType.hintPlural", required: true, validate: (d) => (d instanceof Set ? d.size > 0 : Array.isArray(d) ? d.length > 0 : false), validationError: "PTR2E.Errors.PokemonType" }),
            size: new fields.SchemaField({
                category: new fields.StringField({ required: true, initial: "medium", blank: false }),
                type: new fields.StringField({ required: true, initial: "height", blank: false }),
            }),
            diet: new fields.ArrayField(new fields.StringField(),{ required: true, initial: [] }),
            abilities: new fields.SchemaField({
                starting: new fields.ArrayField(new fields.StringField(), { required: true, initial: [] }),
                basic: new fields.ArrayField(new fields.StringField(), { required: true, initial: [] }),
                advanced: new fields.ArrayField(new fields.StringField(), { required: true, initial: [] }),
                master: new fields.ArrayField(new fields.StringField(), { required: true, initial: [] }),
            }),
            movement: new fields.SchemaField({
                primary: new fields.ArrayField(new fields.ObjectField(), { required: true, initial: [] }),
                secondary: new fields.ArrayField(new fields.ObjectField(), { required: true, initial: [] }),
            }),
            skills: new fields.ObjectField({ required: true, initial: {} }),
        };
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
        hp: number;
        atk: number;
        def: number;
        spa: number;
        spd: number;
        spe: number;
    };

    /**
     * The typing of the effect.
     * @remarks
     * This is the type of the attack, which is used to determine the effectiveness of the attack.
     * @defaultValue `'untyped'`
     */
    types: Set<PokemonType>,

    size: {
        /** small, huge, medium etc. */
        category: string;
        /** quadraped / height measurement */
        type: string;
    };

    diet: string[];

    abilities: {
        starting: string[];
        basic: string[];
        advanced: string[];
        master: string[];
    };

    movement: {
        primary: Record<string, number>[];
        secondary: Record<string, number>[];
    };

    skills: Record<string, number>;
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
}
