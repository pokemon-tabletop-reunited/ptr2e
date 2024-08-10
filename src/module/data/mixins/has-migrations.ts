import { TemplateConstructor } from './data-template.ts';

/**
 * Adds migration properties to target data model.
 * @group Mixins
 */
export default function HasMigrations<BaseClass extends TemplateConstructor>(baseClass: BaseClass) {
    class TemplateClass extends baseClass {
        static override defineSchema(): MigrationSchema {
            const fields = foundry.data.fields;

            return {
                ...super.defineSchema(),

                _migration: new fields.SchemaField({
                    version: new fields.NumberField({ required: true, nullable: true, initial: null }),
                    previous: new fields.SchemaField({
                        schema: new fields.NumberField({ required: true, nullable: true, initial: null }),
                        system: new fields.StringField({ required: false, blank: true }),
                        foundry: new fields.StringField({ required: false, blank: true }),
                    }, {required: false, nullable: true, initial: null}),
                }),
            };
        }
    }

    interface TemplateClass extends ModelPropsFromSchema<MigrationSchema> {
        _source: SourceFromSchema<MigrationSchema>;
    }

    return TemplateClass;
}

export interface MigrationSchema extends foundry.data.fields.DataSchema {
    _migration: foundry.data.fields.SchemaField<_MigrationSchema, SourceFromSchema<_MigrationSchema>, ModelPropsFromSchema<_MigrationSchema>, true, false, false>;
}

interface _MigrationSchema extends foundry.data.fields.DataSchema{
    version: foundry.data.fields.NumberField<number, number, true, true, true>;
    previous: foundry.data.fields.SchemaField<_PreviousMigrationSchema, SourceFromSchema<_PreviousMigrationSchema>, ModelPropsFromSchema<_PreviousMigrationSchema>, false, true, true>;
}

interface _PreviousMigrationSchema extends foundry.data.fields.DataSchema {
    schema: foundry.data.fields.NumberField<number, number, true, true, true>;
    system: foundry.data.fields.StringField<string, string, false, false>;
    foundry: foundry.data.fields.StringField<string, string, false, false>;
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