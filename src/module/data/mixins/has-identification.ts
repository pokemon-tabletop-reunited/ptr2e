import { ItemPTR2e } from '@item';
import { TemplateConstructor } from './data-template.ts';
import { IdentificationStatus, PTRCONSTS } from '@data';

/**
 * Adds Identification property to target data model.
 * @group Mixins
 */
export default function HasIdentification<BaseClass extends TemplateConstructor>(baseClass: BaseClass) {
    abstract class TemplateClass extends baseClass {
        static override defineSchema(): IdentificationSchema {
            const fields = foundry.data.fields;

            return {
                ...super.defineSchema(),

                identification: new fields.SchemaField({
                    misidentified: new fields.DocumentUUIDField({ required: false, nullable: true }),
                    status: new fields.StringField({ required: true, initial: PTRCONSTS.IdentificationStatuses.IDENTIFIED, choices: Object.values(PTRCONSTS.IdentificationStatuses) }),
                    unidentified: new fields.SchemaField({
                        name: new fields.StringField({ required: true, initial: "Unidentified Item" }),
                        img: new fields.FilePathField({ required: true, categories: ["IMAGE"], initial: "systems/ptu/css/images/icons/gear_icon.png" }),
                        description: new fields.HTMLField({ required: true, initial: "<p>Unidentified Item</p>" }),
                    })
                }),
            };
        }

        override prepareBaseData() {
            super.prepareBaseData();

            if (this._source.identification.misidentified) {
                Object.defineProperty(
                    this.identification,
                    "misidentified",
                    {
                        value: fromUuidSync(this._source.identification.misidentified, this.parent as ClientDocument | null) as ItemPTR2e | null,
                        writable: false,
                        enumerable: false,
                    }
                )
            }
        }
    }

    interface TemplateClass extends ModelPropsFromSchema<IdentificationSchema> {
        // /**
        //  * The identification status of the item.
        //  * @defaultValue `'identified'`
        //  * @remarks
        //  * This is the identification status of the item.
        //  * It can be one of `'identified'`, `'unidentified'`, or `'misidentified'`.
        //  * @example
        //  * ```typescript
        //  * const item = new ItemPTR2e({ 
        //  *      name: 'Flashlight', 
        //  *      "system.identification": { 
        //  *          status: 'unidentified'
        //  *          unidentified: {
        //  *             name: 'Unidentified Flashlight',
        //  *             img: 'systems/ptu/css/images/icons/gear_icon.png',
        //  *             description: 'Unidentified Flashlight, it probably glows?'
        //  *         } 
        //  *      } 
        //  * });
        //  * console.log(item.system.identification.status); // 'unidentified'
        //  * console.log(item.system.identification.unidentified.name); // 'Unidentified Flashlight'
        //  * ```
        //  */
        // identification: {
        //     /**
        //      * The item that the item is misidentified as.
        //      */
        //     misidentified: ItemPTR2e | null;
        //     /**
        //      * The identification status of the item.
        //      * @defaultValue `'identified'`
        //      */
        //     status: IdentificationStatus;
        //     /**
        //      * The unidentified item data.
        //      */
        //     unidentified: {
        //         /**
        //          * The name of the unidentified item.
        //          * @defaultValue `'Unidentified Item'`
        //          */
        //         name: string;
        //         /**
        //          * The image of the unidentified item.
        //          * @defaultValue `'systems/ptu/css/images/icons/gear_icon.png'`
        //          */
        //         img: ImageFilePath;
        //         /**
        //          * The description of the unidentified item.
        //          * @defaultValue `'Unidentified Item'`
        //          */
        //         description: string;
        //     }
        // }

        _source: SourceFromSchema<IdentificationSchema>;
    }

    return TemplateClass;
}

export interface IdentificationSchema extends foundry.data.fields.DataSchema {
    identification: foundry.data.fields.SchemaField<_IdentificationSchema, SourceFromSchema<_IdentificationSchema>>;
}

interface _IdentificationSchema extends foundry.data.fields.DataSchema {
    misidentified: foundry.data.fields.DocumentUUIDField<foundry.abstract.Document, false, true, false>;
    status: foundry.data.fields.StringField<IdentificationStatus, string, true, false, true>;
    unidentified: foundry.data.fields.SchemaField<_UnidentifiedSchema, SourceFromSchema<_UnidentifiedSchema>>;
}

interface _UnidentifiedSchema extends foundry.data.fields.DataSchema {
    name: foundry.data.fields.StringField<string, string, true, false, true>;
    img: foundry.data.fields.FilePathField<ImageFilePath, ImageFilePath, true, false, true>;
    description: foundry.data.fields.HTMLField<string, string, true, false, true>;
}