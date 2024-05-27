import ResolvableValueField from "@module/data/fields/resolvable-value-field.ts";
import ChangeModel from "../changes/change.ts";
import { ItemPTR2e, ItemSourcePTR2e } from "@item";
import { StringField } from "types/foundry/common/data/fields.js";

class ItemAlteration extends foundry.abstract.DataModel<ChangeModel> {
    static VALID_PROPERTIES = [

    ] as const;

    static override defineSchema(){
        const fields = foundry.data.fields;
        return {
            mode: new fields.StringField({
                required: true,
                choices: ["add", "downgrade", "multiply", "override", "remove", "subtract", "upgrade"].reduce<Record<string,string>>((acc, mode) => ({...acc, [mode]: mode}), {}),
            }),
            property: new fields.StringField({
                required: true,
                choices: this.VALID_PROPERTIES
            }),
            value: new ResolvableValueField()
        }
    }

    get change(): ChangeModel {
        return this.parent;
    }

    applyTo(item: ItemPTR2e | ItemSourcePTR2e): void {
        console.log(`Applying ${this.mode} alteration to ${this.property} on ${item.name}`)
    }
}

interface ItemAlteration extends foundry.abstract.DataModel<ChangeModel>, ModelPropsFromSchema<ItemAlterationSchema> {}

type ItemAlterationSchema = {
    mode: StringField<AELikeChangeMode, AELikeChangeMode, true, false,false>;
    property: StringField<ItemAlterationProperty, ItemAlterationProperty, true, false, false>;
    value: ResolvableValueField<true, true, false>;
}

type ItemAlterationProperty = (typeof ItemAlteration.VALID_PROPERTIES)[number];
type AELikeChangeMode = "add" | "downgrade" | "multiply" | "override" | "remove" | "subtract" | "upgrade";

export { ItemAlteration }
export type { ItemAlterationProperty, ItemAlterationSchema }