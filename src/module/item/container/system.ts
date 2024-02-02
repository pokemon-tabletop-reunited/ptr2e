import { ContainerPTR2e } from "@item";
import { GearSystemPTR2e } from "../gear/system.ts";

class ContainerSystemPTR2e extends GearSystemPTR2e {
    static override defineSchema() {
        const fields = foundry.data.fields;
        const schema = Object.assign(super.defineSchema(), {
            collapsed: new fields.BooleanField({required: true, initial: false}),
        })
        delete schema["actions"];
        delete schema["identification"];
        return schema;
    }
}

interface ContainerSystemPTR2e extends GearSystemPTR2e {
    type: "container";

    collapsed: boolean;

    parent: ContainerPTR2e;

    // Removed fields
    actions: never;
    identification: never;
}

export { ContainerSystemPTR2e };