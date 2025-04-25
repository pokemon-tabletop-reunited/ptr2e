import { MixableTypeDataModel, mixSchema } from "./data";

const migrationsSchema = {
  _migration: new foundry.data.fields.SchemaField({
    version: new foundry.data.fields.NumberField({ required: true, nullable: true, initial: null }),
    previous: new foundry.data.fields.SchemaField({
      schema: new foundry.data.fields.NumberField({ required: true, nullable: true, initial: null }),
      system: new foundry.data.fields.StringField({ required: false, blank: true }),
      foundry: new foundry.data.fields.StringField({ required: false, blank: true }),
    }, { required: false, nullable: true, initial: null }),
  })
};

export function HasMigrations<BaseClass extends typeof MixableTypeDataModel>(baseClass: BaseClass) {
  abstract class TemplateClass extends mixSchema(baseClass, migrationsSchema) { }

  return TemplateClass;
}

export type MigrationsSchema = typeof migrationsSchema;