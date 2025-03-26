
import { sluggify, type SlugCamel } from "../../util/misc.ts";

import StringField = foundry.data.fields.StringField;
import { StrictStringField } from "./strict-primitive-fields.ts";

/** A sluggified string field */
class SlugField<
  Options extends SlugFieldOptions = Omit<StringField.DefaultOptions, 'required'> & { required: true},
  AssignmentType = StringField.AssignmentType<Options>,
  InitializedType = StringField.InitializedType<Options>,
  PersistedType extends string | null | undefined = StringField.InitializedType<Options>
> extends StrictStringField<Options, AssignmentType, InitializedType, PersistedType> {
  constructor(options?: Options) {
    options ??= {} as Options;
    options.blank ??= false;
    options.camel ??= null;
    super(options);
  }

  protected static override get _defaults(): StringField.Options<unknown> & {camel: null} {
    return { ...super._defaults, nullable: true, initial: null, camel: null };
  }

  protected override _cleanType(value: InitializedType, options?: foundry.data.fields.DataField.CleanOptions): InitializedType {
    const slug = super._cleanType(value, options);
    const camel = this.options.camel ?? null;
    return typeof slug === "string" ? sluggify(slug, { camel }) as InitializedType : slug;
  }
}

interface SlugFieldOptions extends StringField.Options {
  camel?: SlugCamel;
}

export { SlugField };
export type { SlugFieldOptions };