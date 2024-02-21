import { ItemPTR2e } from '@item';
import { TemplateConstructor } from './data-template.ts';

const IDENTIFIED_STATUS = ["identified", "unidentified", "misidentified"] as const;
type IdentificationStatus = typeof IDENTIFIED_STATUS[number];

/**
 * Adds Identification property to target data model.
 */
export default function HasIdentification<BaseClass extends TemplateConstructor>(baseClass: BaseClass) {
    abstract class TemplateClass extends baseClass {

        /**
         * The identification status of the item.
         * @defaultValue `'identified'`
         * @remarks
         * This is the identification status of the item.
         */
        abstract identification: {
            /**
             * The item that the item is misidentified as.
             */
            misidentified: ItemPTR2e | null;
            /**
             * The identification status of the item.
             * @defaultValue `'identified'`
             */
            status: IdentificationStatus;
            /**
             * The unidentified item data.
             */
            unidentified: {
                /**
                 * The name of the unidentified item.
                 * @defaultValue `'Unidentified Item'`
                 */
                name: string;
                /**
                 * The image of the unidentified item.
                 * @defaultValue `'systems/ptu/css/images/icons/item_icon.png'`
                 */
                img: string;
                /**
                 * The description of the unidentified item.
                 * @defaultValue `'<p>Unidentified Item</p>'`
                 */
                description: string;
            }
        }

        declare _source: InstanceType<typeof baseClass>['_source'] & {
            identification: {
                misidentified: DocumentUUID | null;
                status: IdentificationStatus;
                unidentified: {
                    name: string;
                    img: string;
                    description: string;
                }
            }
        }

        static override defineSchema(): foundry.data.fields.DataSchema {
            const fields = foundry.data.fields;

            return {
                ...super.defineSchema(),

                identification: new fields.SchemaField({
                    misidentified: new fields.DocumentUUIDField({ required: false, nullable: true }),
                    status: new fields.StringField({ required: true, initial: "identified", choices: IDENTIFIED_STATUS }),
                    unidentified: new fields.SchemaField({
                        name: new fields.StringField({ required: true, initial: "Unidentified Item" }),
                        img: new fields.FilePathField({ required: true, categories: ["IMAGE"], initial: "systems/ptu/css/images/icons/item_icon.png" }),
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

    return TemplateClass;
}