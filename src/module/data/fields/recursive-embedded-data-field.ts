class RecursiveEmbeddedDataField<
  TModelProp extends foundry.abstract.DataModel = foundry.abstract.DataModel,
  TRequired extends boolean = true,
  TNullable extends boolean = false,
  THasInitial extends boolean = true,
> extends foundry.data.fields.SchemaField<
  TModelProp["schema"]["fields"],
  SourceFromSchema<TModelProp["schema"]["fields"]>,
  TModelProp,
  TRequired,
  TNullable,
  THasInitial
> {
  declare model: ConstructorOf<TModelProp>;

  /**
   * @param {typeof DataModel} model          The class of DataModel which should be embedded in this field
   * @param {DataFieldOptions} [options]      Options which configure the behavior of the field
   * @param {DataFieldContext} [context]      Additional context which describes the field
   */
  constructor(
    model: ConstructorOf<TModelProp>,
    options: foundry.data.fields.DataFieldOptions<
      SourceFromSchema<TModelProp["schema"]["fields"]>,
      TRequired,
      TNullable,
      THasInitial
    > = {},
    context: Record<string, unknown> & {recursion?: number} = {}
  ) {
    //@ts-expect-error - This is correct
    if (!fu.isSubclass(model, foundry.abstract.DataModel)) {
      throw new Error("An EmbeddedDataField must specify a DataModel class as its type");
    }

    const recursion = context.recursion ?? 0;

    // Create an independent copy of the model schema
    //@ts-expect-error - This is correct
    const fields = model.defineSchema(recursion + 1);
    //@ts-expect-error - This is correct
    super(fields, options, context);

    /**
     * The base DataModel definition which is contained in this field.
     * @type {typeof DataModel}
     */
    this.model = model;
  }

  
  override clean(value: unknown, options?: foundry.data.fields.CleanFieldOptions) {
    return super.clean(value, { ...options, source: value as object });
  }

  override validate(value: unknown, options?: foundry.data.fields.DataFieldValidationOptions) {
    return super.validate(value, { ...options, source: value as object });
  }

  override initialize(value: unknown, model?: ConstructorOf<TModelProp>, options: object = {}): foundry.data.fields.MaybeSchemaProp<TModelProp, TRequired, TNullable, THasInitial> {
    if (!value) return value as foundry.data.fields.MaybeSchemaProp<TModelProp, TRequired, TNullable, THasInitial>;
    const m = new this.model(value, { parent: model, ...options });
    Object.defineProperty(m, "schema", { value: this });
    return m;
  }

  override toObject(value: TModelProp) {
    if (!value) return value;
    return value.toObject(false);
  }

  override has(fieldName: string): boolean {
    if(fieldName === 'children') return true;
    return super.has(fieldName);
  }

  //@ts-expect-error - This is correct
  migrateSource(sourceData, fieldData) {
    //@ts-expect-error - This is correct
    if (fieldData) this.model.migrateDataSafe(fieldData);
  }

  override _validateModel(changes: SourceFromSchema<TModelProp["schema"]["fields"]>) {
    //@ts-expect-error - This is correct
    this.model.validateJoint(changes);
  }
}

export { RecursiveEmbeddedDataField };