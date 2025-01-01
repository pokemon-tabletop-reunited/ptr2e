import type { AnyObject, SimpleMerge } from "fvtt-types/utils";
import fields = foundry.data.fields;

/** A `StringField` that does not cast the source value */
class StrictStringField<
  Options extends fields.StringField.Options = fields.StringField.DefaultOptions,
  AssignmentType = fields.StringField.AssignmentType<Options>,
  InitializedType = fields.StringField.InitializedType<Options>,
  PersistedType extends string | null | undefined = fields.StringField.InitializedType<Options>
> extends fields.StringField<Options, AssignmentType, InitializedType, PersistedType> {
  protected override _cast(value: AssignmentType): InitializedType {
    return value as unknown as InitializedType;
  }
}

/** A `NumberField` that does not cast the source value */
class StrictNumberField<
  Options extends fields.NumberField.Options = fields.NumberField.DefaultOptions,
  AssignmentType = fields.NumberField.AssignmentType<Options>,
  InitializedType = fields.NumberField.InitializedType<Options>,
  PersistedType extends number | null | undefined = fields.NumberField.InitializedType<Options>
> extends fields.NumberField<Options, AssignmentType, InitializedType, PersistedType> {
  protected override _cast(value: AssignmentType): InitializedType {
    return value as unknown as InitializedType;
  }
}

/** A `BooleanField` that does not cast the source value */
class StrictBooleanField<
  Options extends fields.BooleanField.Options = fields.BooleanField.DefaultOptions,
  AssignmentType = fields.BooleanField.AssignmentType<Options>,
  InitializedType = fields.BooleanField.InitializedType<Options>,
  PersistedType extends boolean | null | undefined = fields.BooleanField.InitializedType<SimpleMerge<Options, fields.BooleanField.DefaultOptions>>
> extends fields.BooleanField<Options, AssignmentType, InitializedType, PersistedType> {
  protected override _cast(value: AssignmentType): InitializedType {
    return value as unknown as InitializedType;
  }
}

class StrictArrayField<
  ElementFieldType extends foundry.data.fields.DataField.Any | foundry.abstract.Document.AnyConstructor,
  Options extends foundry.data.fields.ArrayField.AnyOptions = foundry.data.fields.ArrayField.DefaultOptions<
    foundry.data.fields.ArrayField.AssignmentElementType<ElementFieldType>
  >,
  AssignmentElementType = foundry.data.fields.ArrayField.AssignmentElementType<ElementFieldType>,
  InitializedElementType = foundry.data.fields.ArrayField.InitializedElementType<ElementFieldType>,
  AssignmentType = foundry.data.fields.ArrayField.AssignmentType<AssignmentElementType, Options>,
  InitializedType = foundry.data.fields.ArrayField.InitializedType<AssignmentElementType, InitializedElementType, Options>,
  PersistedElementType = foundry.data.fields.ArrayField.PersistedElementType<ElementFieldType>,
  PersistedType extends PersistedElementType[] | null | undefined = foundry.data.fields.ArrayField.PersistedType<
    AssignmentElementType,
    PersistedElementType,
    Options
  >
> extends fields.ArrayField<ElementFieldType, Options, AssignmentElementType, InitializedElementType, AssignmentType, InitializedType, PersistedElementType, PersistedType> {
  /** Don't wrap a non-array in an array */
  protected override _cast(value: AssignmentType): InitializedType {
    return value as unknown as InitializedType;
  }

  /** Parent method assumes array-wrapping: pass through unchanged */
  protected override _cleanType(value: InitializedType): InitializedType {
    return Array.isArray(value) ? super._cleanType(value) : value;
  }

  override initialize(
    value: PersistedType,
    model: foundry.abstract.DataModel.Any,
    options?: AnyObject,
  ) {
    return Array.isArray(value) ? super.initialize(value, model, options) : () => null;
  }
}

class StrictObjectField<
  Options extends fields.DataField.Options<AnyObject> = fields.ObjectField.DefaultOptions,
  AssignmentType = fields.ObjectField.AssignmentType<Options>,
  InitializedType = fields.ObjectField.InitializedType<Options>,
  PersistedType extends AnyObject | null | undefined = fields.ObjectField.InitializedType<Options>
> extends fields.ObjectField<Options, AssignmentType, InitializedType, PersistedType> {
  protected override _cast(value: AssignmentType): InitializedType {
    return value as unknown as InitializedType;
  }
}

export { StrictStringField, StrictNumberField, StrictBooleanField, StrictArrayField, StrictObjectField };