import { ActionPTR2e, ContestType, PTRCONSTS, PokemonCategory, PokemonType } from "@data";
import { getTypes } from "@scripts/config/effectiveness.ts";
import { ActionSchema } from "./action.ts";
import { AttackStatistic } from "@system/statistics/attack.ts";
import { AttackStatisticRollParameters } from "@system/statistics/statistic.ts";

export default class AttackPTR2e extends ActionPTR2e {
    declare type: "attack";

    static override TYPE = "attack" as const;

    static override defineSchema(): AttackSchema & ActionSchema {
        const fields = foundry.data.fields;
        return {
            ...super.defineSchema(),
            types: new fields.SetField(
                new fields.StringField({
                    required: true,
                    choices: getTypes().reduce<Record<string,string>>((acc, type) => ({...acc, [type]: type}), {}),
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
            category: new fields.StringField({
                required: true,
                choices: Object.values(PTRCONSTS.Categories).reduce<Record<string,string>>((acc, category) => ({...acc, [category]: category}), {}),
                initial: PTRCONSTS.Categories.PHYSICAL,
                label: "PTR2E.FIELDS.pokemonCategory.label",
                hint: "PTR2E.FIELDS.pokemonCategory.hint",
            }),
            power: new fields.NumberField({
                required: false,
                nullable: true,
                min: 10,
                max: 250,
                label: "PTR2E.FIELDS.power.label",
                hint: "PTR2E.FIELDS.power.hint",
            }),
            accuracy: new fields.NumberField({
                required: false,
                nullable: true,
                min: 10,
                max: 100,
                label: "PTR2E.FIELDS.accuracy.label",
                hint: "PTR2E.FIELDS.accuracy.hint",
            }),
            contestType: new fields.StringField({ required: true, blank: true, initial: "" }),
            contestEffect: new fields.StringField({ required: true, blank: true, initial: "" }),
            free: new fields.BooleanField({
                required: true,
                initial: false,
                label: "PTR2E.FIELDS.free.label",
                hint: "PTR2E.FIELDS.free.hint",
            }),
            slot: new fields.NumberField({
                required: true,
                nullable: true,
                initial: null,
                label: "PTR2E.FIELDS.slot.label",
                hint: "PTR2E.FIELDS.slot.hint",
            }),
        };
    }

    static override validateJoint(data: AttackPTR2e["_source"]) {
        const category = data.category as PokemonCategory;
        const power = data.power as number;
        if (category === "status" && power)
            throw new Error("Status moves cannot have a power value.");
        // if (category !== "status" && !power) throw new Error("Physical and special moves must have a power value.");
    }

    // TODO: This should add any relevant modifiers
    get stab(): 0 | 1 | 1.5 {
        if (!this.actor) return 0;
        const intersection = this.actor.system.type.types.intersection(this.types);
        return intersection.size === 1 && this.types.has(PTRCONSTS.Types.UNTYPED)
            ? 1
            : intersection.size > 0
              ? 1.5
              : 1;
    }

    get rollable(): boolean {
        return this.accuracy !== null || this.power !== null;
    }

    async roll(args?: AttackStatisticRollParameters) {
        if (!this.rollable) return false;

        return this.statistic!.check.roll(args);
    }

    override prepareDerivedData(): void {
        super.prepareDerivedData();

        this.statistic = this.prepareStatistic();
    }

    get isMelee(): boolean {
        return false; // TODO: Implement
    }

    get isRanged(): boolean {
        return false; // TODO: Implement
    }

    public prepareStatistic({ force }: { force?: boolean } = {}): AttackStatistic | null {
        if (!force && this.statistic) return this.statistic;
        if (!this.actor) return null;
        return new AttackStatistic(this);
    }

    public getRangeIncrement(distance: number | null): number | null {
        if(distance === null || !this.range || !["ally", "enemy", "creature", "object"].includes(this.range.target)) return null;

        // TODO: Implement Reach
        if(this.range.distance <= 1) return distance >= 2 ? Infinity : 0;
        const increment = this.range.distance;
        return Math.max(Math.ceil(distance / increment), 1) - 1;
    }
}
export default interface AttackPTR2e extends ActionPTR2e, ModelPropsFromSchema<AttackSchema> {
    update(
        data: DeepPartial<SourceFromSchema<AttackSchema>> &
            DeepPartial<SourceFromSchema<ActionSchema>>
    ): Promise<this["item"]>;
    prepareUpdate(
        data: DeepPartial<SourceFromSchema<AttackSchema>> &
            DeepPartial<SourceFromSchema<ActionSchema>>
    ): (SourceFromSchema<ActionSchema> & SourceFromSchema<AttackSchema>)[];

    statistic: Maybe<AttackStatistic>;

    _source: SourceFromSchema<AttackSchema> & SourceFromSchema<ActionSchema>;
}

type AttackSchema = {
    types: foundry.data.fields.SetField<
        foundry.data.fields.StringField<string, PokemonType, true, false, true>,
        PokemonType[],
        Set<PokemonType>,
        true,
        false,
        true
    >;
    category: foundry.data.fields.StringField<string, PokemonCategory, true, false, true>;
    power: foundry.data.fields.NumberField<number>;
    accuracy: foundry.data.fields.NumberField<number>;
    contestType: foundry.data.fields.StringField<string, ContestType, true>;
    contestEffect: foundry.data.fields.StringField<string, string, true>;
    free: foundry.data.fields.BooleanField<boolean, boolean>;
    slot: foundry.data.fields.NumberField<number, number, true, true, true>;
};
