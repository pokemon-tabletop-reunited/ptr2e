import { ChangeModelTypes } from "../models";
import { MixableTypeDataModel, mixSchema } from "./data";

const changesSchema = {
  changes: new foundry.data.fields.ArrayField(new foundry.data.fields.TypedSchemaField(ChangeModelTypes(), { required: true, nullable: false }),
    { required: true, nullable: false, initial: [] }
  )
};

export function HasChanges<BaseClass extends typeof MixableTypeDataModel>(baseClass: BaseClass) {
  abstract class TemplateClass extends mixSchema(baseClass, changesSchema) { }

  return TemplateClass;
}

export type ChangesSchema = typeof changesSchema;