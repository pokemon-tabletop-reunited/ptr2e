import type { ItemPTR2e } from '@item';
import type { TemplateConstructor } from './data-template.ts';
import { PTRCONSTS } from '@data';

const identificationSchema = {
  /**
   * The identification status of the item.
   * @defaultValue `'identified'`
   * @remarks
   * This is the identification status of the item.
   * It can be one of `'identified'`, `'unidentified'`, or `'misidentified'`.
   * @example
   * ```typescript
   * const item = new ItemPTR2e({ 
   *      name: 'Flashlight', 
   *      "system.identification": { 
   *          status: 'unidentified'
   *          unidentified: {
   *             name: 'Unidentified Flashlight',
   *             img: 'systems/ptu/css/images/icons/gear_icon.png',
   *             description: 'Unidentified Flashlight, it probably glows?'
   *         } 
   *      } 
   * });
   * console.log(item.system.identification.status); // 'unidentified'
   * console.log(item.system.identification.unidentified.name); // 'Unidentified Flashlight'
   * ```
   */
  identification: new foundry.data.fields.SchemaField({
    /**
     * The item that the item is misidentified as.
     */
    misidentified: new foundry.data.fields.DocumentUUIDField({ required: false, nullable: true }),
    /**
     * The identification status of the item.
     * @defaultValue `'identified'`
     */
    status: new foundry.data.fields.StringField({ required: true, initial: PTRCONSTS.IdentificationStatuses.IDENTIFIED, choices: Object.values(PTRCONSTS.IdentificationStatuses) }),
    /**
     * The unidentified item data.
     */
    unidentified: new foundry.data.fields.SchemaField({
      /**
       * The name of the unidentified item.
       * @defaultValue `'Unidentified Item'`
       */
      name: new foundry.data.fields.StringField({ required: true, initial: "Unidentified Item" }),
      /**
       * The image of the unidentified item.
       * @defaultValue `'systems/ptu/css/images/icons/gear_icon.png'`
       */
      img: new foundry.data.fields.FilePathField({ required: true, categories: ["IMAGE"], initial: "systems/ptu/css/images/icons/gear_icon.png" }),
      /**
       * The description of the unidentified item.
       * @defaultValue `'Unidentified Item'`
       */
      description: new foundry.data.fields.HTMLField({ required: true, initial: "<p>Unidentified Item</p>" }),
    })
  })
}

export type IdentificationSchema = typeof identificationSchema;

/**
 * Adds Identification property to target data model.
 * @group Mixins
 */
export default function HasIdentification<BaseClass extends TemplateConstructor>(baseClass: BaseClass) {
  abstract class TemplateClass extends baseClass {
    static override defineSchema(): IdentificationSchema {
      return {
        ...super.defineSchema(),
        ...identificationSchema
      };
    }

    override prepareBaseData() {
      super.prepareBaseData();

      if (this._source.identification.misidentified) {
        Object.defineProperty(
          this.identification,
          "misidentified",
          {
            value: fromUuidSync(this._source.identification.misidentified, this.parent) as ItemPTR2e | null,
            writable: false,
            enumerable: false,
          }
        )
      }
    }
  }

  interface TemplateClass extends foundry.data.fields.SchemaField.InnerInitializedType<IdentificationSchema> {
    _source: foundry.data.fields.SchemaField.PersistedType<IdentificationSchema>;
  }

  return TemplateClass;
}