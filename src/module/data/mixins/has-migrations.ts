import { TemplateConstructor } from './data-template.ts';

/**
 * Adds migration properties to target data model.
 * @group Mixins
 */
export default function HasMigrations<BaseClass extends TemplateConstructor>(baseClass: BaseClass) {
    class TemplateClass extends baseClass {
        static override defineSchema(): foundry.data.fields.DataSchema {
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

    interface TemplateClass {
        _migration: MigrationRecord;

        _source: InstanceType<typeof baseClass>['_source'] & {
            _migration: MigrationRecord;
        }
    }

    return TemplateClass;
}

/** The tracked schema data of actors and items */
export interface NewDocumentMigrationRecord {
    version: null;
    previous: null;
}

export interface MigratedDocumentMigrationRecord {
    version: number;
    previous: {
        schema: number | null;
        system?: string;
        foundry?: string;
    } | null;
}

export type MigrationRecord = NewDocumentMigrationRecord | MigratedDocumentMigrationRecord;