import { ActorPTR2e } from "@actor";
import { ActionPTR2e } from "./action.ts";

const POKEMON_TYPES = ["untyped", "normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"] as const;
type PokemonTypes = typeof POKEMON_TYPES[number];

const POKEMON_CATEGORIES = ["physical", "special", "status"] as const;
type PokemonCategories = typeof POKEMON_CATEGORIES[number];

export default class AttackPTR2e extends ActionPTR2e {
    declare type: "attack";

    static override TYPE = "attack" as const;

    static override defineSchema() {
        const fields = foundry.data.fields;
        return {
            ...super.defineSchema(),
            typing: new fields.StringField({ required: true, choices: POKEMON_TYPES, initial: "untyped", label: "PTR2E.Fields.PokemonType.Label", hint: "PTR2E.Fields.PokemonType.Hint" }),
            category: new fields.StringField({ required: true, choices: POKEMON_CATEGORIES, initial: "physical", label: "PTR2E.Fields.PokemonCategory.Label", hint: "PTR2E.Fields.PokemonCategory.Hint" }),
            power: new fields.NumberField({ required: false, nullable: true, min: 10, max: 250, label: "PTR2E.Fields.Power.Label", hint: "PTR2E.Fields.Power.Hint" }),
            accuracy: new fields.NumberField({ required: false, nullable: true, min: 10, max: 100, label: "PTR2E.Fields.Accuracy.Label", hint: "PTR2E.Fields.Accuracy.Hint" }),
            contestType: new fields.StringField({ required: true, blank: true, initial: "" }),
            contestEffect: new fields.StringField({ required: true, blank: true, initial: "" }),
        }
    }

    static override validateJoint(data: AttackPTR2e['_source']) {
        const category = data.category as PokemonCategories;
        const power = data.power as number;
        if (category === "status" && power) throw new Error("Status moves cannot have a power value.");
    }

    get rollable(): boolean {
        return this.accuracy !== null && this.power !== null;
    }

    async roll() {
        if (!this.rollable) return false;

        const accuracyCheck = await this.rollAccuracyCheck();
        if (!accuracyCheck) return false;

        const damageRandomness = await this.rollDamageRandomness();

        const initialTargets = [...game.user.targets].map(t => t.actor?.uuid!).filter(uuid => !!uuid);

        return await ChatMessage.create({
            type: "attack",
            system: {
                accuracyCheck: typeof accuracyCheck === 'boolean' ? {value: true} : accuracyCheck.toJSON(), // True if always-hit, or the roll
                damageRandomness: typeof damageRandomness === 'boolean' ? {value: false} : damageRandomness.toJSON(), // False if no damage, or the roll
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
    typing: PokemonTypes,

    /**
     * The category of the attack.
     * @defaultValue `'physical'`
     * @remarks
     * This is the category of the attack, which is used to determine the effectiveness of the attack.
     * This is one of `'physical'`, `'special'`, or `'status'`.
     */
    category: PokemonCategories,

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