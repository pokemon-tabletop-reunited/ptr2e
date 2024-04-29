import { SpeciesPTR2e } from "@item";
import { HasDescription, HasEmbed, HasSlug, HasTraits, PTRCONSTS } from "@module/data/index.ts";
import { PokemonType } from "@data";
import { BaseItemSourcePTR2e, ItemSystemSource } from "./system.ts";
import { getTypes } from "@scripts/config/effectiveness.ts";
import { SlugField } from "@module/data/fields/slug-field.ts";
import { ActorPTR2e } from "@actor";

const SpeciesExtension = HasEmbed(HasTraits(HasDescription(HasSlug(foundry.abstract.TypeDataModel))), "species");

/**
 * @category Item Data Models
 */
class SpeciesSystem extends SpeciesExtension {
    /**
     * @internal
     */
    declare parent: SpeciesPTR2e | ActorPTR2e;

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

        function getMoveField(hasLevel = false) {
            const innerFields: Record<string, foundry.data.fields.DataField> = {
                name: new SlugField({ required: true }),
                gen: new SlugField({ required: false, blank: true }),
            };
            if (hasLevel) innerFields.level = new fields.NumberField({ required: true, min: 0 });
            return new fields.SchemaField(innerFields);
        }

        return {
            ...super.defineSchema(),
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
            stats: new fields.SchemaField({
                hp: new fields.NumberField({
                    required: true,
                    initial: 0,
                    validate: (d) => (d as number) >= 0,
                    label: `PTR2E.Attributes.hp.Label`,
                }),
                atk: new fields.NumberField({
                    required: true,
                    initial: 0,
                    validate: (d) => (d as number) >= 0,
                    label: `PTR2E.Attributes.atk.Label`,
                }),
                def: new fields.NumberField({
                    required: true,
                    initial: 0,
                    validate: (d) => (d as number) >= 0,
                    label: `PTR2E.Attributes.def.Label`,
                }),
                spa: new fields.NumberField({
                    required: true,
                    initial: 0,
                    validate: (d) => (d as number) >= 0,
                    label: `PTR2E.Attributes.spa.Label`,
                }),
                spd: new fields.NumberField({
                    required: true,
                    initial: 0,
                    validate: (d) => (d as number) >= 0,
                    label: `PTR2E.Attributes.spd.Label`,
                }),
                spe: new fields.NumberField({
                    required: true,
                    initial: 0,
                    validate: (d) => (d as number) >= 0,
                    label: `PTR2E.Attributes.spe.Label`,
                }),
            }, {label: "PTR2E.FIELDS.stats.label"}),
            types: new fields.SetField(
                new SlugField({
                    required: true,
                    choices: getTypes(),
                    initial: PTRCONSTS.Types.UNTYPED,
                    label: "PTR2E.FIELDS.pokemonType.label",
                    hint: "PTR2E.FIELDS.pokemonType.hint",
                }),
                {
                    initial: ["untyped"],
                    label: "PTR2E.FIELDS.pokemonType.labelPlural",
                    hint: "PTR2E.FIELDS.pokemonType.hintPlural",
                    required: true,
                    validate: (d) =>
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
                starting: new fields.SetField(new SlugField({ blank: false }), {
                    required: true,
                    initial: [],
                    label: "PTR2E.FIELDS.abilities.starting.label",
                }),
                basic: new fields.SetField(new SlugField({ blank: false }), {
                    required: true,
                    initial: [],
                    label: "PTR2E.FIELDS.abilities.basic.label",
                }),
                advanced: new fields.SetField(new SlugField({ blank: false }), {
                    required: true,
                    initial: [],
                    label: "PTR2E.FIELDS.abilities.advanced.label",
                }),
                master: new fields.SetField(new SlugField({ blank: false }), {
                    required: true,
                    initial: [],
                    label: "PTR2E.FIELDS.abilities.master.label",
                }),
            }),
            movement: new fields.SchemaField({
                primary: new fields.ArrayField(new fields.SchemaField({
                    type: new SlugField({ required: true, blank: true, nullable: false, initial: ""}),
                    value: new fields.NumberField({ required: true, min: 0 }),
                }), {
                    required: true,
                    initial: [],
                    label: "PTR2E.FIELDS.movement.primary.label",
                }),
                secondary: new fields.ArrayField(new fields.SchemaField({
                    type: new SlugField({ required: true, blank: true, nullable: false, initial: ""}),
                    value: new fields.NumberField({ required: true, min: 0 }),
                }), {
                    required: true,
                    initial: [],
                    label: "PTR2E.FIELDS.movement.secondary.label",
                }),
            }),
            skills: new SkillsField({ required: true, initial: {} }),
            moves: new fields.SchemaField({
                levelUp: new fields.ArrayField(getMoveField(true), { required: true, initial: [] }),
                egg: new fields.ArrayField(getMoveField(), { required: true, initial: [] }),
                tutor: new fields.ArrayField(getMoveField(), { required: true, initial: [] }),
                machine: new fields.ArrayField(getMoveField(), { required: true, initial: [] }),
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
            evolutions: new fields.SchemaField({
                full: new fields.EmbeddedDataField(EvolutionData, {
                    required: true,
                    nullable: true,
                    initial: null,
                }),
            }),
        };
    }

    override prepareBaseData(): void {
        super.prepareBaseData();
        this.skills = Object.fromEntries(
            Object.entries(this.skills).sort(([a], [b]) => a.localeCompare(b))
        );
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

class SkillsField<
    TSourceProp extends object,
    TModelProp = TSourceProp,
    TRequired extends boolean = true,
    TNullable extends boolean = false,
    THasInitial extends boolean = true,
> extends foundry.data.fields.ObjectField<
    TSourceProp,
    TModelProp,
    TRequired,
    TNullable,
    THasInitial
> {
    protected override _cleanType(value: unknown): unknown {
        if (typeof value !== "object") return super._cleanType(value);
        
        return Object.fromEntries(
            Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b))
        )
    }
}

class EvolutionData extends foundry.abstract.DataModel {
    static override defineSchema(): foundry.data.fields.DataSchema {
        const fields = foundry.data.fields;
        const getSchema = () => ({
            name: new SlugField({ required: true }),
            details: new fields.SchemaField(
                {
                    gender: new SlugField({
                        required: true,
                        blank: false,
                        nullable: true,
                        choices: ["male", "female"],
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
    types: Set<PokemonType>;

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
        primary: { type: string; value: number }[];
        secondary: { type: string; value: number }[];
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

    size: {
        /** small, huge, medium etc. */
        category: string;
        /** quadraped / height measurement */
        type: string;
    };

    diet: string[];
    habitat: string[];
    eggGroups: string[];

    abilities: {
        starting: string[];
        basic: string[];
        advanced: string[];
        master: string[];
    };

    movement: {
        primary: {type: string, value: number}[];
        secondary:{type: string, value: number}[];
    };

    skills: Record<string, number>;
}
