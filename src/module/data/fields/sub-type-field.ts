
//@ts-nocheck
export class SubTypeDataField extends foundry.data.fields.TypeDataField {
    /**
     * Return the package that provides the sub-type for the given model.
     * @param {DataModel} model       The model instance created for this sub-type.
     * @returns {System|Module|null}
     */
    static override getModelProvider(model: foundry.abstract.Document) {
        const document = model.parent;
        if (!document) return null;
        const documentClass = document.constructor as ConstructorOf<foundry.abstract.Document>;
        const type = document.subtype;
        if (!documentClass.TYPES.includes(type)) return null;

        // Core-defined sub-type
        const coreTypes = documentClass.metadata.coreTypes;
        if (coreTypes.includes(type)) return null;

        // System-defined sub-type
        const documentName = documentClass.documentName;
        const systemTypes = game.system.template[documentName]?.types;
        if (systemTypes?.includes(type)) return game.system;

        // Module-defined sub-type
        const moduleId = type.substring(0, type.indexOf("."));
        return game.modules.get(moduleId) ?? null;
    }

    override getInitialValue(data) {
        const cls = this.getModelForType(data.subtype);
        if (cls) return cls.cleanData();
        const template = game?.model[this.documentName]?.[data.type];
        if (template) return foundry.utils.deepClone(template);
        return {};
    }

    override _cleanType(value, options) {
        if (!(typeof value === "object")) value = {};

        // Use a defined DataModel
        const type = options.source?.subtype;
        const cls = this.getModelForType(type);
        if (cls) return cls.cleanData(value, { ...options, source: value });
        if (options.partial) return value;

        // Use the defined template.json
        const template = this.getInitialValue(options.source);
        const insertKeys = (type === CONST.BASE_DOCUMENT_TYPE) || !game?.system?.template.strictDataCleaning;
        return mergeObject(template, value, { insertKeys, inplace: true });
    }

    override initialize(value, model, options = {}) {
        const cls = this.getModelForType(model._source.subtype);
        if (cls) {
            const instance = new cls(value, { parent: model, ...options });
            if (!("modelProvider" in instance)) Object.defineProperty(instance, "modelProvider", {
                value: this.constructor.getModelProvider(instance),
                writable: false
            });
            return instance;
        }
        return deepClone(value);
    }

    override _validateType(data, options = {}) {
        const result = super._validateType(data, options);
        if (result !== undefined) return result;
        const cls = this.getModelForType(options.source?.subtype);
        const schema = cls?.schema;
        return schema?.validate(data, { ...options, source: data });
    }

    override _validateModel(changes, options = {}) {
        const cls = this.getModelForType(options.source?.subtype);
        return cls?.validateJoint(changes);
    }

    /**
     * Migrate this field's candidate source data.
     * @param {object} sourceData   Candidate source data of the root model
     * @param {any} fieldData       The value of this field within the source data
     */
    override migrateSource(sourceData, fieldData) {
        const cls = this.getModelForType(sourceData.subtype);
        if (cls) cls.migrateDataSafe(fieldData);
    }
}