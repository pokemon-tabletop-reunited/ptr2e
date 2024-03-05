import { ActionPTR2e } from "./action.ts";

export default class AttackPTR2e extends ActionPTR2e {
    declare type: "attack";

    static override defineSchema() {
        const fields = foundry.data.fields;
        return {
            ...super.defineSchema(),
            typing: new fields.StringField({required: true}), //TODO: Add choices
            category: new fields.StringField({required: true, choices: ["physical", "special", "status"]}),
            power: new fields.NumberField({required: false, nullable: true}),
            accuracy: new fields.NumberField({required: false, nullable: true}),
            contestType: new fields.StringField({required: true, blank: true, initial: ""}),
            contestEffect: new fields.StringField({required: true, blank: true, initial: ""}),
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
    typing: PokemonType,

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