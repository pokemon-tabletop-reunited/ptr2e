import { PTRCONSTS, DistanceUnit, TargetOption } from "@data";

class RangePTR2e extends foundry.abstract.DataModel {
    static override defineSchema() {
        const fields = foundry.data.fields;
        return {
            target: new fields.StringField({
                required: true, choices: Object.values(PTRCONSTS.TargetOptions), initial: PTRCONSTS.TargetOptions.ENEMY,
            }),
            distance: new fields.NumberField({ required: true, initial: 0, min: 0, integer: true }),
            unit: new fields.StringField({ required: true, choices: Object.values(PTRCONSTS.DistanceUnits), initial: PTRCONSTS.DistanceUnits.METERS }),
        }
    }
}
interface RangePTR2e extends foundry.abstract.DataModel {
    target: TargetOption
    distance: number
    unit: DistanceUnit
}

export default RangePTR2e;