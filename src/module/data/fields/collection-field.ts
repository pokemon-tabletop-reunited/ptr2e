class CollectionField<
    TElementField extends foundry.data.fields.DataField,
    TSourceProp extends Partial<
    foundry.data.fields.SourcePropFromDataField<TElementField>
    >[] = foundry.data.fields.SourcePropFromDataField<TElementField>[],
    TModelProp extends object = Collection<foundry.data.fields.ModelPropFromDataField<TElementField>>,
    TRequired extends boolean = false,
    TNullable extends boolean = false,
    THasInitial extends boolean = true,
> extends foundry.data.fields.ArrayField<TElementField, TSourceProp, TModelProp, TRequired, TNullable, THasInitial > {
    /**
     * The field that is used as the key for the map.
     */
    keyField: string;

    constructor(elementField: TElementField, keyField: string = "slug", options: Partial<foundry.data.fields.ArrayFieldOptions<TSourceProp, TRequired, TNullable, THasInitial>> = {}) {
        super(elementField, options);
        this.keyField = keyField;
    }

    override initialize(value: JSONValue, model: any, options: Record<string, unknown>): any {
        if (!value) return value;

        if (Array.isArray(value)) {
            return value.reduce((acc: Collection<TElementField>, element) => {
                acc.set((element as unknown as Record<string, string>)[this.keyField], this.element.initialize(element, model, options) as TElementField);
                return acc;
            }, new Collection());
        }

        return value;
    }
}

export { CollectionField }