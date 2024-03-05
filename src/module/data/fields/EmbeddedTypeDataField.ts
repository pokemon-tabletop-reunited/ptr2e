export class EmbeddedTypeDataField extends foundry.data.fields.EmbeddedDataField {
    declare model: ConstructorOf<foundry.abstract.TypeDataModel> & {TYPES: string[], DATA_MODELS: Record<string, ConstructorOf<foundry.abstract.TypeDataModel>>};

    constructor(model: typeof foundry.abstract.TypeDataModel, options: object = {}) {
        if (!fu.isSubclass(model, foundry.abstract.TypeDataModel)) {
            throw new Error("EmbeddedTypeDataField requires a valid model class");
        }
        if (!EmbeddedTypeDataField.hasTypeField(model)) {
            throw new Error("EmbeddedTypeDataField requires a valid model class with a 'type' field");
        }
        
        if(!EmbeddedTypeDataField.hasTypesField(model)) {
            throw new Error("EmbeddedTypeDataField requires a valid model class with a 'TYPES' field");
        }

        if(!EmbeddedTypeDataField.hasDataModelsField(model)) {
            throw new Error("EmbeddedTypeDataField requires a valid model class with a 'DATA_MODELS' field");
        }
        super(model, options);
    }

    static hasTypeField(model: typeof foundry.abstract.TypeDataModel) {
        return (
            'type' in model.defineSchema()
            && model.defineSchema().type instanceof foundry.data.fields.DocumentTypeField
        )
    }

    static hasTypesField<TObject extends ConstructorOf<foundry.abstract.TypeDataModel>>(model: TObject): model is TObject & {TYPES: string[]} {
        return (
            'TYPES' in model
            && Array.isArray(model.TYPES)
            && model.TYPES.every((type: unknown) => typeof type === "string")
        )
    }

    static hasDataModelsField<TObject extends ConstructorOf<foundry.abstract.TypeDataModel>>(model: TObject): model is TObject & {DATA_MODELS: Record<string, ConstructorOf<foundry.abstract.TypeDataModel>>} {
        return (
            'DATA_MODELS' in model
            && typeof model.DATA_MODELS === "object"
            && Object.values(model.DATA_MODELS as Record<string, unknown>).every((model: unknown) => fu.isSubclass(model as ConstructorOf<foundry.abstract.TypeDataModel>, foundry.abstract.TypeDataModel))
        )
    }

    override initialize(value: any, parent: ConstructorOf<foundry.abstract.DataModel>, options: any = {}): foundry.abstract.TypeDataModel {
        if (!value) return value;

        const typeField = this.fields.type;
        const type = typeField.initialize(value.type);
        if (typeof type !== "string") {
            throw new Error("EmbeddedTypeDataField requires a valid 'type' field");
        }

        if(!this.model.TYPES.includes(type)) {
            console.debug(`Type ${type} not found in ${this.model.name}.TYPES`)
            return super.initialize(value, parent, options) as foundry.abstract.TypeDataModel;
        }
        if(!(type in this.model.DATA_MODELS)) {
            console.debug(`Type ${type} not found in ${this.model.name}.DATA_MODELS`)
            return super.initialize(value, parent, options) as foundry.abstract.TypeDataModel;
        }

        const model = this.model.DATA_MODELS[type];

        const m = new model(value, { parent: parent, ...options });
        Object.defineProperty(m, "schema", { value: this });
        return m;
    }
}