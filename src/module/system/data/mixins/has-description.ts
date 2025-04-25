import { MixableTypeDataModel, mixSchema } from "./data";

const descriptionSchema = {
  description: new foundry.data.fields.HTMLField({ required: true, initial: "", label: "PTR2E.FIELDS.description.label", hint: "PTR2E.FIELDS.description.hint" }),
};

export function HasDescription<BaseClass extends typeof MixableTypeDataModel>(baseClass: BaseClass) {
  abstract class TemplateClass extends mixSchema(baseClass, descriptionSchema) { }

  return TemplateClass;
}

export type DescriptionSchema = typeof descriptionSchema;