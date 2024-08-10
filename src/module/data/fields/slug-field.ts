import { SlugCamel, sluggify } from "@utils";
import { StrictStringField } from "./strict-primitive-fields.ts";

/** A sluggified string field */
class SlugField<
    TSourceProp extends string = string,
    TModelProp extends string = string,
    TRequired extends boolean = true,
    TNullable extends boolean = boolean,
    THasInitial extends boolean = boolean,
> extends StrictStringField<TSourceProp, TModelProp, TRequired, TNullable, THasInitial> {
    constructor(options: SlugFieldOptions<TSourceProp, TRequired, TNullable, THasInitial> = {}) {
        options.blank ??= false;
        options.camel ??= null;
        super(options);
    }

    protected static override get _defaults(): SlugFieldOptions<string, boolean, boolean, boolean> {
        return { ...super._defaults, nullable: true, initial: null, camel: null };
    }

    protected override _cleanType(
        value: Maybe<string>,
        options?: foundry.data.fields.CleanFieldOptions,
    ): foundry.data.fields.MaybeSchemaProp<string, TRequired, TNullable, THasInitial>;
    protected override _cleanType(value: Maybe<string>, options?: foundry.data.fields.CleanFieldOptions): unknown {
        const slug = super._cleanType(value, options);
        const camel = this.options.camel ?? null;
        return typeof slug === "string" ? sluggify(slug, { camel }) : slug;
    }
}

interface SlugField<
    TSourceProp extends string = string,
    TModelProp extends string = string,
    TRequired extends boolean = true,
    TNullable extends boolean = boolean,
    THasInitial extends boolean = boolean,
> extends StrictStringField<TSourceProp, TModelProp, TRequired, TNullable, THasInitial> {
    options: SlugFieldOptions<TSourceProp, TRequired, TNullable, THasInitial>;
}

interface SlugFieldOptions<TSourceProp extends string, TRequired extends boolean, TNullable extends boolean, THasInitial extends boolean>
    extends foundry.data.fields.StringFieldOptions<TSourceProp, TRequired, TNullable, THasInitial> {
    camel?: SlugCamel;
}

export { SlugField };
export type { SlugFieldOptions };