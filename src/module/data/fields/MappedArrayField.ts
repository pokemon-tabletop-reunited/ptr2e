class MappedArrayField<TElementField extends foundry.data.fields.DataField> extends foundry.data.fields.ArrayField<TElementField> {
    /**
     * The field that is used as the key for the map.
     */
    keyField: string;

    constructor(keyField: string, elementField: TElementField) {
        super(elementField);
        this.keyField = keyField;
    }


    // override _cast(value: unknown): unknown {
    //     const t = fu.getType(value);
    //     if (t === "Map") {
    //         return Array.from((value as Map<string, TElementField>).values());
    //     }
    //     return super._cast(value);
    // }

    // override _cleanType(value: unknown, options?: Record<string,unknown> | undefined): unknown {
    //     if (this._isMap(value)) {
    //         const cleanedArray = super._cleanType(Array.from((value as Map<string, TElementField>).values()), options) as TElementField[];
    //         return cleanedArray.reduce((acc, element) => {
    //             acc.set((element as unknown as Record<string, string>)[this.keyField], element);
    //             return acc;
    //         }, new Map<string, TElementField>());
    //     }
    //     return super._cleanType(value, options);
    // }

    // protected override _validateType(value: unknown, options?: Record<string, unknown> | undefined): void | foundry.data.validation.DataModelValidationFailure {
    //     if (fu.getType(value) !== "Map") {
    //         super._validateType(value, options);
    //         return;
    //     }
    //     return this._validateElements(value as unknown[], options);
    // }

    // protected override _validateElements(value: unknown[], options?: Record<string, unknown> | undefined): void | foundry.data.validation.DataModelValidationFailure {
    //     if (this._isMap(value)) {
    //         const arrayFailure = new foundry.data.validation.DataModelValidationFailure();

    //         const keySet = new Set<string>();
    //         for (const [key, element] of value.entries()) {
    //             if(keySet.has(key as unknown as string)) {
    //                 arrayFailure.unresolved = true;
    //                 arrayFailure.elements.push({ id: key, failure: new foundry.data.validation.DataModelValidationFailure({invalidValue: key, dropped: true, unresolved: false, message: "Duplicate key"})});
    //                 continue;
    //             }
    //             keySet.add(key as unknown as string);
    //             const failure = this._validateElement(element, options);
    //             if (failure) {
    //                 arrayFailure.elements.push({ id: key, failure })
    //                 arrayFailure.unresolved ||= failure.unresolved;
    //             }
    //         }
    //         if (arrayFailure.elements.length > 0) return arrayFailure;
    //         return;
    //     }
    //     return super._validateElements(value, options);
    // }

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

    // override apply(fn: string | ((field: this, value?: unknown, options?: Record<string, unknown> | undefined) => unknown), data?: object | undefined, options?: Record<string, unknown> | undefined): unknown {
    //     if (this._isMap(data)) {
    //         const mappedArray = Array.from((data as Map<string, TElementField>).values());
    //         const array = super.apply(fn, mappedArray, options) as TElementField[];
    //         return array.reduce((acc: Map<string, TElementField>, element) => {
    //             acc.set((element as unknown as Record<string, string>)[this.keyField], element);
    //             return acc;
    //         }, new Map());
    //     }
    //     return super.apply(fn, data, options);
    // }

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