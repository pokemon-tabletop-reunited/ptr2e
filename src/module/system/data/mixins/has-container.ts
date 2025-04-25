import { MixableTypeDataModel, mixSchema } from "./data";

const containerSchema = {
  container: new foundry.data.fields.DocumentUUIDField({ required: false, nullable: true, label: "PTR2E.FIELDS.container.label", hint: "PTR2E.FIELDS.container.hint" })
};

export function HasContainer<BaseClass extends typeof MixableTypeDataModel>(baseClass: BaseClass) {
  abstract class TemplateClass extends mixSchema(baseClass, containerSchema) {
    override prepareBaseData() {
      super.prepareBaseData();
      if (!this._source.container) return;

      Object.defineProperty(
        this,
        "container",
        {
          value: fromUuidSync(this._source.container as ValidUUID, this.parent),
          writable: false,
          enumerable: false,
        }
      )
    }
  }

  return TemplateClass;
}

export type ContainerSchema = typeof containerSchema; 