import type { TemplateConstructor } from './data-template.ts';

const migrationSchema = {
  /**
   * The migration record of the item.
   * @remarks
   * This is a record of the item's migration history, which is used to update the item's data when the system is updated.
   */
  _migration: new foundry.data.fields.SchemaField({
    version: new foundry.data.fields.NumberField({ required: true, nullable: true, initial: null }),
    previous: new foundry.data.fields.SchemaField({
      schema: new foundry.data.fields.NumberField({ required: true, nullable: true, initial: null }),
      system: new foundry.data.fields.StringField({ required: false, blank: true }),
      foundry: new foundry.data.fields.StringField({ required: false, blank: true }),
    }, { required: false, nullable: true, initial: null }),
  }),
}

export type MigrationSchema = typeof migrationSchema;

/**
 * Adds migration properties to target data model.
 * @group Mixins
 */
export default function HasMigrations<BaseClass extends TemplateConstructor>(baseClass: BaseClass) {
  abstract class TemplateClass extends baseClass {
    static override defineSchema(): MigrationSchema {
      return {
        ...super.defineSchema(),
        ...migrationSchema
      };
    }
  }

  interface TemplateClass extends foundry.data.fields.SchemaField.InitializedType<MigrationSchema> {
    _source: foundry.data.fields.SchemaField.PersistedType<MigrationSchema>;
  }

  return TemplateClass;
}

/** The tracked schema data of actors and items */
export interface NewDocumentMigrationRecord {
  version: null;
  previous: null;
}

export interface MigratedDocumentMigrationRecord {
  version: number | null;
  previous: {
    schema: number | null;
    system?: string;
    foundry?: string;
  } | null;
}

export type MigrationRecord = NewDocumentMigrationRecord | MigratedDocumentMigrationRecord;