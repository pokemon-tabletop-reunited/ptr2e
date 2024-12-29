import type { AnyObject } from "fvtt-types/utils";
import type { StringField } from "node_modules/fvtt-types/src/foundry/common/data/fields.d.mts";

const { fields } = foundry.data;

/** A `StringField` that does not cast the source value */
class StrictStringField<
  Options extends StringField.Options = StringField.DefaultOptions,
  AssignmentType = StringField.AssignmentType<Options>,
  InitializedType = StringField.InitializedType<Options>,
  PersistedType extends string | null | undefined = StringField.InitializedType<Options>
> extends fields.StringField<Options, AssignmentType, InitializedType, PersistedType> {
  protected override _cast(value: AssignmentType): InitializedType {
    return value as unknown as InitializedType;
  }
}

/** A `NumberField` that does not cast the source value */
class StrictNumberField<
  TSourceProp extends number,
  TModelProp = TSourceProp,
  TRequired extends boolean = false,
  TNullable extends boolean = true,
  THasInitial extends boolean = true,
> extends fields.NumberField<TSourceProp, TModelProp, TRequired, TNullable, THasInitial> {
  protected override _cast(value: unknown): unknown {
    return value;
  }
}

/** A `BooleanField` that does not cast the source value */
class StrictBooleanField<
  TRequired extends boolean = false,
  TNullable extends boolean = false,
  THasInitial extends boolean = true,
> extends fields.BooleanField<boolean, boolean, TRequired, TNullable, THasInitial> {
  protected override _cast(value: unknown): unknown {
    return value;
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
  TSourceProp extends object,
  TModelProp = TSourceProp,
  TRequired extends boolean = true,
  TNullable extends boolean = false,
  THasInitial extends boolean = true,
> extends fields.ObjectField<TSourceProp, TModelProp, TRequired, TNullable, THasInitial> {
  protected override _cast(value: unknown): unknown {
    return value;
  }
}

export { StrictStringField, StrictNumberField, StrictBooleanField, StrictArrayField, StrictObjectField };