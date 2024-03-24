class MappedArrayField<TElementField extends foundry.data.fields.DataField> extends foundry.data.fields.ArrayField<TElementField> {
    /**
     * The field that is used as the key for the map.
     */
    keyField: string;

    constructor(keyField: string, elementField: TElementField) {
        super(elementField);
        this.keyField = keyField;
    }

    override initialize(value: JSONValue, model: any, options: Record<string, unknown>): any {
        if (!value) return value;
        
        // if (this._isMap(value)) {
        //     const array = Array.from((value as Map<string, TElementField>).values()).map((element) => this.element.initialize(element, model, options));
        //     return array.reduce((acc: Map<string, TElementField>, element) => {
        //         acc.set((element as unknown as Record<string, string>)[this.keyField], element as TElementField);
        //         return acc;
        //     }, new Map());
        // }

        if (Array.isArray(value)) {
            return value.reduce((acc: Map<string, TElementField>, element) => {
                acc.set((element as unknown as Record<string, string>)[this.keyField], this.element.initialize(element, model, options) as TElementField);
                return acc;
            }, new Map());
        }

        return value;
    }

    override toObject(value: any): any {
        if (!value) return value;
        if (this._isMap(value)) {
            return Array.from((value as Map<string, TElementField>).values()).map((element) => this.element.toObject(element));
        }
        return super.toObject(value);
    }

    override migrateSource(sourceData: object, fieldData: any): void {
        if (this._isMap(fieldData)) {
            const array = Array.from((fieldData as Map<string, TElementField>).values());
            super.migrateSource(sourceData, array);
            return;
        }
        super.migrateSource(sourceData, fieldData);
    }

    protected _isMap(value: unknown | unknown[]): value is Map<string, unknown> {
        return (
            fu.getType(value) === "Map"
        )
    }
}

export { MappedArrayField }