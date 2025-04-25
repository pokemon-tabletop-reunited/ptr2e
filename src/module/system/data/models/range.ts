import { PTRCONSTS } from "..";

const rangeSchema = {
  target: new foundry.data.fields.StringField({
    required: true, choices: Object.values(PTRCONSTS.TargetOptions).reduce<Record<string, string>>((acc, target) => ({ ...acc, [target]: target }), {}), initial: PTRCONSTS.TargetOptions.ENEMY, label: "PTR2E.FIELDS.target.label", hint: "PTR2E.FIELDS.target.hint"
  }),
  distance: new foundry.data.fields.NumberField({ required: true, initial: 0, min: 0, integer: true, label: "PTR2E.FIELDS.distance.label", hint: "PTR2E.FIELDS.distance.hint" }),
  unit: new foundry.data.fields.StringField({ required: true, choices: Object.values(PTRCONSTS.DistanceUnits), initial: PTRCONSTS.DistanceUnits.METERS, label: "PTR2E.FIELDS.unit.label", hint: "PTR2E.FIELDS.unit.hint" }),

}

declare namespace RangePTR2e {
  type Schema = typeof rangeSchema;
}

class RangePTR2e extends foundry.abstract.DataModel<RangePTR2e.Schema> {
  static override defineSchema() {
    return rangeSchema;
  }
}

export {RangePTR2e};