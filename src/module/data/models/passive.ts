import { ActionPTR2e } from "@data";
export default class PassivePTR2e extends ActionPTR2e {
    declare type: "passive";

    static override TYPE = "passive" as const;

    static override defineSchema() {
        const fields = foundry.data.fields;
        return {
            ...super.defineSchema(),
            hidden: new fields.BooleanField({ required: true, initial: false, label: "PTR2E.FIELDS.hidden.label", hint: "PTR2E.FIELDS.hidden.hint" }),
        }
    }
}
