import { PTRCONSTS, DistanceUnit, TargetOption } from "@data";

class RangePTR2e extends foundry.abstract.DataModel {
    static override defineSchema() {
        const fields = foundry.data.fields;
        return {
            target: new fields.StringField({
                required: true, choices: Object.values(PTRCONSTS.TargetOptions).reduce<Record<string,string>>((acc, target) => ({...acc, [target]: target}), {}), initial: PTRCONSTS.TargetOptions.ENEMY, label: "PTR2E.FIELDS.target.label", hint: "PTR2E.FIELDS.target.hint"
            }),
            distance: new fields.NumberField({ required: true, initial: 0, min: 0, integer: true, label: "PTR2E.FIELDS.distance.label", hint: "PTR2E.FIELDS.distance.hint"}),
            unit: new fields.StringField({ required: true, choices: Object.values(PTRCONSTS.DistanceUnits), initial: PTRCONSTS.DistanceUnits.METERS, label: "PTR2E.FIELDS.unit.label", hint: "PTR2E.FIELDS.unit.hint" }),
        }
    }
}
interface RangePTR2e extends foundry.abstract.DataModel {
    target: TargetOption
    distance: number
    unit: DistanceUnit
}

export default RangePTR2e;