import { ContainerPTR2e } from '@item';
import { TemplateConstructor } from './data-template.ts';

/**
 * Adds container property to target data model.
 * @group Mixins
 */
export default function HasContainer<BaseClass extends TemplateConstructor>(baseClass: BaseClass) {
  abstract class TemplateClass extends baseClass {
    static override defineSchema(): ContainerSchema {
      const fields = foundry.data.fields;

      return {
        ...super.defineSchema(),

        container: new fields.DocumentUUIDField({ required: false, nullable: true, label: "PTR2E.FIELDS.container.label", hint: "PTR2E.FIELDS.container.hint" })
      };
    }

    override prepareBaseData() {
      super.prepareBaseData();
      if (!this._source.container) return;

      Object.defineProperty(
        this,
        "container",
        {
          value: fromUuidSync(this._source.container, this.parent as ClientDocument | null) as ContainerPTR2e | null,
          writable: false,
          enumerable: false,
        }
      )
    }
  }

  interface TemplateClass extends ModelPropsFromSchema<ContainerSchema> {
    /**
   * The container that the item is in.
   * @remarks
   * This is the container that the item is in, if any.
   * If the item is not in a container, this will be `null`.
   */
    container: ContainerPTR2e | null;

    _source: SourceFromSchema<ContainerSchema>;
  }

  return TemplateClass;
}
export interface ContainerSchema extends foundry.data.fields.DataSchema {
  container: foundry.data.fields.DocumentUUIDField<foundry.abstract.Document, false, true, false>;
}