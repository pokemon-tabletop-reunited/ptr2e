import { sluggify } from "../../util/misc";
import { SlugField } from "../fields/slug-field";
import { MixableTypeDataModel, mixSchema } from "./data";

const slugSchema = {
  slug: new SlugField({
    required: true,
    label: "PTR2E.FIELDS.slug.label",
    hint: "PTR2E.FIELDS.slug.hint",
  }),
};

export function HasSlug<BaseClass extends typeof MixableTypeDataModel>(baseClass: BaseClass) {
  abstract class TemplateClass extends mixSchema(baseClass, slugSchema) {
    override prepareBaseData() {
      super.prepareBaseData();

      this.slug ||= sluggify(this.parent.name ?? "");
    }
  }
  
  return TemplateClass;
}

export type SlugSchema = typeof slugSchema;