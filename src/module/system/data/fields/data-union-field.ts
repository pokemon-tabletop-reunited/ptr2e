import type { AnyObject } from "fvtt-types/utils";
import { StrictArrayField } from "./strict-primitive-fields";


class DataUnionField<
  TField extends foundry.data.fields.DataField.Any,
  Options extends foundry.data.fields.DataField.Options.Any = foundry.data.fields.DataField.DefaultOptions,
  AssignmentType = foundry.data.fields.DataField.AssignmentTypeFor<TField>,
  InitializedType = foundry.data.fields.DataField.InitializedTypeFor<TField>,
  PersistedType = foundry.data.fields.DataField.PersistedTypeFor<TField>,
> extends foundry.data.fields.DataField<
  Options, 
  AssignmentType,
  InitializedType,
  PersistedType
> {
  fields: TField[];

  constructor(
    fields: TField[],
    options: Options
  ) {
    super(options);
    this.fields = fields;
  }

  protected override _cast(value?: AssignmentType): InitializedType {
    //@ts-expect-error - Ignore type error
    if (typeof value === "string") value = value.trim();
    return value as InitializedType;
  }

  override clean(
    value: AssignmentType,
    options?: foundry.data.fields.DataField.CleanOptions,
  ): InitializedType {
    if (Array.isArray(value) && this.fields.some((f) => f instanceof foundry.data.fields.ArrayField)) {
      const arrayField = this.fields.find((f) => f instanceof StrictArrayField);
      const cleanValue = arrayField?.clean(value, options) as InitializedType;
      return (cleanValue ?? value) as InitializedType;
    }

    return super.clean(value, options)
  }

  override validate(
    value: AssignmentType,
    options?: foundry.data.fields.DataField.ValidationOptions<foundry.data.fields.DataField<Options, AssignmentType, InitializedType, PersistedType>>,
  ): foundry.data.validation.DataModelValidationFailure | undefined{
    const { StringField } = foundry.data.fields;
    for (const field of this.fields) {
      if (field.validate(value, options) instanceof foundry.data.validation.DataModelValidationFailure) {
        continue;
      } else if (field instanceof StringField && typeof value !== "string") {
        continue;
      } else {
        return;
      }
    }

    return this.fields[0]!.validate(value, options) as foundry.data.validation.DataModelValidationFailure | undefined;
  }

  override initialize(
    value: PersistedType,
    model: foundry.abstract.DataModel.Any,
    options?: AnyObject,
  ) {
    const field = this.fields.find((f) => !f.validate(value));
    return field?.initialize(value, model, options) as InitializedType;
  }
}

// type MaybeUnionSchemaProp<
//   TField extends foundry.data.fields.DataField,
//   Options extends foundry.data.fields.DataField.Options.Any = foundry.data.fields.DataField.DefaultOptions,
//   AssignmentType = foundry.data.fields.DataField.AssignmentType<Options>,
//   InitializedType = foundry.data.fields.DataField.InitializedType<Options>,
//   PersistedType extends unknown | null | undefined = InitializedType,
// > = foundry.data.fields.MaybeSchemaProp<
//   TField extends foundry.data.fields.DataField<infer _TSourceProp, infer TModelProp, boolean, boolean, boolean> ? TModelProp : never,
//   TRequired,
//   TNullable,
//   THasInitial
// >;

export { DataUnionField };
// export type { MaybeUnionSchemaProp };