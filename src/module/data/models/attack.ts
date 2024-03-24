import { ActorPTR2e } from "@actor";
import { ActionPTR2e, ContestType, PTRCONSTS, PokemonCategory, PokemonType } from "@data";
import { getTypes } from "@scripts/config/effectiveness.ts";

export default class AttackPTR2e extends ActionPTR2e {
    declare type: "attack";

    static override TYPE = "attack" as const;

    static override defineSchema() {
        const fields = foundry.data.fields;
        return {
            ...super.defineSchema(),
            types: new fields.SetField(new fields.StringField({ required: true, choices: getTypes(), initial: PTRCONSTS.Types.UNTYPED, label: "PTR2E.FIELDS.pokemonType.label", hint: "PTR2E.FIELDS.pokemonType.hint" }), { initial: ["untyped"], label: "PTR2E.FIELDS.pokemonType.labelPlural", hint: "PTR2E.FIELDS.pokemonType.hintPlural", required: true, validate: (d) => (d instanceof Set ? d.size > 0 : Array.isArray(d) ? d.length > 0 : false), validationError: "PTR2E.Errors.PokemonType" }),
            category: new fields.StringField({ required: true, choices: Object.values(PTRCONSTS.Categories), initial: PTRCONSTS.Categories.PHYSICAL, label: "PTR2E.FIELDS.pokemonCategory.label", hint: "PTR2E.FIELDS.pokemonCategory.hint" }),
            power: new fields.NumberField({ required: false, nullable: true, min: 10, max: 250, label: "PTR2E.FIELDS.power.label", hint: "PTR2E.FIELDS.power.hint" }),
            accuracy: new fields.NumberField({ required: false, nullable: true, min: 10, max: 100, label: "PTR2E.FIELDS.accuracy.label", hint: "PTR2E.FIELDS.accuracy.hint" }),
            contestType: new fields.StringField({ required: true, blank: true, initial: "" }),
            contestEffect: new fields.StringField({ required: true, blank: true, initial: "" }),
        }
    }

    static override validateJoint(data: AttackPTR2e['_source']) {
        const category = data.category as PokemonCategory;
        const power = data.power as number;
        if (category === "status" && power) throw new Error("Status moves cannot have a power value.");
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
        return this.accuracy !== null && this.power !== null;
    }

    async roll() {
        if (!this.rollable) return false;

        const accuracyCheck = await this.rollAccuracyCheck();
        if (!accuracyCheck) return false;

        const critCheck = await this.rollCritCheck();
        if (!critCheck) return false;

        const damageRandomness = await this.rollDamageRandomness();

        const initialTargets = [...game.user.targets].filter(t => t.actor?.uuid).map(t => ({ uuid: t.actor!.uuid }));

        // @ts-ignore
        return await ChatMessage.create({
            type: "attack",
            system: {
                accuracyCheck: typeof accuracyCheck === 'boolean' ? { value: true } : accuracyCheck.toJSON(), // True if always-hit, or the roll
                critCheck: critCheck.toJSON(), // The crit roll
                damageRandomness: typeof damageRandomness === 'boolean' ? { value: false } : damageRandomness.toJSON(), // False if no damage, or the roll
                targets: initialTargets,
                origin: fu.mergeObject(this.actor!.toObject(), { uuid: this.actor!.uuid }),
                attack: this.slug
            }
        })
    }

    async rollAccuracyCheck(origin: ActorPTR2e | null = this.actor) {
        if (!origin) return false;

        if (this.accuracy === null) return true;

        return new Roll("1d100").roll();
    }

    async rollCritCheck(origin: ActorPTR2e | null = this.actor) {
        if (!origin) return false;

        return new Roll("1d100").roll();
    }

    async rollDamageRandomness(origin: ActorPTR2e | null = this.actor) {
        if (!origin) return false;

        if (this.power === null) return false;

        return new Roll("2d8").roll();
    }
}
export default interface AttackPTR2e extends ActionPTR2e {
    /**
     * The typing of the effect.
     * @remarks
     * This is the type of the attack, which is used to determine the effectiveness of the attack.
     * @defaultValue `'untyped'`
     */
    types: Set<PokemonType>,

    /**
     * The category of the attack.
     * @defaultValue `'physical'`
     * @remarks
     * This is the category of the attack, which is used to determine the effectiveness of the attack.
     * This is one of `'physical'`, `'special'`, or `'status'`.
     */
    category: PokemonCategory,

    /**
     * The power of the attack.
     * @defaultValue `null`
     * @remarks
     * This is the power of the attack, which is used to determine the effectiveness of the attack.
     */
    power: number | null,

    /**
     * The accuracy of the attack.
     * @defaultValue `null`
     * @remarks
     * This is the accuracy of the attack, which is used to determine the effectiveness of the attack.
     */
    accuracy: number | null,

    contestType: ContestType,
    contestEffect: string,
}