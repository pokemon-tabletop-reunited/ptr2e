import type { ContainerPTR2e } from '@item';
import type { TemplateConstructor } from './data-template.ts';

const containerSchema = {
  // /**
  //  * The container that the item is in.
  //  * @remarks
  //  * This is the container that the item is in, if any.
  //  * If the item is not in a container, this will be `null`.
  //  */
  container: new foundry.data.fields.DocumentUUIDField({ required: false, nullable: true, label: "PTR2E.FIELDS.container.label", hint: "PTR2E.FIELDS.container.hint" })
}

export type ContainerSchema = typeof containerSchema;

/**
 * Adds container property to target data model.
 * @group Mixins
 */
export default function HasContainer<BaseClass extends TemplateConstructor>(baseClass: BaseClass) {
  abstract class TemplateClass extends baseClass {
    static override defineSchema(): ContainerSchema {
      return {
        ...super.defineSchema(),
        ...containerSchema
      };
    }

    override prepareBaseData() {
      super.prepareBaseData();
      if (!this._source.container) return;

      Object.defineProperty(
        this,
        "container",
        {
          value: fromUuidSync(this._source.container, this.parent) as ContainerPTR2e | null,
          writable: false,
          enumerable: false,
        }
      )
    }
  }

  interface TemplateClass extends foundry.data.fields.SchemaField.InitializedType<ContainerSchema> {
    _source: foundry.data.fields.SchemaField.PersistedType<ContainerSchema>;
  }

  return TemplateClass;
}