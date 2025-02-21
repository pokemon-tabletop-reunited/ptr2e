import { TemplateConstructor } from './data-template.ts';

/**
 * Adds slug property to target data model.
 * @group Mixins
 */
export default function HasPublication<BaseClass extends TemplateConstructor>(baseClass: BaseClass) {
  class TemplateClass extends baseClass {
    static override defineSchema(): PublicationSchema {
      return {
        ...super.defineSchema(),

        publication: new foundry.data.fields.SchemaField({
          source: new foundry.data.fields.StringField({ required: true, label: "PTR2E.FIELDS.publication.source.label", hint: "PTR2E.FIELDS.publication.source.hint", initial: "" }),
          authors: new foundry.data.fields.SetField(new foundry.data.fields.StringField(), { required: true, label: "PTR2E.FIELDS.publication.authors.label", hint: "PTR2E.FIELDS.publication.authors.hint", initial: []}),
          notes: new foundry.data.fields.HTMLField({ required: false, label: "PTR2E.FIELDS.publication.notes.label", hint: "PTR2E.FIELDS.publication.notes.hint" }),
        }),
      };
    }
  }

  interface TemplateClass extends ModelPropsFromSchema<PublicationSchema> {
    _source: SourceFromSchema<PublicationSchema>;
  }

  return TemplateClass;
}

export interface PublicationSchema extends foundry.data.fields.DataSchema {
  publication: foundry.data.fields.SchemaField<_PublicationSchema, SourceFromSchema<_PublicationSchema>, ModelPropsFromSchema<_PublicationSchema>, true, false, false>;
}

interface _PublicationSchema extends foundry.data.fields.DataSchema {
  source: foundry.data.fields.StringField<string, string, true, false, true>;
  authors: foundry.data.fields.SetField<foundry.data.fields.StringField, string[], Set<string>, true, false, true>;
  notes: foundry.data.fields.HTMLField<string, string, false, false, false>;
}