/**
 * @extends {ActionSource}
 */
export class PTRAction extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            slug: new fields.StringField({ required: true }),
            name: new fields.StringField({ required: true, initial: "New Action" }),
            description: new fields.HTMLField({ required: false, nullable: true }),
            traits: new fields.ArrayField(new fields.StringField()),
            type: new fields.StringField({ required: true, choices: () => [
                "attack", "camping", "downtime", "exploration"
            ]}),
            range: new fields.EmbeddedDataField(PTRRange),
            cost: new fields.SchemaField({
                activation: new fields.StringField({ required: true, choices: () => [
                    "simple", "complete", "free"
                ]}),
                powerPoints: new fields.NumberField({ required: true, initial: 0 }),
                trigger: new fields.StringField({ required: false, nullable: true }),
                delay: new fields.NumberField({ required: false, nullable: true }),
                priority: new fields.NumberField({ required: false, nullable: true }),
            })
        }
    }
}

/**
 * @extends {RangeSource}
 */
export class PTRRange extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            target: new fields.StringField({ required: true, choices: [
                "self", "ally", "enemy", "creature", "object", "blast", "cone", "line", "wide-line", "emanation", "field"
            ]}),
            distance: new fields.NumberField({ required: true, initial: 0 }),
            unit: new fields.StringField({ required: true, choices: ["m", "ft"]}),
        }
    }
}
