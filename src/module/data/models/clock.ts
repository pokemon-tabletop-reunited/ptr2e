
const clockSchema = {
  id: new foundry.data.fields.StringField({ required: true, initial: () => foundry.utils.randomID(), label: "PTR2E.FIELDS.clock.id.label", hint: "PTR2E.FIELDS.clock.id.hint" }),
  value: new foundry.data.fields.NumberField({ required: true, nullable: false, initial: 0, min: 0, max: 16, label: "PTR2E.FIELDS.clock.value.label", hint: "PTR2E.FIELDS.clock.value.hint" }),
  max: new foundry.data.fields.NumberField({ required: true, nullable: false, initial: 4, min: 1, max: 16, label: "PTR2E.FIELDS.clock.max.label", hint: "PTR2E.FIELDS.clock.max.hint" }),
  color: new foundry.data.fields.ColorField({ required: true, initial: "#d0b8a3", label: "PTR2E.FIELDS.clock.color.label", hint: "PTR2E.FIELDS.clock.color.hint" }),
  label: new foundry.data.fields.StringField({ required: true, initial: "Clock", label: "PTR2E.FIELDS.clock.label.label", hint: "PTR2E.FIELDS.clock.label.hint" }),
  private: new foundry.data.fields.BooleanField({ required: true, initial: false, label: "PTR2E.FIELDS.clock.private.label", hint: "PTR2E.FIELDS.clock.private.hint" }),
  sort: new foundry.data.fields.NumberField({ required: true, nullable: false, initial: _getSort, min: 0, label: "PTR2E.FIELDS.clock.sort.label", hint: "PTR2E.FIELDS.clock.sort.hint" }),
}

function _getSort(): number {
  return canvas?.ready
    ? game.ptr.clocks.db.clocks.reduce((acc, c) => Math.max(acc, c.sort), 0) + 1
    : 0;
}

export type ClockSchema = typeof clockSchema;

export default class Clock extends foundry.abstract.DataModel<ClockSchema> {
  static override defineSchema() {
    return clockSchema;
  }

  get name() {
    return this.label;
  }

  static override validateJoint(data: foundry.data.fields.SchemaField.AssignmentType<ClockSchema>): void {
    if(!data) return;
    if (data.value! > data.max!) throw new Error("Clock value cannot exceed the maximum value");
  }

  get spokes() {
    return Array(this.max).keys();
  }

  static getSort(): number {
    return _getSort();
  }
}