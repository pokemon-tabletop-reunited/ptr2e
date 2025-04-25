import { MixableTypeDataModel, mixSchema } from "./data";

const publicationSchema = {
  publication: new foundry.data.fields.SchemaField({
    source: new foundry.data.fields.StringField({ required: true, label: "PTR2E.FIELDS.publication.source.label", hint: "PTR2E.FIELDS.publication.source.hint", initial: "" }),
    authors: new foundry.data.fields.SetField(new foundry.data.fields.StringField(), { required: true, label: "PTR2E.FIELDS.publication.authors.label", hint: "PTR2E.FIELDS.publication.authors.hint", initial: []}),
    notes: new foundry.data.fields.HTMLField({ required: true, blank: true, label: "PTR2E.FIELDS.publication.notes.label", hint: "PTR2E.FIELDS.publication.notes.hint", initial: ""}),
  })
};

export function HasPublication<BaseClass extends typeof MixableTypeDataModel>(baseClass: BaseClass) {
  abstract class TemplateClass extends mixSchema(baseClass, publicationSchema) { }

  return TemplateClass;
}

export type PublicationSchema = typeof publicationSchema;