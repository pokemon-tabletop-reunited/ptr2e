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
            typing: new fields.StringField({ required: true, choices: POKEMON_TYPES, initial: "untyped", label: "PTR2E.Fields.PokemonType.Label", hint: "PTR2E.Fields.PokemonType.Hint"  }),
            category: new fields.StringField({ required: true, choices: POKEMON_CATEGORIES, initial: "physical", label: "PTR2E.Fields.PokemonCategory.Label", hint: "PTR2E.Fields.PokemonCategory.Hint"  }),
            power: new fields.NumberField({ required: false, nullable: true, min: 10, max: 250, label: "PTR2E.Fields.Power.Label", hint: "PTR2E.Fields.Power.Hint"  }),
            accuracy: new fields.NumberField({ required: false, nullable: true, min: 10, max: 100, label: "PTR2E.Fields.Accuracy.Label", hint: "PTR2E.Fields.Accuracy.Hint"  }),
            contestType: new fields.StringField({ required: true, blank: true, initial: "" }),
            contestEffect: new fields.StringField({ required: true, blank: true, initial: "" }),
        }
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