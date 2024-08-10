import { HTMLStringTagsElementPTR2e } from "@module/apps/string-tags.ts";

export class SetField<
    TElementField extends foundry.data.fields.DataField,
    TSourceProp extends
        foundry.data.fields.SourcePropFromDataField<TElementField>[] = foundry.data.fields.SourcePropFromDataField<TElementField>[],
    TModelProp extends Set<foundry.data.fields.ModelPropFromDataField<TElementField>> = Set<
        foundry.data.fields.ModelPropFromDataField<TElementField>
    >,
    TRequired extends boolean = false,
    TNullable extends boolean = false,
    THasInitial extends boolean = true,
> extends foundry.data.fields.SetField<
    TElementField,
    TSourceProp,
    TModelProp,
    TRequired,
    TNullable,
    THasInitial
> {
    override _toInput(
        config: foundry.data.fields.FormInputConfig<TModelProp>
    ): HTMLElement | HTMLCollection {
        const e = this.element;

        // Multi-Select Input
        //@ts-expect-error - This is a valid check
        if (e.choices && !config.options) {
            //@ts-expect-error - This is a valid check
            const choices = foundry.data.fields.StringField._getChoices(e.choices, {
                //@ts-expect-error - This is a valid check
                localize: config.localize,
            });
            //@ts-expect-error - This is a valid check
            config.options = Object.entries(choices).map(([value, label]) => ({ value, label }));
        }
        //@ts-expect-error - This is a valid check
        if (config.options) return foundry.applications.fields.createMultiSelectInput(config);

        // Arbitrary String Tags
        //@ts-expect-error - This is a valid check
        if ( e instanceof foundry.data.fields.StringField ) return HTMLStringTagsElementPTR2e.create(config);
        throw new Error(`SetField#toInput is not supported for a ${e.constructor.name} element type`);
    }
}