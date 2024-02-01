import { ActionCost, ActionType, TargetOption } from "@item/base/data.ts";

class ActionPTR2e extends foundry.abstract.DataModel {
    static override defineSchema() {
        const fields = foundry.data.fields;
        return {
            slug: new fields.StringField({ required: true }),
            name: new fields.StringField({ required: true, initial: "New Action" }),
            description: new fields.HTMLField({ required: false, nullable: true }),
            traits: new fields.ArrayField(new fields.StringField()),
            type: new fields.StringField({
                required: true, choices: () => [
                    "attack", "camping", "downtime", "exploration"
                ]
            }),
            range: new fields.EmbeddedDataField(RangePTR2e),
            cost: new fields.SchemaField({
                activation: new fields.StringField({
                    required: true, choices: () => [
                        "simple", "complete", "free"
                    ]
                }),
                powerPoints: new fields.NumberField({ required: true, initial: 0 }),
                trigger: new fields.StringField({ required: false, nullable: true }),
                delay: new fields.NumberField({ required: false, nullable: true }),
                priority: new fields.NumberField({ required: false, nullable: true }),
            })
        }
    }
}

interface ActionPTR2e extends foundry.abstract.DataModel {
    slug: string
    // Action label
    name: string
    // Effect text
    description: string
    traits: Trait[]
    type: ActionType

    cost: {
        activation: ActionCost,
        powerPoints: number,
        trigger?: string //| TriggerSource, // prob just string but maybe object
        delay?: 1 | 2 | 3,
        priority?: number,
    }
    range: RangePTR2e[]
}

interface AttackPTR2e extends ActionPTR2e {
    type: "attack"
    typing: PokemonType,
    category: PokemonCategory,
    power: number | null,
    accuracy: number | null,

    contestType: ContestType,
    contestEffect: string,
}

class RangePTR2e extends foundry.abstract.DataModel {
    static override defineSchema() {
        const fields = foundry.data.fields;
        return {
            target: new fields.StringField({
                required: true, choices: [
                    "self", "ally", "enemy", "creature", "object", "blast", "cone", "line", "wide-line", "emanation", "field"
                ]
            }),
            distance: new fields.NumberField({ required: true, initial: 0 }),
            unit: new fields.StringField({ required: true, choices: ["m", "ft"] }),
        }
    }
}
interface RangePTR2e extends foundry.abstract.DataModel {
    target: TargetOption
    distance: number
    unit: DistanceUnit
}

export { ActionPTR2e, RangePTR2e }
export type { AttackPTR2e }