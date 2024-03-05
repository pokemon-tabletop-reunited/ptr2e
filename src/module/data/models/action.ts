// Priority & Interrupt are [Traits] so don't need a data field
type ActionCost = "simple" | "complete" | "free";
type ActionType = ActivityType | "attack" | "passive" | "generic";
type ActivityType = "camping" | "downtime" | "exploration";

type TargetOption = "self" | "ally" | "enemy" | "creature" | "object" | "blast" | "cone" | "line" | "wide-line" | "emanation" | "field" | "aura" | "allied-aura" | "enemy-aura";

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
                    "attack", "camping", "downtime", "exploration", "passive", "generic"
                ]
            }),
            range: new fields.EmbeddedDataField(RangePTR2e, { required: false, nullable: true }),
            cost: new fields.SchemaField({
                activation: new fields.StringField({
                    required: true
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
    /**
     * A slug for the action.
     * @remarks
     * This is a unique identifier for the action, which is used to reference it in the system.
     * It is derived from the name of the action.
     */
    slug: string
    /**
     * The name of the action.
     * @remarks
     * Supports localization.
     */
    name: string
    /**
     * The effect description of the action.
     */
    description: string
    /**
     * The traits of the action.
     */
    traits: Trait[]
    /**
     * The type of the action.
     * @defaultValue `'generic'`
     * @remarks
     * This is one of `'attack'`, `'camping'`, `'downtime'`, `'exploration'`, `'passive'`, or `'generic'`.
     */
    type: ActionType

    /**
     * The costs associated with using the action.
     */
    cost: {
        /**
         * The activation cost of the action.
         * @defaultValue `'simple'`
         * @remarks
         * This is one of `'simple'`, `'complete'`, or `'free'`.
         */
        activation: ActionCost,
        /**
         * The power points required to use the action.
         * @defaultValue `0`
         */
        powerPoints: number,
        /**
         * The trigger for the action.
         * @remarks
         * Todo: Decide what value this should be.
         */
        trigger?: string,
        /**
         * The delay of the action.
         * @defaultValue `1`
         * @remarks
         * This is one of `1`, `2`, or `3`.
         */
        delay?: 1 | 2 | 3,
        /**
         * The priority of the action.
         * @defaultValue `0`
         */
        priority?: number,
    }

    /**
     * The range of the action.
     * @remarks
     * This is the range of the action.
     * It can be one of `'self'`, `'ally'`, `'enemy'`, `'creature'`, `'object'`, `'blast'`, `'cone'`, `'line'`, `'wide-line'`, `'emanation'`, `'field'`, `'aura'`, `'allied-aura'`, or `'enemy-aura'`.
     */
    range: RangePTR2e[]
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