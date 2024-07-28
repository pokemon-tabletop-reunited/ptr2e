type MappingFieldInitialValueBuilder = (
    key?: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initial?: any,
    existing?: Record<string, unknown>
) => object;

type MappingFieldOptions<
    TSourceProp,
    TRequired extends boolean,
    TNullable extends boolean,
    THasInitial extends boolean,
> = foundry.data.fields.DataFieldOptions<TSourceProp, TRequired, TNullable, THasInitial> & {
    initialKeys?: string[];
    initialValue?: MappingFieldInitialValueBuilder;
    initialKeysOnly?: boolean;
};

/**
 * A subclass of ObjectField that represents a mapping of keys to the provided DataField type.
 *
 * @param {DataField} model                    The class of DataField which should be embedded in this field.
 * @param {MappingFieldOptions} [options={}]   Options which configure the behavior of the field.
 * @property {string[]} [initialKeys]          Keys that will be created if no data is provided.
 * @property {MappingFieldInitialValueBuilder} [initialValue]  Function to calculate the initial value for a key.
 * @property {boolean} [initialKeysOnly=false]  Should the keys in the initialized data be limited to the keys provided
 *                                              by `options.initialKeys`?
 */
export class MappingField<
    TSourceProp extends object,
    TModelProp = TSourceProp,
    TRequired extends boolean = true,
    TNullable extends boolean = false,
    THasInitial extends boolean = true,
> extends foundry.data.fields.ObjectField<
    TSourceProp,
    TModelProp,
    TRequired,
    TNullable,
    THasInitial
> {
    model: foundry.data.fields.DataField;
    initialKeys: string[] | null;
    initialValue: MappingFieldInitialValueBuilder | null;
    initialKeysOnly: boolean;

    constructor(model: foundry.data.fields.DataField, options?: MappingFieldOptions<TSourceProp, TRequired, TNullable, THasInitial>) {
        if (!(model instanceof foundry.data.fields.DataField)) {
            throw new Error("MappingField must have a DataField as its contained element");
        }
        super(options);

        /**
         * The embedded DataField definition which is contained in this field.
         * @type {DataField}
         */
        this.model = model;
    }

    /* -------------------------------------------- */

    /** @inheritdoc */
    static override get _defaults() {
        return foundry.utils.mergeObject(super._defaults, {
            initialKeys: null,
            initialValue: null,
            initialKeysOnly: false,
        });
    }

    /* -------------------------------------------- */

    /** @inheritdoc */
    override _cleanType(value: Record<string, unknown>, options?: foundry.data.fields.CleanFieldOptions) {
        Object.entries(value).forEach(([k, v]) => (value[k] = this.model.clean(v, options)));
        return value;
    }

    /* -------------------------------------------- */

    /** @inheritdoc */
    override getInitialValue(data?: Record<string, unknown>) {
        let keys = this.initialKeys;
        const initial: Record<string, unknown> | null | undefined = super.getInitialValue(data) as Record<string, unknown> | null | undefined;
        if (!keys || !foundry.utils.isEmpty(initial)) return initial as foundry.data.fields.MaybeSchemaProp<TSourceProp, TRequired, TNullable, THasInitial>;;
        if (!(keys instanceof Array)) keys = Object.keys(keys);
        for (const key of keys) initial![key] = this._getInitialValueForKey(key);
        return initial as foundry.data.fields.MaybeSchemaProp<TSourceProp, TRequired, TNullable, THasInitial>;
    }

    /* -------------------------------------------- */

    /**
     * Get the initial value for the provided key.
     * @param {string} key       Key within the object being built.
     * @param {object} [object]  Any existing mapping data.
     * @returns {*}              Initial value based on provided field type.
     */
    _getInitialValueForKey(key: string, object?: Record<string, unknown>) {
        const initial = this.model.getInitialValue();
        return this.initialValue?.(key, initial, object) ?? initial;
    }

    /* -------------------------------------------- */

    /** @override */
    override _validateType(value: unknown, options = {}) {
        if (foundry.utils.getType(value) !== "Object") throw new Error("must be an Object");
        const errors = this._validateValues(value as Record<string, unknown>, options);
        if (!foundry.utils.isEmpty(errors)) {
            const failure = new foundry.data.validation.DataModelValidationFailure();
            failure.fields = errors;
            throw new foundry.data.validation.DataModelValidationError(failure);
        }
    }

    /* -------------------------------------------- */

    /**
     * Validate each value of the object.
     * @param {object} value     The object to validate.
     * @param {object} options   Validation options.
     * @returns An object of value-specific errors by key.
     */
    _validateValues(value: Record<string, unknown>, options: Partial<foundry.data.fields.DataFieldValidationOptions> = {}) {
        const errors: Record<string, foundry.data.validation.DataModelValidationFailure> = {};
        for (const [k, v] of Object.entries(value)) {
            const error = this.model.validate(v, options);
            if (error) errors[k] = error;
        }
        return errors;
    }

    /* -------------------------------------------- */

    /** @override */
    override initialize(value: Record<string, unknown>, model: ConstructorOf<foundry.abstract.DataModel>, options = {}) {
        if (!value) return value as foundry.data.fields.MaybeSchemaProp<TModelProp, TRequired, TNullable, THasInitial>;
        const obj: Record<string, unknown> = {};
        const initialKeys =
            this.initialKeys instanceof Array
                ? this.initialKeys
                : Object.keys(this.initialKeys ?? {});
        const keys = this.initialKeysOnly ? initialKeys : Object.keys(value);
        for (const key of keys) {
            const data = value[key] ?? this._getInitialValueForKey(key, value);
            obj[key] = this.model.initialize(data, model, options);
        }
        return obj as foundry.data.fields.MaybeSchemaProp<TModelProp, TRequired, TNullable, THasInitial>;
    }

    /* -------------------------------------------- */

    //@ts-expect-error - This is a valid check
    override _getField(path: string[]) {
        if (path.length === 0) return this;
        else if (path.length === 1) return this.model;
        path.shift();
        return this.model._getField(path);
    }
}
