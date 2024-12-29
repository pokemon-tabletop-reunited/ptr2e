import type { AnyObject, SimpleMerge } from "fvtt-types/utils";

class RecursiveEmbeddedDataField<
  Model extends foundry.abstract.DataModel<foundry.data.fields.DataSchema, foundry.abstract.DataModel.Any>,
  Fields extends foundry.data.fields.DataSchema,
  Options extends foundry.data.fields.SchemaField.Options<Fields> = foundry.data.fields.SchemaField.DefaultOptions,
  AssignmentType = foundry.data.fields.SchemaField.AssignmentType<Fields, SimpleMerge<Options, foundry.data.fields.SchemaField.DefaultOptions>>,
  InitializedType = foundry.data.fields.SchemaField.InitializedType<Fields, SimpleMerge<Options, foundry.data.fields.SchemaField.DefaultOptions>>,
  PersistedType extends AnyObject | null | undefined = foundry.data.fields.SchemaField.PersistedType<
    Fields,
    SimpleMerge<Options, foundry.data.fields.SchemaField.DefaultOptions>
  >,
> extends foundry.data.fields.SchemaField<
  Fields, Options, AssignmentType, InitializedType, PersistedType
> {
  declare model: ConstructorOf<Model>

  constructor(
    model: ConstructorOf<Model>,
    options?: Options,
    context: Record<string, unknown> & {recursion?: number} = {}
  ) {
    if (!foundry.utils.isSubclass(model, foundry.abstract.DataModel)) {
      throw new Error("An EmbeddedDataField must specify a DataModel class as its type");
    }

    const recursion = context.recursion ?? 0;

    // Create an independent copy of the model schema
    //@ts-expect-error - This is correct
    const fields = model.defineSchema(recursion + 1);
    //@ts-expect-error - This is correct
    super(fields, options, context);

    this.model = model;
  }

  
  override clean(value: AssignmentType, options?: foundry.data.fields.DataField.CleanOptions) {
    return super.clean(value, { ...options, source: value as AnyObject });
  }

  override validate(value: AssignmentType, options?: foundry.data.fields.DataField.ValidationOptions<foundry.data.fields.DataField<Options, AssignmentType, InitializedType, PersistedType>>) {
    return super.validate(value, { ...options, source: value as AnyObject });
  }

  override initialize(value: PersistedType, model?: foundry.abstract.DataModel.Any, options?: AnyObject): InitializedType {
    if (!value) return value as unknown as InitializedType;
    const m = new this.model(value, { parent: model, ...options });
    Object.defineProperty(m, "schema", { value: this });
    return m as unknown as InitializedType;
  }

  override toObject(value: InitializedType): PersistedType {
    if (!value) return value as unknown as PersistedType;
    return (value as unknown as foundry.abstract.Document.Any).toObject(false) as PersistedType;
  }

  override has(fieldName: string): boolean {
    if(fieldName === 'children') return true;
    return super.has(fieldName);
  }

  override migrateSource(_sourceData: AnyObject, fieldData: PersistedType) {
    if (fieldData) (this.model as unknown as typeof foundry.abstract.DataModel<foundry.data.fields.DataSchema, foundry.abstract.DataModel.Any>).migrateDataSafe(fieldData);
  }

  override _validateModel(changes: AnyObject) {
    (this.model as unknown as typeof foundry.abstract.DataModel<foundry.data.fields.DataSchema, foundry.abstract.DataModel.Any>).validateJoint(changes);
  }
}

export { RecursiveEmbeddedDataField };