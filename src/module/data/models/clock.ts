
class Clock extends foundry.abstract.DataModel {
  static override defineSchema() {
    const fields = foundry.data.fields;
    return {
      id: new fields.StringField({ required: true, initial: () => fu.randomID(), label: "PTR2E.FIELDS.clock.id.label", hint: "PTR2E.FIELDS.clock.id.hint" }),
      value: new fields.NumberField({ required: true, initial: 0, min: 0, max: 16, label: "PTR2E.FIELDS.clock.value.label", hint: "PTR2E.FIELDS.clock.value.hint" }),
      max: new fields.NumberField({ required: true, initial: 4, min: 1, max: 16, label: "PTR2E.FIELDS.clock.max.label", hint: "PTR2E.FIELDS.clock.max.hint" }),
      color: new fields.ColorField({ required: true, initial: "#d0b8a3", label: "PTR2E.FIELDS.clock.color.label", hint: "PTR2E.FIELDS.clock.color.hint" }),
      label: new fields.StringField({ required: true, initial: "Clock", label: "PTR2E.FIELDS.clock.label.label", hint: "PTR2E.FIELDS.clock.label.hint" }),
      private: new fields.BooleanField({ required: true, initial: false, label: "PTR2E.FIELDS.clock.private.label", hint: "PTR2E.FIELDS.clock.private.hint" }),
      sort: new fields.NumberField({ required: true, initial: this.getSort, min: 0, label: "PTR2E.FIELDS.clock.sort.label", hint: "PTR2E.FIELDS.clock.sort.hint" }),
    }
  }

  get name() {
    return this.label;
  }

  static override validateJoint(data: SourceFromSchema<ClockSchema>): void {
    if (data.value > data.max) throw new Error("Clock value cannot exceed the maximum value");
  }

  get spokes() {
    return Array(this.max).keys();
  }

  static getSort() {
    return canvas.ready
      ? game.ptr.clocks.db.clocks.reduce((acc, c) => Math.max(acc, c.sort), 0) + 1
      : 0;
  }
}

interface Clock {
  id: string;
  value: number;
  max: number;
  color: string;
  label: string;
  private: boolean;
  sort: number;
}

interface ClockSchema extends foundry.data.fields.DataSchema {
  id: foundry.data.fields.StringField<string, string, true, false, true>;
  value: foundry.data.fields.NumberField<number, number, true, false, true>;
  max: foundry.data.fields.NumberField<number, number, true, false, true>;
  color: foundry.data.fields.ColorField<true, false, true>;
  label: foundry.data.fields.StringField<string, string, true, false, true>;
  private: foundry.data.fields.BooleanField<boolean, boolean, true, false, true>;
  sort: foundry.data.fields.NumberField<number, number, true, false, true>;
}

export default Clock;
export type { ClockSchema };