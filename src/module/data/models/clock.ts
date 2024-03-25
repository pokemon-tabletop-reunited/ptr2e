
class Clock extends foundry.abstract.DataModel {
    static override defineSchema() {
        const fields = foundry.data.fields;
        return {
            id: new fields.StringField({ required: true, initial: () => fu.randomID(), label: "PTR2E.FIELDS.id.label", hint: "PTR2E.FIELDS.id.hint" }),
            value: new fields.NumberField({ required: true, initial: 0, min: 0, max: 16, label: "PTR2E.FIELDS.clock.label", hint: "PTR2E.FIELDS.clock.hint" }),
            max: new fields.NumberField({ required: true, initial: 4, min: 1, max: 16, label: "PTR2E.FIELDS.clockMax.label", hint: "PTR2E.FIELDS.clockMax.hint" }),
            color: new fields.ColorField({ required: true, initial: "#ff8800", label: "PTR2E.FIELDS.color.label", hint: "PTR2E.FIELDS.color.hint" }),
            label: new fields.StringField({ required: true, initial: "Clock", label: "PTR2E.FIELDS.label.label", hint: "PTR2E.FIELDS.label.hint" }),
            private: new fields.BooleanField({ required: true, initial: false, label: "PTR2E.FIELDS.private.label", hint: "PTR2E.FIELDS.private.hint" }),
        }
    }

    static override validateJoint(data: SourceFromSchema<ClockSchema>): void {
        if (data.value > data.max) throw new Error("Clock value cannot exceed the maximum value");
    }
}

interface Clock {

}

interface ClockSchema extends foundry.data.fields.DataSchema {
    value: foundry.data.fields.NumberField<number, number, true, false, true>;
    max: foundry.data.fields.NumberField<number, number, true, false, true>;
}

export default Clock;
export type {ClockSchema};