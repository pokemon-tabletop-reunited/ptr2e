import { TemplateConstructor } from './data-template.ts';

/**
 * Adds description property to target data model.
 * @group Mixins
 */
export default function HasDescription<BaseClass extends TemplateConstructor>(baseClass: BaseClass) {
    class TemplateClass extends baseClass {
        static override defineSchema(): DescriptionSchema {
            const fields = foundry.data.fields;

            return {
                ...super.defineSchema(),

                description: new fields.HTMLField({ required: true, initial: "", label: "PTR2E.FIELDS.description.label", hint: "PTR2E.FIELDS.description.hint"}),
            };
        }
    }

    interface TemplateClass extends ModelPropsFromSchema<DescriptionSchema> {
        /**
         * A description of the item.
         * @defaultValue `''`
         * @remarks
         * This is a description of the item, which can be as long as necessary.
         * It is often used to provide the effects of the item, or to provide a more detailed description of the item's appearance.
         */
        description: string;

        _source: SourceFromSchema<DescriptionSchema>;
    }

    return TemplateClass;
}

export interface DescriptionSchema extends foundry.data.fields.DataSchema {
    description: foundry.data.fields.HTMLField<string, string, true, false>;
}