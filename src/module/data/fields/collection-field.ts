class CollectionField<
  TElementField extends foundry.data.fields.DataField,
  TSourceProp extends Partial<
    foundry.data.fields.SourcePropFromDataField<TElementField>
  >[] = foundry.data.fields.SourcePropFromDataField<TElementField>[],
  TModelProp extends object = Collection<foundry.data.fields.ModelPropFromDataField<TElementField>>,
  TRequired extends boolean = false,
  TNullable extends boolean = false,
  THasInitial extends boolean = true,
> extends foundry.data.fields.ArrayField<TElementField, TSourceProp, TModelProp, TRequired, TNullable, THasInitial> {
  /**
   * The field that is used as the key for the map.
   */
  keyField: string;

  constructor(elementField: TElementField, keyField = "slug", options: Partial<foundry.data.fields.ArrayFieldOptions<TSourceProp, TRequired, TNullable, THasInitial>> = {}) {
    super(elementField, options);
    this.keyField = keyField;
  }

  override initialize(value: JSONValue, model: ConstructorOf<foundry.abstract.DataModel>, options: foundry.data.fields.ArrayFieldOptions<TSourceProp, TRequired, TNullable, THasInitial>): foundry.data.fields.MaybeSchemaProp<TModelProp, TRequired, TNullable, THasInitial> {
    //@ts-expect-error - This is a copy of the original method, but with the Collection type added to the return type  
    if (!value) return value;

    if (Array.isArray(value)) {
      return value.reduce((acc: Collection<TElementField>, element) => {
        const initializedElement = this.element.initialize(element, model, options) as TElementField;
        acc.set((element as unknown as Record<string, string>)[this.keyField] ?? (initializedElement as unknown as Record<string, string>)[this.keyField], initializedElement);
        return acc;
      }, new Collection());
    }

    //@ts-expect-error - This is a copy of the original method, but with the Collection type added to the return type
    return value;
  }
}

export { CollectionField }